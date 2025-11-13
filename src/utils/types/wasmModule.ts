export interface WasmModule {
    add?: (a: number, b: number) => number;

    /**
     * 
     *   Atmospheric Drag (and supporting wasm functions)
     * 
     */
    compute_atmospheric_drag?: (
        drag_coefficient: number, 
        air_density: number, 
        velocity: number,
        reference_area: number
    ) => number;

    // Calculate reference_area
    compute_reference_area?: (
        volume_of_rocket: number,
    ) => number;

    /**
     * 
     *   Gravity Variation
     * 
     */
    compute_gravity_variation?: (
        gravitational_constant: number,
        mass_of_earth: number,
        distance_from_center: number
    ) => number;

    /**
     * 
     *   Thrust and Mass Flow
     * 
     */
    compute_thrust?: (
        mass_flow_rate: number,
        exhaust_velocity: number,
    ) => number

    /**
     * 
     *   Net Force
     *   NF = F_Thrust - F_drag - F_gravity
     * 
     */
    compute_net_force?: (
        thrust_force: number,
        drag_force: number,
        force_of_gravity: number
    ) => number

    /**
     * 
     *   More supporting equations that 
     *   I initially didn't think about
     * 
     */
}