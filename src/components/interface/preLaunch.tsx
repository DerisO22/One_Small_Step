import { useEffect, useState } from "react";
import { useMission } from "../../stores/MissionContext";
import './styles/preLaunch.css';
import '../../index.css';
import { Leva } from "leva";

const PreLaunchInterface = () => {
    const [ instructions_visible, setInstructions_visible ] = useState<boolean>(false);
    const { state, launch } = useMission();

    useEffect(() => {

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