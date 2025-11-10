import { Text, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { RapierRigidBody, RigidBody } from "@react-three/rapier";
import { useCallback, useEffect, useRef } from "react";
import type { Group, Mesh } from "three";
import { Vector3, Camera } from "three";

const initialCameraWorldPosition = new Vector3();
const initialCameraLookAtWorldPosition = new Vector3();
const initialCameraLookAt = new Vector3();

const Rocket = () => {
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

		if(body.current && body.current.translation().y < 100){
			// body.current.applyImpulse({ x: 0, y: 0.0000375, z: 0 }, true);
		}
	}, []);

	useFrame((state) => {
		// updateFrame(state);
	})
	
	return (
		<RigidBody canSleep={true} mass={20000} restitution={0.000000000000001} linearDamping={10.3} angularDamping={2} lockRotations={false} type="dynamic" ref={body}>
			<group position={[-0.044, 608.175, -4.009]}>
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