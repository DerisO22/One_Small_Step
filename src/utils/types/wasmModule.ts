/**
 * Interface for holding the WASM function prototypes
 */
export interface WasmModule {
    /**
     * 
     *   Force-Related Calculations
     * 
     */
    // Atmospheric Drag (and supporting wasm functions)
    compute_atmospheric_drag?: (
        drag_coefficient: number, 
        air_density: number, 
        velocity: number,
        reference_area: number
    ) => number;

    // Gravity Variation
    compute_gravity_variation?: (
        gravitational_constant: number,
        mass_of_earth: number,
        distance_from_center: number
    ) => number;

    compute_thrust?: (
        mass_flow_rate: number,
        exhaust_velocity: number,
    ) => number

    // Net Force
    compute_net_force?: (
        thrust_force: number,
        drag_force: number,
        force_of_gravity: number
    ) => number

    /**
     * 
     *   Kinematics
     * 
     */
    // Acceleration
    compute_acceleration?: (
        net_force: number,
        mass: number,
    ) => number;

    compute_new_velocity?: (
        current_velocity: number,
        current_acceleration: number,
        delta_time: number
    ) => number;

    compute_horizontal_acceleration?: (
        thrust_horizontal: number,
        current_mass: number,
        ramp_multiplier: number,
    ) => number;

    compute_new_horizontal_velocity?: (
        current_horizontal_velocity: number,
        horizontal_acceleration: number,
        ramped_delta: number
    ) => number;

    compute_new_altitude?: (
        current_altitude: number,
        velocity: number,
        delta_time: number,
    ) => number;

    /**
     * 
     *   Other Supporting Calculations
     * 
     */
    // Calculate reference_area
    compute_reference_area?: (
        rocket_radius: number,
    ) => number;

    compute_air_density?: (
        altitude: number,
    ) => number

    compute_mass_flow_rate?: (
        burn_rate: number,
        throttle: number,
    ) => number

    /**
     *   Guidance and Control (Rotational Physics)
     */
    compute_first_half_target_pitch?: (
        missionTime: number
    ) => number;
    
    compute_second_half_target_pitch?: (
        additionalTime: number,
    ) => number;

    compute_angular_acceleration?: (
        torque: number,
        moment_of_interia: number,
    ) => number;

    compute_new_angular_velocity?: (
        current_angular_vel: number,
        angular_acceleration: number,
        ramped_delta: number,
    ) => number;

    compute_physics_pitch?: (
        current_pitch: number,
        new_angular_vel: number,
        ramped_delta: number
    ) => number;    


}