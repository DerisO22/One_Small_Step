import { useCallback, useState } from "react";
import type { MissionState } from "../utils/types/missionTypes";

export const useMission = () => {
    const [ state, setState ] = useState<MissionState>({
        launched: false,
        missionTime: 0,
        altitude: 0,
        velocity: 0,
        fuel: 18000,
        mass: 20000
    });

    const launch = useCallback(() => {
        setState(prev => ({ ...prev, launched: true }));
    }, []);

    const updateMissionData = useCallback((updates: Partial<MissionState>) => {
        setState(prev => ({ ...prev, ...updates }));
    }, []);

    const reset = useCallback(() => {
        setState({
            launched: false,
            missionTime: 0,
            altitude: 0,
            velocity: 0,
            fuel: 18000,
            mass: 20000
        })
    }, []);

    return { state, launch, updateMissionData, reset };
}

