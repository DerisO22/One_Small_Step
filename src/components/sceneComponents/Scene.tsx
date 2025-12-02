import { useEffect } from 'react';
import { Text } from '@react-three/drei';
import { useWasm } from '../../hooks/useWasm.ts';
import Rocket from '../rocketComponents/rocket.tsx';
import Earth from './Earth.tsx';
import LaunchPad from '../rocketComponents/launchPad.tsx';
// import Moon from './Moon.tsx';
import { useMission } from '../../stores/MissionContext.tsx';

function WasmBox() {
    const { loading, error } = useWasm('/wasm/rocketPhysics.wasm');
    const { state, launch, updateMissionData } = useMission();

    // Handle the initial launch of the rocket (space bar)
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if(e.code === 'Space' && !state.launched){
                launch();
            }
        }
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [state.launched, launch])

    if (loading) return <Text position={[0, 0, 0]} fontSize={0.5}>Loading WASM...</Text>
    if (error) return <Text position={[0, 0, 0]} fontSize={0.3} color="red">Error: {error.message}</Text>

    return (
        <>
            {/* Lights */}
            <ambientLight intensity={0.5} />
            <directionalLight position={[100, 100, 5]} intensity={5} shadow-mapSize-height={512} shadow-mapSize-width={512} />

            {/* Launch Components */}
            <Rocket launched={state.launched} missionState={state} updateMission={updateMissionData}/>
            <LaunchPad />

            {/* Space System */}
            <Earth />
            {/* <Moon /> */}
        </>
    )
}

export default WasmBox;