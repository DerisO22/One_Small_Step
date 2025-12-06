import { useMission } from "../../stores/MissionContext";
import './styles/launch.css';
import '../../index.css';

const LaunchInterface = () => {
    const { state, reset } = useMission();
    
    const checkMissionOutcome: () => boolean = () => {
        if (state.altitude > 200 && state.velocity >= 7.8) {
            return true;
        }

        return false;
    };

    return (
        <>
            {(state.launched && state.fuel > 0) ? (
                <>
                    {/* Probably just velocity and altitude for now */}
                    <div className="rocket_measurements_container">
                        {/* Velocity */}
                        <div className="velocity_tracker_container">
                            <span className="velocity_tracker">Velocity</span>
                            <div className="text_xs">{String(state.velocity).slice(0, 10)}</div>
                            <span className="velocity_tracker">KM / s</span>
                        </div>    

                        {/* Altitude */}
                        <div className="altitude_tracker_container">
                            <span className="altitude_tracker">Altitude</span>
                            <span className="text_xs">{String(state.altitude).slice(0, 6)}</span>
                            <span className="velocity_tracker">KM</span>
                        </div>
                    </div>

                    {/* Timer and Fuel */}
                    <div className="launch_timer_container">
                        <span className="missionTime text">T {state.missionTime > 0 ? " + " : " - "} {state.missionTime > 0 ? String(state.missionTime).slice(0, 8) : String(state.missionTime).slice(1, 8)}</span>

                        <span className="">
                            Fuel Left
                        </span>

                        <div className="fuel_container" style={{width: (state.fuel / 154)}}></div>
                    </div>

                    <div className="low_fuel_warning_container">
                        <span className="text">Critical: Low Fuel</span>

                    </div>
                </>
            ) : (
                state.altitude > 0 ? (
                    // End Screen Interface
                    <div className="end_container">
                        <span className="end_message">Mission Outcome</span>

                        
                        
                        {/* Velocity and Altitude for checking if fail/success */}
                        <div className="mission_outcome_container">
                            <div className="outcome_stats_label_container">
                                <span className="mission_outcome_label">Time Elapsed</span>
                                <span className="mission_outcome_label">Rocket Velocity</span> 
                                <span className="mission_outcome_label">Altitude</span> 
                            </div>

                            <div className="outcome_stats_container">                            
                                <span className="mission_outcome_stat">{state.missionTime} seconds</span>
                                <span className="mission_outcome_stat">{state.velocity} km/s</span>
                                <span className="mission_outcome_stat">{state.altitude} km</span>
                            </div>
                        </div>

                        {checkMissionOutcome() ? <span className="success_text">Success</span> :  <span className="failed_text">Failed</span>}

                        <div onClick={reset} className="restart_button header1">
                            Restart
                        </div>
                    </div>
                ) : (
                    <></>
                )
            )}
        </>
    )
}

export default LaunchInterface;