import { Text, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { RapierRigidBody, RigidBody } from "@react-three/rapier";
import { useCallback, useEffect, useMemo, useRef } from "react";
import type { Mesh } from "three";
import { Vector3, Camera } from "three";
import * as THREE from "three";
import type { RocketProps } from "../../utils/types/missionTypes";
import { useWasm } from "../../hooks/useWasm";
import { useControls } from "leva";
import RocketExhaustFlames from "./rocketExhaustFlames";
import { useCameraMode } from "../../stores/CameraContext";
import { CameraAngles } from "../../utils/consts/cameraAngles";

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
    const { scene } = useGLTF('./models/rocketship_compressed-v1.glb', true, false);
	const { wasm } = useWasm('/wasm/rocketPhysics.wasm');

	// Camera Mode
	const { cameraMode } = useCameraMode();
	
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
			MOMENT_OF_INERTIA: { value: 30000, min: 10000, max: 200000, step: 1000 },
			GIMBAL_TORQUE: { value: 12500, min: 0, max: 20000, step: 100 },
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

	// Debug Menu Options / States
	const { DRAG_COEFFICIENT, EXHAUST_VELOCITY, BURN_RATE, THROTTLE, DRY_MASS, MOMENT_OF_INERTIA, GIMBAL_TORQUE } = useControls("Rocket Options", debug_rocket_options);
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

	// Reset the rockets position, velocity, and rotations
	useEffect(() => {
		if (!launched && body.current) {
			body.current.setTranslation({ x: 0, y: 0, z: 0}, true);
			body.current.setLinvel({ x: 0, y: 0, z: 0 }, true);

			body.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
			missionState.visualPitch = 0;
			const quaternion = new THREE.Quaternion();
			quaternion.setFromAxisAngle(new Vector3(0, 0, 1), 0);
			body.current.setRotation(quaternion, true);

			// Reset physics frame tracking
			firstPhysicsFrame.current = true;
			physicsFrameCount.current = 0;
		}
	}, [launched, missionState])

	const updateFrame = useCallback(({ camera, delta }: { camera: Camera; delta: number }) => {
		// CAMERA
		if(!cameraPosition.current) return;
        cameraPosition.current.getWorldPosition(cameraWorldPosition.current);

		if(cameraMode !== 2){
			camera.position.lerp(cameraWorldPosition.current, 0.9);
		}
        
        if (cameraTarget.current) {
            cameraTarget.current.getWorldPosition(cameraLookAtWorldPosition.current);
            cameraLookAt.current.lerp(cameraLookAtWorldPosition.current, 0.9);
            camera.lookAt(cameraLookAt.current);
        }

		if(launched && body.current && missionState.fuel > 0 && wasm && wasm.physics_step && wasm.memory) {
			// Clamp delta time to prevent absurd values
			const safeDelta = Math.min(delta, MAX_DELTA);
			missionState.missionTime += safeDelta;
			
			// Skip first frame to avoid huge delta time spike
			if (firstPhysicsFrame.current) {
				firstPhysicsFrame.current = false;
				physicsFrameCount.current = 0;
				return;
			}

			physicsFrameCount.current++;
			
			// Smooth ramp-up over first 2000 frames (~3 seconds) to prevent spike
			const rampMultiplier = Math.min(physicsFrameCount.current / 2000, 1.0);
			
			// Get current state from Rapier
			const currentPos = body.current.translation();
			const currentVel = body.current.linvel();
			const currentMass = missionState.mass;
			const currentPitch = missionState.pitchAngle ?? 0;
			const currentAngularVel = missionState.angularVelocity ?? 0;
			
			// Check for NaN or invalid values
			if (!isFinite(currentPos.y) || !isFinite(currentVel.y) || !isFinite(currentMass)) {
				console.error('Invalid physics state detected!', { currentPos, currentVel, currentMass });
				return;
			}
			
			// Call consolidated WASM physics function
			const resultPtr = wasm.physics_step(
				// Current state
				currentPos.y,
				currentVel.x,
				currentVel.y,
				currentMass,
				currentPitch,
				currentAngularVel,
				missionState.fuel,
				missionState.missionTime,
				safeDelta,
				rampMultiplier,
				
				// Constants
				DRAG_COEFFICIENT,
				EXHAUST_VELOCITY,
				BURN_RATE,
				THROTTLE,
				DRY_MASS,
				MOMENT_OF_INERTIA,
				GIMBAL_TORQUE,
				SURFACE_GRAVITY,
				EARTH_RADIUS,
				ROCKET_RADIUS,
				MAX_ACCELERATION,
				MAX_VELOCITY
			);
			
			// Read results from WASM memory
			const memoryBuffer = new Float32Array(wasm.memory.buffer, resultPtr, 9);
			const newHorizontalVelocity = memoryBuffer[0];
			const newVelocity = memoryBuffer[1];
			const newFuel = memoryBuffer[2];
			const newMass = memoryBuffer[3];
			const altitude = memoryBuffer[4];
			const physicsPitch = memoryBuffer[5];
			const dampedAngularVel = memoryBuffer[6];
			const targetPitch = memoryBuffer[7];
			const visualPitchDelta = memoryBuffer[8];
			
			// Apply velocities to rigid body
			body.current.setLinvel({ 
				x: newHorizontalVelocity,
				y: newVelocity, 
				z: 0 
			}, true);
			
			// Update visual pitch
			missionState.visualPitch += visualPitchDelta;
			
			// Update mission state
			updateMission({
				fuel: newFuel,
				missionTime: missionState.missionTime,
				mass: newMass,
				altitude: altitude,
				velocity: newVelocity,
				pitchAngle: physicsPitch,
				angularVelocity: dampedAngularVel,
				targetPitch: targetPitch,
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
			lockRotations={false}
			type={launched ? "kinematicVelocity" : "kinematicPosition"}
			ref={body}
		>
			<group position={[-0.017, 607.435, -4.001]} rotation={[0, 0, missionState.visualPitch]}>
				<primitive
					object={ scene }
					scale={[.0008, .0008, .0008]}
				/>
				{ missionState.altitude ? <></> :
					<Text color="white" fontSize={0.008} rotation={[0, Math.PI, 0]} position={[-0.03, 0.04, 0]}>
						Saturn V
					</Text>
				}
				{/* 0.3, 0.1, -0.15 reg cam position */}
				<group ref={cameraTarget} position-z={CameraAngles[cameraMode].cameraTargetZ}/>
            	<group ref={cameraPosition} 
					position-y={CameraAngles[cameraMode].y} 
					position-z={CameraAngles[cameraMode].z} />

				<RocketExhaustFlames />
			</group>
		</RigidBody>
    )
}

export default Rocket;