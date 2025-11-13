import { useMission } from "../../stores/MissionContext";
import './styles/launch.css';
import '../../index.css';

const LaunchInterface = () => {
    const { state } = useMission();

    return (
        <>
            { !state.launched && state.fuel > 0 ? (
                <>
                    {/* Probably just velocity and altitude for now */}
                    <div className="rocket_measurements_container">
                        {/* Velocity */}
                        <div className="velocity_tracker_container">
                            <span className="velocity_tracker">Velocity</span>
                            <div className="text_xs">{state.velocity}</div>
                            <span className="velocity_tracker">KM / H</span>
                        </div>    

                        {/* Altitude */}
                        <div className="altitude_tracker_container">
                            <span className="altitude_tracker">Altitude</span>
                            <span className="text_xs">{state.altitude}</span>
                            <span className="velocity_tracker">KM</span>
                        </div>
                    </div>

                    <div className="launch_timer_container">
                        <p className="missionTime text">{state.missionTime}</p>
                    </div>
                </>
            ) : (
                // End Screen Interface
                <div className="end_container">
                    
                </div>
            )}
        </>
    )
}

export default LaunchInterface;