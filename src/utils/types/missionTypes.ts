export interface MissionContextType {
    state: MissionState,
    launch: () => void,
    updateMissionData: (updates: Partial<MissionState>) => void,
    reset: () => void
}

export interface MissionState {
    launched: boolean,
    missionTime: number,
    altitude: number,
    velocity: number,
    fuel: number,
    mass: number,
    pitchAngle: number,
    visualPitch: number,
    angularVelocity: number,
    targetPitch: number,
};

export interface RocketProps {
    launched: boolean,
    missionState: MissionState,
    updateMission: (updates: Partial<MissionState>) => void,
};