import { useRef } from "react";
import { Mesh } from "three";

const Moon = () => {
    const moonRef = useRef<Mesh>(null);

    return (
        <mesh ref={moonRef}>
            <icosahedronGeometry args={[1.5, 32]} />
            <meshStandardMaterial color="red" />
        </mesh>
    )
}

export default Moon
