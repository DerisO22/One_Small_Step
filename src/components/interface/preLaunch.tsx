import { useMission } from "../../stores/useMission";
import './styles/preLaunch.css';

const PreLaunchInterface = () => {
    const mission = useMission();

    if (mission.state.launched) {
        return null;
    }
    
    return (
        <div className="preLaunchInterface_Container">
            Test
        </div>
    )
}

export default PreLaunchInterface;
