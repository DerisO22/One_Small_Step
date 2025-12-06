(module
    (import "Math" "exp" (func $exp (param f32) (result f32)))

    ;; Main consolidated physics step function
    (func $physics_step (export "physics_step")
        ;; Input params (current state)
        (param $current_pos_y f32)
        (param $current_vel_x f32)
        (param $current_vel_y f32)
        (param $current_mass f32)
        (param $current_pitch f32)
        (param $current_angular_vel f32)
        (param $current_fuel f32)
        (param $mission_time f32)
        (param $delta f32)
        (param $ramp_multiplier f32)
        
        ;; Constants (passed as params)
        (param $drag_coefficient f32)
        (param $exhaust_velocity f32)
        (param $burn_rate f32)
        (param $throttle f32)
        (param $dry_mass f32)
        (param $moment_of_inertia f32)
        (param $gimbal_torque f32)
        (param $surface_gravity f32)
        (param $earth_radius f32)
        (param $rocket_radius f32)
        (param $max_acceleration f32)
        (param $max_velocity f32)
        
        ;; Output: 
        ;; Results array layout (9 floats = 36 bytes):
        ;; [0] new_vel_x
        ;; [1] new_vel_y
        ;; [2] new_fuel
        ;; [3] new_mass
        ;; [4] altitude
        ;; [5] physics_pitch
        ;; [6] damped_angular_vel
        ;; [7] target_pitch
        ;; [8] visual_pitch_delta
        (result i32)
        
        ;; Local vars
        (local $altitude f32)
        (local $distance_from_center f32)
        (local $speed f32)
        (local $air_density f32)
        (local $ref_area f32)
        (local $drag_force f32)
        (local $gravity_accel f32)
        (local $gravity_force f32)
        (local $mass_flow_rate f32)
        (local $thrust_force f32)
        (local $net_force f32)
        (local $acceleration f32)
        (local $new_velocity f32)
        (local $fuel_consumed f32)
        (local $new_fuel f32)
        (local $new_mass f32)
        (local $target_pitch f32)
        (local $pitch_error f32)
        (local $control_torque f32)
        (local $angular_acceleration f32)
        (local $new_angular_vel f32)
        (local $damped_angular_vel f32)
        (local $physics_pitch f32)
        (local $thrust_vertical f32)
        (local $thrust_horizontal f32)
        (local $net_force_vertical f32)
        (local $horizontal_acceleration f32)
        (local $new_horizontal_velocity f32)
        (local $visual_pitch_delta f32)
        (local $pi f32)
        (local $exponent f32)
        
        ;; Constants
        (f32.const 3.1415968)
        (local.set $pi)
        
        ;; Calculate altitude
        (local.get $current_pos_y)
        (f32.const 0)
        (f32.max)
        (local.set $altitude)
        
        ;; Distance from center
        (local.get $earth_radius)
        (local.get $altitude)
        (f32.add)
        (local.set $distance_from_center)
        
        ;; Speed
        (local.get $current_vel_y)
        (f32.abs)
        (local.set $speed)
        
        ;; Air density: ρ = ρ₀ * e^(-h/H)
        (local.get $altitude)
        (f32.const 8500)
        (f32.div)
        (f32.neg)
        (local.set $exponent)
        
        (local.get $exponent)
        (call $exp)
        (f32.const 1.225)
        (f32.mul)
        (local.set $air_density)
        
        ;; Reference area: π * r²
        (local.get $rocket_radius)
        (local.get $rocket_radius)
        (f32.mul)
        (local.get $pi)
        (f32.mul)
        (local.set $ref_area)
        
        ;; Drag force: 0.5 * Cd * ρ * v² * A
        (local.get $drag_coefficient)
        (f32.const 0.5)
        (f32.mul)
        (local.get $air_density)
        (f32.mul)
        (local.get $ref_area)
        (f32.mul)
        (local.get $speed)
        (local.get $speed)
        (f32.mul)
        (f32.mul)
        (f32.const 1000000)
        (f32.min)
        (local.set $drag_force)
        
        ;; Gravity acceleration with altitude variation
        (local.get $surface_gravity)
        (local.get $earth_radius)
        (local.get $distance_from_center)
        (f32.div)
        (f32.const 2)
        (call $f32_pow)
        (f32.mul)
        (local.set $gravity_accel)
        
        ;; Gravity force
        (local.get $current_mass)
        (local.get $gravity_accel)
        (f32.mul)
        (local.set $gravity_force)
        
        ;; Mass flow rate
        (local.get $burn_rate)
        (local.get $throttle)
        (f32.mul)
        (local.set $mass_flow_rate)
        
        ;; Thrust force
        (local.get $mass_flow_rate)
        (local.get $exhaust_velocity)
        (f32.mul)
        (local.set $thrust_force)
        
        ;; Calculate target pitch
        (block $pitch_done
            (local.get $mission_time)
            (f32.const 10)
            (f32.le)
            (br_if $pitch_done)
            
            (local.get $mission_time)
            (f32.const 40)
            (f32.le)
            (if
                (then
                    (local.get $pi)
                    (f32.const 4)
                    (f32.div)
                    (local.get $mission_time)
                    (f32.const 10)
                    (f32.sub)
                    (f32.const 50)
                    (f32.div)
                    (f32.mul)
                    (local.set $target_pitch)
                )
                (else
                    (local.get $pi)
                    (f32.const 2)
                    (f32.div)
                    (local.get $mission_time)
                    (f32.const 40)
                    (f32.sub)
                    (f32.const 90)
                    (f32.div)
                    (f32.const 1)
                    (f32.min)
                    (f32.mul)
                    (local.set $target_pitch)
                )
            )
        )
        
        ;; Control torque
        (local.get $target_pitch)
        (local.get $current_pitch)
        (f32.sub)
        (local.set $pitch_error)
        
        (local.get $pitch_error)
        (local.get $gimbal_torque)
        (f32.mul)
        (local.set $control_torque)
        
        ;; Angular acceleration
        (local.get $control_torque)
        (local.get $moment_of_inertia)
        (f32.div)
        (f32.const 1000)
        (f32.div)
        (local.set $angular_acceleration)
        
        ;; New angular velocity
        (local.get $angular_acceleration)
        (local.get $delta)
        (local.get $ramp_multiplier)
        (f32.mul)
        (f32.mul)
        (local.get $current_angular_vel)
        (f32.add)
        (local.set $new_angular_vel)
        
        ;; Damped angular velocity
        (local.get $new_angular_vel)
        (f32.const 0.9)
        (f32.mul)
        (local.set $damped_angular_vel)
        
        ;; Physics pitch
        (local.get $new_angular_vel)
        (local.get $delta)
        (local.get $ramp_multiplier)
        (f32.mul)
        (f32.mul)
        (local.get $current_pitch)
        (f32.add)
        (local.set $physics_pitch)
        
        ;; Visual pitch delta
        (local.get $damped_angular_vel)
        (local.get $delta)
        (local.get $ramp_multiplier)
        (f32.mul)
        (f32.mul)
        (f32.const 200)
        (f32.mul)
        (local.set $visual_pitch_delta)
        
        ;; Decompose thrust
        (local.get $thrust_force)
        (local.get $physics_pitch)
        (call $f32_cos)
        (f32.mul)
        (local.set $thrust_vertical)
        
        (local.get $thrust_force)
        (local.get $physics_pitch)
        (call $f32_sin)
        (f32.mul)
        (f32.neg)
        (local.set $thrust_horizontal)
        
        ;; Net vertical force
        (local.get $thrust_vertical)
        (local.get $drag_force)
        (f32.sub)
        (local.get $gravity_force)
        (f32.sub)
        (local.set $net_force_vertical)
        
        ;; Vertical acceleration
        (local.get $net_force_vertical)
        (local.get $current_mass)
        (f32.div)
        (local.get $ramp_multiplier)
        (f32.mul)
        (local.get $max_acceleration)
        (f32.neg)
        (local.get $max_acceleration)
        (call $f32_clamp)
        (local.set $acceleration)
        
        ;; New vertical velocity
        (local.get $acceleration)
        (local.get $delta)
        (local.get $ramp_multiplier)
        (f32.mul)
        (f32.mul)
        (local.get $current_vel_y)
        (f32.add)
        (local.get $max_velocity)
        (f32.neg)
        (local.get $max_velocity)
        (call $f32_clamp)
        (local.set $new_velocity)
        
        ;; Ground collision check
        (local.get $altitude)
        (f32.const 0)
        (f32.le)
        (if
            (then
                (local.get $new_velocity)
                (f32.const 0)
                (f32.lt)
                (if
                    (then
                        (f32.const 0)
                        (local.set $new_velocity)
                    )
                )
            )
        )
        
        ;; Horizontal acceleration
        (local.get $thrust_horizontal)
        (local.get $current_mass)
        (f32.div)
        (local.get $ramp_multiplier)
        (f32.mul)
        (local.set $horizontal_acceleration)
        
        ;; New horizontal velocity
        (local.get $horizontal_acceleration)
        (local.get $delta)
        (local.get $ramp_multiplier)
        (f32.mul)
        (f32.mul)
        (local.get $current_vel_x)
        (f32.add)
        (local.set $new_horizontal_velocity)
        
        ;; Update fuel and mass
        (local.get $mass_flow_rate)
        (local.get $delta)
        (local.get $ramp_multiplier)
        (f32.mul)
        (f32.mul)
        (local.set $fuel_consumed)
        
        (local.get $current_fuel)
        (local.get $fuel_consumed)
        (f32.sub)
        (f32.const 0)
        (f32.max)
        (local.set $new_fuel)
        
        (local.get $dry_mass)
        (local.get $new_fuel)
        (f32.add)
        (local.set $new_mass)
        
        ;; Store results in memory at offset 0
        (i32.const 0)
        (local.get $new_horizontal_velocity)
        (f32.store)
        
        (i32.const 4)
        (local.get $new_velocity)
        (f32.store)
        
        (i32.const 8)
        (local.get $new_fuel)
        (f32.store)
        
        (i32.const 12)
        (local.get $new_mass)
        (f32.store)
        
        (i32.const 16)
        (local.get $altitude)
        (f32.store)
        
        (i32.const 20)
        (local.get $physics_pitch)
        (f32.store)
        
        (i32.const 24)
        (local.get $damped_angular_vel)
        (f32.store)
        
        (i32.const 28)
        (local.get $target_pitch)
        (f32.store)
        
        (i32.const 32)
        (local.get $visual_pitch_delta)
        (f32.store)
        
        ;; Return pointer to results
        (i32.const 0)
    )
    
    ;; Helper functions
    (func $f32_pow (param $base f32) (param $exp f32) (result f32)
        (local $result f32)
        (local $i i32)
        (local $exp_int i32)

        ;; Set result to 1
        (f32.const 1)
        (local.set $result)

        ;; Initialize counter
        (i32.const 0)
        (local.set $i)

        ;; Convert exp to int and store
        (local.get $exp)
        (i32.trunc_f32_s)
        (local.set $exp_int)

        (block $break
            (loop $pow_loop
                ;; Check if i < exp_int (both i32)
                (local.get $i)
                (local.get $exp_int)
                (i32.ge_s)
                (br_if $break)

                ;; Multiply result by base
                (local.get $result)
                (local.get $base)
                (f32.mul)
                (local.set $result)

                ;; Increment counter
                (local.get $i)
                (i32.const 1)
                (i32.add)
                (local.set $i)

                (br $pow_loop)
            )
        )

        (local.get $result)
    )
    
    (func $f32_cos (param $angle f32) (result f32)
        ;; Simple approximation using Taylor series (first 3 terms)
        (local $x2 f32)
        (local $x4 f32)
        
        (local.get $angle)
        (local.get $angle)
        (f32.mul)
        (local.set $x2)
        
        (local.get $x2)
        (local.get $x2)
        (f32.mul)
        (local.set $x4)
        
        (f32.const 1)
        (local.get $x2)
        (f32.const 2)
        (f32.div)
        (f32.sub)
        (local.get $x4)
        (f32.const 24)
        (f32.div)
        (f32.add)
    )
    
    (func $f32_sin (param $angle f32) (result f32)
        ;; Simple approximation using Taylor series (first 3 terms)
        (local $x2 f32)
        (local $x3 f32)
        (local $x5 f32)
        
        (local.get $angle)
        (local.get $angle)
        (f32.mul)
        (local.set $x2)
        
        (local.get $angle)
        (local.get $x2)
        (f32.mul)
        (local.set $x3)
        
        (local.get $x3)
        (local.get $x2)
        (f32.mul)
        (local.set $x5)
        
        (local.get $angle)
        (local.get $x3)
        (f32.const 6)
        (f32.div)
        (f32.sub)
        (local.get $x5)
        (f32.const 120)
        (f32.div)
        (f32.add)
    )
    
    (func $f32_clamp (param $value f32) (param $min f32) (param $max f32) (result f32)
        (local.get $value)
        (local.get $min)
        (f32.max)
        (local.get $max)
        (f32.min)
    )
    
    ;; Memory to store results (9 floats = 36 bytes)
    (memory (export "memory") 1)
)
