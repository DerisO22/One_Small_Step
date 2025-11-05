import { useGLTF } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import { useEffect, useRef } from "react";
import type { Group, Mesh } from "three";

const Rocket = () => {
	const body = useRef<Group | null>(null);
    const { scene } = useGLTF('./rocketship.glb', true, false);

	 // Add shadows to entire character model
	 useEffect(() => {
        scene.traverse((child) => {
			if((child as Mesh).isMesh){
                child.castShadow = true;
                child.receiveShadow = true;
            }
        })
    }, [scene])
	
	return (
		<RigidBody type="dynamic">
			<group ref={body}>
				<primitive
					object={ scene }
					scale={[0.1, 0.1, 0.1]}
				/>
			</group>
			
		</RigidBody>
    )
}

export default Rocket;