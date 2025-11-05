import { RigidBody } from "@react-three/rapier"
import { useGLTF } from "@react-three/drei"

const LaunchPad = () => {
    const { scene } = useGLTF('./launchPad.glb', true, false);

    return (
        <RigidBody type="dynamic" colliders={false}>
            <primitive 
                object={ scene }
                scale={[0.5, 0.5, 0.5]}
                y-position={0.3}
            />
        </RigidBody>
    )
}

export default LaunchPad;