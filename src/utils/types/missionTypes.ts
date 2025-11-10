export interface MissionState {
    launched: boolean,
    missionTime: number,
    altitude: number,
    velocity: number,
    fuel: number,
    mass: number
};

export interface RocketProps {
    launched: boolean,
    missionState: MissionState,
    updateMission: (updates: Partial<MissionState>) => void,
};