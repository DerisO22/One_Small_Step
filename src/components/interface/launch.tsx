import { useMission } from "../../stores/MissionContext";

const LaunchInterface = () => {
    const { state } = useMission();

    if (!state.launched && state.fuel < 0) {
        return null;
    }

    return (
        <div className="endLaunchInterface_Container">
            
        </div>
    )
}

export default LaunchInterface;