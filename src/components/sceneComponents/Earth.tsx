import { RigidBody } from "@react-three/rapier";
import { useRef } from "react";
import { Mesh } from "three";

const Earth = () => {
    const earthRef = useRef<Mesh>(null);

    return (
        <RigidBody type="fixed" colliders="ball">
            <mesh position={[0,-30,-4]} ref={earthRef}>
                <icosahedronGeometry args={[30, 32]} />
                <meshStandardMaterial color="green" />
            </mesh>
        </RigidBody>
        
    )
}

export default Earth;