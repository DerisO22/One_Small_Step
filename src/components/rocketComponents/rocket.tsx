import { Text, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { RapierRigidBody, RigidBody } from "@react-three/rapier";
import { useCallback, useEffect, useRef } from "react";
import type { Mesh } from "three";
import { Vector3, Camera } from "three";
import type { RocketProps } from "../../utils/types/missionTypes";
import { useWasm } from "../../hooks/useWasm";

const initialCameraWorldPosition = new Vector3();
const initialCameraLookAtWorldPosition = new Vector3();
const initialCameraLookAt = new Vector3();

/**
 * Scale of System 1:10
 */

// Constants for Saturn V 
const SCALE_FACTOR = 10;
const ROCKET_RADIUS = 5.05 / SCALE_FACTOR; 
const DRAG_COEFFICIENT = 0.75;

// Physics constants
const EXHAUST_VELOCITY = 2600;
const BURN_RATE = 200; 
const THROTTLE = 1.0; 
const DRY_MASS = 2000; 

// Gravity constants 
const SURFACE_GRAVITY = 9.8; 
// Earth Measurements since things are offset a bit
const EARTH_RADIUS = 637.1; 
const EARTH_CENTER_Y = -29.67; 
const SURFACE_Y = EARTH_CENTER_Y + EARTH_RADIUS; 

// Safety limits
const MAX_DELTA = 0.1; 
const MAX_VELOCITY = 12000; 
const MAX_ACCELERATION = 500; 

const Rocket = ({ launched, missionState, updateMission }: RocketProps) => {
	const body = useRef<RapierRigidBody>(null);
    const { scene } = useGLTF('./rocketship.glb', true, false);
	const { wasm, loading, error } = useWasm('/wasm/rocketPhysics.wasm');
	
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
    }, [scene])

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
			const altitude = Math.max(0, currentPos.y - SURFACE_Y); 
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
			
			// Net force (thrust upward, drag and gravity downward)
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
			
			// Apply to Rapier - only set velocity, let Rapier handle position
			body.current.setLinvel({ 
				x: 0,
				y: newVelocity, 
				z: 0 
			}, true);
			
			// Update fuel and mass
			const fuelConsumed = massFlowRate * rampedDelta;
			const newFuel = Math.max(0, missionState.fuel - fuelConsumed);
			const newMass = DRY_MASS + newFuel;
			
			// Update mission state (use actual position from Rapier for accuracy)
			updateMission({
				fuel: newFuel,
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
			<group position={[-0.044, 607.465, -4.009]}>
				<primitive
					object={ scene }
					scale={[.0025, .0025, .0025]}
				/>
				<Text color="white" fontSize={0.025} rotation={[0, Math.PI, 0]} position={[-0.1, 0.15, 0]}>
					Saturn V
				</Text>
				<group ref={cameraTarget} position-z={0.4} />
            	<group ref={cameraPosition} position-y={0.2} position-z={-0.3} />
			</group>
		</RigidBody>
    )
}

export default Rocket;