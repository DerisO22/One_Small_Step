import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Text } from '@react-three/drei';
import { Mesh } from 'three';
import { useWasm } from '../../hooks/useWasm.ts';
import Rocket from '../rocketComponents/rocket.tsx';
import Earth from './Earth.tsx';
import LaunchPad from '../rocketComponents/launchPad.tsx';
import Moon from './Moon.tsx';
import { useMission } from '../../stores/useMission.ts';
import PreLaunchInterface from '../interface/preLaunch.tsx';

function WasmBox() {
    const meshRef = useRef<Mesh>(null);
    const [result, setResult] = useState(0);
    const { wasm, loading, error } = useWasm('/wasm/test.wasm');
    const mission = useMission();

    // Handle the initial launch of the rocket (space bar)
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if(e.code === 'Space' && !mission.state.launched){
                mission.launch();
            }
        }
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [mission])

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
            <Rocket launched={mission.state.launched} missionState={mission.state} updateMission={mission.updateMissionData}/>
            <LaunchPad />

            {/* Space System */}
            <Earth />
            <Moon />
        </>
    )
}

export default WasmBox;