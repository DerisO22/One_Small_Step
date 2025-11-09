import { RigidBody } from "@react-three/rapier";
import { useRef } from "react";
import { Mesh } from "three";
import AtmosphereMesh from "./AtmosphereMesh";
import EarthMaterial from "./EarthMaterial";

const Earth = () => {
    const earthRef = useRef<Mesh>(null);
    const radius = 637.1;

    return (
        <>
            <RigidBody 
                type="fixed" 
                colliders="ball"
                position={[0, -29.67, -4]}
            >
                <mesh rotation={[0, 0, 0]} ref={earthRef}>
                    <icosahedronGeometry args={[radius, 80]} />
                    <EarthMaterial />
                </mesh>
            </RigidBody>
            <AtmosphereMesh radius={radius * 1.02}/>
        </>
    )
}

export default Earth;