import { useLoader } from "@react-three/fiber";
import { RigidBody } from "@react-three/rapier";
import { useRef } from "react";
import { Mesh, TextureLoader } from "three";

const Moon = () => {
    const moonRef = useRef<Mesh>(null);
    const moonMaterial = useLoader(TextureLoader, '/textures/moon.jpg');
    const radius = 173.7 / 2;

    return (
        <RigidBody type="fixed">
            <mesh position={[0, 900, 0]} ref={moonRef}>
                <icosahedronGeometry args={[radius, 80]} />
                <meshStandardMaterial map={moonMaterial} />
            </mesh>
        </RigidBody>
    )
};

export default Moon;