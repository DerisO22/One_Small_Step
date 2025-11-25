import { Text, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { RapierRigidBody, RigidBody } from "@react-three/rapier";
import { useCallback, useEffect, useMemo, useRef } from "react";
import type { Mesh } from "three";
import { Vector3, Camera } from "three";
import type { RocketProps } from "../../utils/types/missionTypes";
import { useWasm } from "../../hooks/useWasm";
import { useControls } from "leva";

const initialCameraWorldPosition = new Vector3();
const initialCameraLookAtWorldPosition = new Vector3();
const initialCameraLookAt = new Vector3();

/**
 * Scale of System 1:10
 */

// Constants for Saturn V that won't be changeable through debug
const SCALE_FACTOR = 10;
const ROCKET_RADIUS = 5.05 / SCALE_FACTOR; 

// Earth constants that won't be changeable through debug
const EARTH_RADIUS = 637.1; 

const Rocket = ({ launched, missionState, updateMission }: RocketProps) => {
	const body = useRef<RapierRigidBody>(null);
    const { scene } = useGLTF('./rocketship.glb', true, false);
	const { wasm, loading, error } = useWasm('/wasm/rocketPhysics.wasm');
	
	/**
	 *  Leva Debug Menu Options
	 */
	const debug_rocket_options = useMemo(() => {
		return {
			DRAG_COEFFICIENT: { value: 0.75, min: 0, max: 10, step: 0.01 },
			EXHAUST_VELOCITY: { value: 2260, min: 1000, max: 4000, step: 1 },
			BURN_RATE: { value: 200, min: 50, max: 4000, step: 0.1},
			THROTTLE: { value: 1.0, min: 0.25, max: 4, step: 0.01},
			DRY_MASS: { value: 2000, min: 500, max: 5000, step: 1},
		}
	}, []);

	const debug_physics_options = useMemo(() => {
		return {
			SURFACE_GRAVITY: { value: 9.8, min: 5, max: 20, step: 0.01},
		}
	}, []);

	const debug_clamp_options = useMemo(() => {
		return {
			MAX_DELTA: { value: 0.1, min: 0.1, max: 1, step: 0.01 },
			MAX_VELOCITY: { value: 12000, min: 5000, max: 20000, step: 1 },
			MAX_ACCELERATION: { value: 0.04, min: 0.04, max: .5, step: 0.005 }
		}
	}, []);

	const { DRAG_COEFFICIENT, EXHAUST_VELOCITY, BURN_RATE, THROTTLE, DRY_MASS } = useControls("Rocket Options", debug_rocket_options);
	const { SURFACE_GRAVITY } = useControls("Earth Options", debug_physics_options);
	const { MAX_DELTA, MAX_VELOCITY, MAX_ACCELERATION } = useControls("Clamp Options", debug_clamp_options);
	
	// Camera States
	const cameraPosition = useRef<Camera | null>(null);
	const cameraTarget = useRef<Camera | null>(null);
	const cameraWorldPosition = useRef(initialCameraWorldPosition);
    const cameraLookAtWorldPosition = useRef(initialCameraLookAtWorldPosition);
    const cameraLookAt = useRef(initialCameraLookAt);

	const firstPhysicsFrame = useRef(true);
	const physicsFrameCount = useRef(0);

	// Add shadows to entire character model
	useEffect(() => {
		scene.traverse((child) => {
			if((child as Mesh).isMesh){
				child.castShadow = true;
				child.receiveShadow = true;
			}
		})
    }, [scene]);

	useEffect(() => {
		if (!launched && body.current) {
			body.current.setTranslation({ x: 0, y: 0, z: 0}, true);
			body.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
			body.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
		}
	})

	const updateFrame = useCallback(({ camera, delta }: { camera: Camera; delta: number }) => {
		// CAMERA
		if(!cameraPosition.current) return;
        cameraPosition.current.getWorldPosition(cameraWorldPosition.current);
        camera.position.lerp(cameraWorldPosition.current, 0.9);

        if (cameraTarget.current) {
            cameraTarget.current.getWorldPosition(cameraLookAtWorldPosition.current);
            cameraLookAt.current.lerp(cameraLookAtWorldPosition.current, 0.9);
            camera.lookAt(cameraLookAt.current);
        }

		// WASM Physics
		if(launched && body.current && missionState.fuel > 0 && wasm) {
			// Clamp delta time to prevent absurd values
			const safeDelta = Math.min(delta, MAX_DELTA);
			missionState.missionTime += safeDelta;
			
			// Skip first frame to avoid huge delta time spike
			if (firstPhysicsFrame.current) {
				firstPhysicsFrame.current = false;
				physicsFrameCount.current = 0;
				return;
			}
			
			// Smooth ramp-up over first 2000 frames (~3 seconds) to prevent spike
			physicsFrameCount.current++;
			const rampMultiplier = Math.min(physicsFrameCount.current / 2000, 1.0);
			
			// Also ramp up the delta time itself
			const rampedDelta = safeDelta * rampMultiplier;
			
			// Get current state from Rapier
			const currentPos = body.current.translation();
			const currentVel = body.current.linvel();
			const currentMass = missionState.mass;
			
			// Check for NaN or invalid values
			if (!isFinite(currentPos.y) || !isFinite(currentVel.y) || !isFinite(currentMass)) {
				console.error('Invalid physics state detected!', { currentPos, currentVel, currentMass });
				return;
			}
			
			// Current altitude above Earth's surface
			const altitude = Math.max(0, currentPos.y); 
			const distanceFromCenter = EARTH_RADIUS + altitude;
			
			// Current velocity
			const velocity = currentVel.y;
			const speed = Math.abs(velocity); 
			
			// Air density
			const airDensity = wasm.compute_air_density?.(altitude) ?? 1.225;
			
			// Reference area
			const refArea = wasm.compute_reference_area?.(ROCKET_RADIUS) ?? (Math.PI * ROCKET_RADIUS * ROCKET_RADIUS);
			
			// Drag force 
			let dragForce = wasm.compute_atmospheric_drag?.(
				DRAG_COEFFICIENT,
				airDensity,
				speed,
				refArea
			) ?? 0;
			
			// Clamp drag to reasonable value
			dragForce = Math.min(dragForce, 1000000); 
			
			// Gravity acceleration with altitude variation
			const gravityAccel = SURFACE_GRAVITY * Math.pow(EARTH_RADIUS / distanceFromCenter, 2);
			const gravityForce = currentMass * gravityAccel;
			
			// Mass flow rate
			const massFlowRate = wasm.compute_mass_flow_rate?.(
				BURN_RATE,
				THROTTLE
			) ?? BURN_RATE * THROTTLE;
			
			// Thrust force
			const thrustForce = wasm.compute_thrust?.(
				massFlowRate,
				EXHAUST_VELOCITY
			) ?? (massFlowRate * EXHAUST_VELOCITY);
			
			// SAFETY: Verify thrust is reasonable
			if (!isFinite(thrustForce) || thrustForce < 0) {
				console.error('Invalid thrust:', thrustForce);
				return;
			}
			
			// Net force
			const netForce = thrustForce - dragForce - gravityForce;
			
			// Calculate new physics state
			let acceleration = netForce / currentMass;
			
			// Apply ramp-up during first 2000 frames
			acceleration *= rampMultiplier;
			acceleration = Math.max(-MAX_ACCELERATION, Math.min(MAX_ACCELERATION, acceleration));

			let newVelocity = velocity + (acceleration * rampedDelta);
			newVelocity = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, newVelocity));
			
			// Ground collision check
			if (altitude <= 0 && newVelocity < 0) {
				newVelocity = 0;
			}
			
			// Apply to Rapier
			body.current.setLinvel({ 
				x: 0,
				y: newVelocity, 
				z: 0 
			}, true);
			
			// Update fuel and mass
			const fuelConsumed = massFlowRate * rampedDelta;
			const newFuel = Math.max(0, missionState.fuel - fuelConsumed);
			const newMass = DRY_MASS + newFuel;
			
			// Update mission state
			updateMission({
				fuel: newFuel,
				missionTime: missionState.missionTime,
				mass: newMass,
				altitude: altitude,
				velocity: newVelocity
			});
		}
	}, [ launched, missionState, updateMission, wasm ]);

	useFrame((state, delta) => {
		updateFrame({ camera: state.camera, delta });
	})
	
	return (
		<RigidBody 
			canSleep={false} 
			mass={missionState.mass}
			restitution={0.1} 
			linearDamping={0} 
			angularDamping={0.5} 
			lockRotations={true} 
			type={launched ? "kinematicVelocity" : "kinematicPosition"}
			ref={body}
		>
			<group position={[-0.017, 607.435, -4.001]}>
				<primitive
					object={ scene }
					scale={[.0008, .0008, .0008]}
				/>
				{ missionState.altitude ? <></> :
				<Text color="white" fontSize={0.008} rotation={[0, Math.PI, 0]} position={[-0.03, 0.04, 0]}>
					Saturn V
				</Text>
				}
				<group ref={cameraTarget} position-z={0.3} />
            	<group ref={cameraPosition} position-y={0.1} position-z={-0.15} />
			</group>
		</RigidBody>
    )
}

export default Rocket;