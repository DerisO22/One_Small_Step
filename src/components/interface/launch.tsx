import { useMission } from "../../stores/MissionContext";
import './styles/launch.css';
import '../../index.css';

const LaunchInterface = () => {
    const { state } = useMission();

    return (
        <>
            { state.launched && state.fuel > 0 ? (
                <>
                    {/* Probably just velocity and altitude for now */}
                    <div className="rocket_measurements_container">
                        {/* Velocity */}
                        <div className="velocity_tracker_container">
                            <div className="velocity_tracker">{state.velocity}</div>
                        </div>    

                        {/* Altitude */}
                        <div className="altitude_tracker_container">
                            <div className="altitude_tracker">{state.altitude}</div>
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