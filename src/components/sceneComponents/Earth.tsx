import { RigidBody } from "@react-three/rapier";
import { useRef } from "react";
import { Mesh } from "three";
import AtmosphereMesh from "./AtmosphereMesh";
import EarthMaterial from "./EarthMaterial";

/**
 * Scale of System 1:100 in kilometers
 * 1 r3f  unit = 100km
 */

const Earth = () => {
    const earthRef = useRef<Mesh>(null);
    // 6,371 km -> 637.1 r3f units
    const radius = 637.1

    return (
        <>
            <RigidBody type="fixed" colliders="ball" position={[0, -0.18, 0]}>
                <mesh rotation={[0, 0, 0]} position={[0,-29.82,-4]} ref={earthRef}>
                    <icosahedronGeometry args={[radius, 32]} />
                    <EarthMaterial />
                </mesh>
                
            </RigidBody>
            <AtmosphereMesh radius={radius * 1.02}/>
        </>
        
    )
}

export default Earth;