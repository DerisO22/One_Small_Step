import { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";
import type { MissionContextType, MissionState } from "../utils/types/missionTypes";

const MissionContext = createContext<MissionContextType | undefined>(undefined);

interface MissionProviderProps {
    children: ReactNode,
}

export const MissionProvider = ({children}: MissionProviderProps) => {
    const [ state, setState ] = useState<MissionState>({
        launched: false,
        missionTime: 0,
        altitude: 0,
        velocity: 0,
        fuel: 24000,
        mass: 26000,
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
            fuel: 24000,
            mass: 26000,
        })
    }, []);

    return (
        <MissionContext.Provider value={{ state, launch, updateMissionData, reset }}>
            {children}
        </MissionContext.Provider>
    )
}
    
export const useMission = () => {
    const context = useContext(MissionContext);
    if(context === undefined){
        throw new Error('useMission must be used within a MissionProvider');
    }
    return context;
}
