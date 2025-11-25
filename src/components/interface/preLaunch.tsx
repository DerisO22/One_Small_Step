import { useEffect, useRef, useState } from "react";
import { useMission } from "../../stores/MissionContext";
import './styles/preLaunch.css';
import '../../index.css';
import { Leva } from "leva";

const PreLaunchInterface = () => {
    const [ instructions_visible, setInstructions_visible ] = useState<boolean>(false);
    const { state, launch } = useMission();
    const rocketLaunchSound = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (state.launched && rocketLaunchSound.current) {
            // Reset audio to beginning before playing
            rocketLaunchSound.current.currentTime = 0;
            rocketLaunchSound.current.play().catch((error) => {
                console.error('Failed to play launch sound:', error);
            });
        } else if (!state.launched && rocketLaunchSound.current) {
            // Stop and reset audio when mission is reset
            rocketLaunchSound.current.pause();
            rocketLaunchSound.current.currentTime = 0;
        }
    }, [state.launched]);

    useEffect(() => {
        rocketLaunchSound.current = new Audio('/sfx/InitLaunch.wav');
        rocketLaunchSound.current.volume = 0.4;
        rocketLaunchSound.current.load();

        return () => {
            if (rocketLaunchSound.current) {
                rocketLaunchSound.current.pause();
                rocketLaunchSound.current = null;
            }
        };
    }, []);

    const toggle_Instructions = () => {
        setInstructions_visible(prev => !prev);

        if (state.launched && rocketLaunchSound.current) {
            rocketLaunchSound.current.play().catch((error) => {
                console.error('Failed to play launch sound:', error);
            });
        }
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
                        <div onClick={launch} className="launch_button">Launch</div>    
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