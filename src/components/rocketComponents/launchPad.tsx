import { RigidBody } from "@react-three/rapier";
import { useGLTF } from "@react-three/drei";

const LaunchPad = () => {
    const { scene } = useGLTF('./models/launch_pad_compressed-v1.glb', true, false);

    return (
        <>
            <primitive 
                    object={ scene }
                    scale={[.004, .004, .004]}
                    position={[0, 607.42, -4]}
                    rotation={[0, Math.PI, 0]}
            />
            <RigidBody type="fixed" colliders="cuboid">
                <mesh position={[-0.0185, 607.4202, -4]}>
                    <boxGeometry args={[0.04, 0.03, 0.02]}/>
                    <meshStandardMaterial color="gray"/>
                </mesh>
            </RigidBody>
        </>
    )
}

export default LaunchPad;