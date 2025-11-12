import { useMission } from "../../stores/MissionContext";
import './styles/launch.css';
import '../../index.css';

const LaunchInterface = () => {
    const { state } = useMission();

    return (
        <>
            { !state.launched && state.fuel > 0 ? (
                // Probably just velocity and altitude for now
                <div className="rocket_measurements_container">
                    {/* Velocity */}
                    <div className="velocity_tracker_container">
                        <div className="velocity_tracker">Test</div>
                    </div>    

                    {/* Altitude */}
                    <div className="altitude_tracker_container">
                        <div className="altitude_tracker">Test</div>
                    </div>
                </div>
            ) : (
                // End Screen Interface
                <>

                </>
            )}
        </>
    )
}

export default LaunchInterface;