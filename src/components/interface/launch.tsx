import { useMission } from "../../stores/useMission"

const LaunchInterface = () => {
    const mission = useMission();

    if (!mission.state.launched && mission.state.fuel < 0) {
        return null;
    }

    return (
        <div className="endLaunchInterface_Container">
            
        </div>
    )
}

export default LaunchInterface;