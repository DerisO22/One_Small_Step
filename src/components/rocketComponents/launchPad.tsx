import { RigidBody } from "@react-three/rapier"
import { useGLTF } from "@react-three/drei"

const LaunchPad = () => {
    const { scene } = useGLTF('./launchPad.glb', true, false);

    return (
        <>
            <primitive 
                    object={ scene }
                    scale={[.01, .01, .01]}
                    position={[0, 607.42, -4]}
                    rotation={[0, Math.PI, 0]}
            />
            <RigidBody type="fixed" colliders="cuboid">
                <mesh position={[-0.0425, 607.445, -4.01]}>
                    <boxGeometry args={[0.08, 0.03, 0.08]}/>
                    <meshStandardMaterial color="gray"/>
                </mesh>
            </RigidBody>
        </>
    )
}

export default LaunchPad;