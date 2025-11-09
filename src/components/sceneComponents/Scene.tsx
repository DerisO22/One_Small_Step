import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Text } from '@react-three/drei';
import { Mesh } from 'three';
import { useWasm } from '../../hooks/useWasm.ts';
import Rocket from '../rocketComponents/rocket.tsx';
import Earth from './Earth.tsx';
import LaunchPad from '../rocketComponents/launchPad.tsx';
import Moon from './Moon.tsx';

function WasmBox() {
    const meshRef = useRef<Mesh>(null);
    const [result, setResult] = useState(0);
    // Changed: Use .wasm file and absolute path from public folder
    const { wasm, loading, error } = useWasm('/wasm/test.wasm');

    useFrame((state) => {
        if (meshRef.current && wasm?.add) {
            // Use WASM to calculate position
            const time = Math.floor(state.clock.elapsedTime);
            const calculated = wasm.add(time, 10);
            setResult(calculated);
            
            meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 2;
        }
    })

    if (loading) return <Text position={[0, 0, 0]} fontSize={0.5}>Loading WASM...</Text>
    if (error) return <Text position={[0, 0, 0]} fontSize={0.3} color="red">Error: {error.message}</Text>

    return (
        <>
            {/* Lights */}
            <ambientLight intensity={0.5} />
            <directionalLight position={[100, 100, 5]} intensity={5} />

            {/* Launch Components */}
            <Rocket />
            <LaunchPad />

            {/* Space System */}
            <Earth />
            <Moon />

            {/* Display WASM Result */}
            <Text position={[-4, 3, 0]} fontSize={0.5} color="white">
                WASM Result: {result}
            </Text>
        </>
    )
}

export default WasmBox;