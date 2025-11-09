import { useLoader } from "@react-three/fiber";
import { RigidBody } from "@react-three/rapier";
import { useRef } from "react";
import { Mesh, TextureLoader } from "three";

const Moon = () => {
    const moonRef = useRef<Mesh>(null);
    const moonMaterial = useLoader(TextureLoader, '/textures/moon.jpg');

    return (
        <RigidBody>
            <mesh ref={moonRef}>
                <icosahedronGeometry args={[1.5, 32]} />
                <meshStandardMaterial map={moonMaterial} />
            </mesh>
        </RigidBody>
    )
}

export default Moon
