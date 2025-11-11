import { useEffect, useState } from "react";
import { useMission } from "../../stores/MissionContext";
import './styles/preLaunch.css';

const PreLaunchInterface = () => {
    const [ instructions_visible, setInstructions_visible ] = useState<boolean>(false);
    // Gotta make this into a global context instead of just the hook
    // so I can make sure all components can get that missionState
    const { state, launch } = useMission();

    useEffect(() => {

    }, [state.launched]);

    const toggle_Instructions = () => {
        setInstructions_visible(prev => !prev);
    };

    return (
        <>
            {!state.launched ? (
                <div className="preLaunchInterface_Container">
                    <div className="instructions_button_container">
                        <div onClick={toggle_Instructions} className="instructions_button"></div>
                    </div>

                    {instructions_visible ? (
                        <div className="instructions">
                            test
                        </div>
                    ) : (<></>)}

                    <div className="launch_button_container">
                        <div onClick={launch} className="launch_button">Launch</div>    
                    </div>
                    
                </div>
            ) : null}
        </>
    );
}

export default PreLaunchInterface;
