import { RigidBody } from "@react-three/rapier"
import { useGLTF } from "@react-three/drei"

const LaunchPad = () => {
    const { scene } = useGLTF('./launchPad.glb', true, false);

    return (
        <RigidBody type="fixed">
            <primitive 
                object={ scene }
                scale={[0.5, 0.5, 0.5]}
                position={[0, 33.1, -4]}
                rotation={[0, Math.PI, 0]}
            />
        </RigidBody>
    )
}

export default LaunchPad;