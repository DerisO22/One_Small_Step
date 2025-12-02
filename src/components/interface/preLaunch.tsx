import { useEffect, useRef, useState } from "react";
import { useMission } from "../../stores/MissionContext";
import './styles/preLaunch.css';
import '../../index.css';
import { Leva } from "leva";
import { startCountdown } from "../../utils/functions/startCountdown";

const PreLaunchInterface = () => {
    const [ instructions_visible, setInstructions_visible ] = useState<boolean>(false);
    const { state, launch } = useMission();
    const rocketLaunchSound = useRef<HTMLAudioElement | null>(null);
    const hasPlayedOnce = useRef<boolean>(false);

    useEffect(() => {
        rocketLaunchSound.current = new Audio('/sfx/InitLaunch.wav');
        rocketLaunchSound.current.volume = 0.4;
        rocketLaunchSound.current.load();

        const handleTimeUpdate = () => {
            if (!rocketLaunchSound.current || !state.launched) return;

            const audio = rocketLaunchSound.current;
            const duration = audio.duration;
            const currentTime = audio.currentTime;

            if (hasPlayedOnce.current && currentTime >= duration - 2) {
                audio.currentTime = Math.max(0, duration - 5);
            } else if (!hasPlayedOnce.current && currentTime >= duration - 5) {
                hasPlayedOnce.current = true;
            }
        }

        rocketLaunchSound.current?.addEventListener('timeupdate', handleTimeUpdate);

        return () => {
            if (rocketLaunchSound.current) {
                rocketLaunchSound.current.removeEventListener('timeupdate', handleTimeUpdate);
                rocketLaunchSound.current.pause();
                rocketLaunchSound.current = null;
            }
        };
    }, [state.launched]);

    useEffect(() => {
        if (state.launched && rocketLaunchSound.current) {
            // Reset audio to beginning before playing
            rocketLaunchSound.current.currentTime = 0;
            hasPlayedOnce.current = false;
            rocketLaunchSound.current.play().catch((error) => {
                console.error('Failed to play launch sound:', error);
            });
        } else if (!state.launched && rocketLaunchSound.current) {
            // Stop and reset audio when mission is reset
            rocketLaunchSound.current.pause();
            rocketLaunchSound.current.currentTime = 0;
            hasPlayedOnce.current = false;
        }
    }, [state.launched]);

    const toggle_Instructions = () => {
        setInstructions_visible(prev => !prev);
    };

    return (
        <>
            {!state.launched ? (
                <>
                    <div className="instructions_button_container">
                        <div onClick={toggle_Instructions} className="instructions_button"></div>
                    </div>

                    {instructions_visible ? (
                        <div className="instructions">
                            <p className="header1">Welcome to the Rocket Launch Simulation</p>
                            <p className="text">Your goal is getting this rocket into Low-Earth Orbit !</p>
                            <p className="text">You can adjust the rocket's properties by clicking on the rocket icon in the top left</p>
                            <p className="text">After you're all set, click the launch button or press the spacebar</p>
                            <p className="header2">Goodluck, We're counting on You !</p>
                        </div>
                    ) : (<></>)}

                    <div className="launch_button_container">
                        <div onClick={() => {
                            launch();
                            startCountdown();
                        }} className="launch_button">Launch</div>    
                    </div>

                    {/* Debug Menu */}
					<div className='levaDebug_Menu'>
						{state.launched ? <></> : <Leva fill collapsed/>}
					</div>
                </>
            ) : null}
        </>
    );
}

export default PreLaunchInterface;