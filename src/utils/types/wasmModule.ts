/**
 *  Interface for holding the WASM function prototypes
 */
export interface WasmModule {
    /**
     *  physics step function
     *  Takes all current state and constants, returns pointer to results array
     */
    physics_step?: (
        // Current state
        current_pos_y: number,
        current_vel_x: number,
        current_vel_y: number,
        current_mass: number,
        current_pitch: number,
        current_angular_vel: number,
        current_fuel: number,
        mission_time: number,
        delta: number,
        ramp_multiplier: number,

        // Constants
        drag_coefficient: number,
        exhaust_velocity: number,
        burn_rate: number,
        throttle: number,
        dry_mass: number,
        moment_of_inertia: number,
        gimbal_torque: number,
        surface_gravity: number,
        earth_radius: number,
        rocket_radius: number,
        max_acceleration: number,
        max_velocity: number
    ) => number; 

    /**
     * Exported memory to read results from
     */
    memory?: WebAssembly.Memory;
}