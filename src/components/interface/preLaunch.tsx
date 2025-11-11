import { useEffect } from "react";
import { useMission } from "../../stores/useMission";
import './styles/preLaunch.css';

const PreLaunchInterface = () => {
    const mission = useMission();

    useEffect(() => {

    }, [mission.state.launched]);

    return (
        <>
            {!mission.state.launched ? (
                <div className="preLaunchInterface_Container">
                    Test
                </div>
            ) : null}
        </>
    );
}

export default PreLaunchInterface;
