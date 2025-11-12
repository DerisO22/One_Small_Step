import { useMission } from "../../stores/MissionContext";

const rocketExhaustFlames = () => {
    const { state } = useMission();

    return (
        (state.launched && state.fuel > 0) ? (
            <>

            </>
        ) : null
        
    );
}

export default rocketExhaustFlames
