import { useLoader } from "@react-three/fiber";
import { RigidBody } from "@react-three/rapier";
import { useRef } from "react";
import { Mesh, TextureLoader } from "three";
import AtmosphereMesh from "./AtmosphereMesh";
import EarthMaterial from "./EarthMaterial";

const Earth = () => {
    const earthRef = useRef<Mesh>(null);
    const radius = 63.71

    return (
        <RigidBody type="fixed" colliders="ball">
            <mesh rotation={[0, 0, 0]} position={[0,-30,-4]} ref={earthRef}>
                <icosahedronGeometry args={[radius, 32]} />
                <EarthMaterial />
            </mesh>
            <AtmosphereMesh radius={radius * 1.02}/>
        </RigidBody>
    )
}

export default Earth;