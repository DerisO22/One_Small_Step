import { Text, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { RapierRigidBody, RigidBody } from "@react-three/rapier";
import { useCallback, useEffect, useRef } from "react";
import type { Mesh } from "three";
import { Vector3, Camera } from "three";
import type { RocketProps } from "../../utils/types/missionTypes";

const initialCameraWorldPosition = new Vector3();
const initialCameraLookAtWorldPosition = new Vector3();
const initialCameraLookAt = new Vector3();

const Rocket = ({ launched, missionState, updateMission }: RocketProps) => {
	const body = useRef<RapierRigidBody>(null);
    const { scene } = useGLTF('./rocketship.glb', true, false);
	
	// Camera States
	const cameraPosition = useRef<Camera | null>(null);
	const cameraTarget = useRef<Camera | null>(null);
	const cameraWorldPosition = useRef(initialCameraWorldPosition);
    const cameraLookAtWorldPosition = useRef(initialCameraLookAtWorldPosition);
    const cameraLookAt = useRef(initialCameraLookAt);

	// Add shadows to entire character model
	useEffect(() => {
		scene.traverse((child) => {
			if((child as Mesh).isMesh){
				child.castShadow = true;
				child.receiveShadow = true;
			}
		})
    }, [scene])

	const updateFrame = useCallback(({ camera }: { camera: Camera }) => {
		// CAMERA
		if(!cameraPosition.current) return;
        cameraPosition.current.getWorldPosition(cameraWorldPosition.current);
        camera.position.lerp(cameraWorldPosition.current, 0.1);

        if (cameraTarget.current) {
            cameraTarget.current.getWorldPosition(cameraLookAtWorldPosition.current);
            cameraLookAt.current.lerp(cameraLookAtWorldPosition.current, 0.1);
            camera.lookAt(cameraLookAt.current);
        }

		// Update the rocket during launch
		if(launched && body.current && missionState.fuel > 0) {
			const thrustForce = 0.0000367;
			body.current.applyImpulse({ x: 0, y: thrustForce, z: 0 }, true);

			const burnRate = 2000 * (1/60);
			const newFuel = Math.max(0, missionState.fuel - burnRate);
			const newMass = 2000 + newFuel;

			const currentAltitude = body.current.translation().y;

			updateMission({
				fuel: newFuel,
				mass: newMass,
				altitude: currentAltitude,
			})
		}
	}, [ launched, missionState, updateMission ]);

	useFrame((state) => {
		updateFrame(state);
	})
	
	return (
		<RigidBody 
			canSleep={false} 
			mass={missionState.mass} 
			restitution={0.1} 
			linearDamping={0} 
			angularDamping={0.5} 
			lockRotations={true} 
			type={launched ? "dynamic" : "kinematicPosition"} 
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