import { RigidBody } from "@react-three/rapier"
import { useGLTF } from "@react-three/drei"

const LaunchPad = () => {
    const { scene } = useGLTF('./launchPad.glb', true, false);

    return (
        <>
            <primitive 
                    object={ scene }
                    scale={[.01, .01, .01]}
                    position={[0, 607, -4]}
                    rotation={[0, Math.PI, 0]}
            />
            <RigidBody type="fixed" colliders="cuboid">
                <mesh position={[-0.0425, 607.04, -4.01]}>
                    <boxGeometry args={[0.06, 0.03, 0.04]}/>
                    <meshStandardMaterial color="gray"/>
                </mesh>
            </RigidBody>
        </>
        
    )
}

export default LaunchPad;