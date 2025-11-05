import { RigidBody } from "@react-three/rapier";
import { useRef } from "react";
import { Mesh } from "three";
import AtmosphereMesh from "./AtmosphereMesh";
import EarthMaterial from "./EarthMaterial";

/**
 * Scale of System 1:1000 in kilometers
 * 1 r3f  unit = 1000km
 */

const Earth = () => {
    const earthRef = useRef<Mesh>(null);
    // 6,371 km -> 63.71 r3f units
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