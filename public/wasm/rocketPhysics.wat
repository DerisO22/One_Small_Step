(module
    (import "Math" "exp" (func $exp (param f32) (result f32)))

    ;;
    ;;
    ;;  Force Calculations
    ;;
    ;;
    ;; Atmospheric Drag
    (func $compute_atmospheric_drag (export "compute_atmospheric_drag")
        ;; Params
        (param $drag_coefficient f32)
        (param $air_density f32)
        (param $velocity f32)
        (param $reference_area f32)

        ;; Return Type
        (result f32)

        ;; Calculations
        (local.get $drag_coefficient)
        (f32.const 0.5)
        (f32.mul)

        (local.get $air_density)
        (f32.mul)

        (local.get $reference_area)
        (f32.mul)

        (local.get $velocity)
        (local.get $velocity)
        (f32.mul)
        (f32.mul)
    )

    ;; Gravity Variation
    (func $compute_gravity_variation (export "compute_gravity_variation")
        ;; Params
        (param $gravitational_constant f32)
        (param $mass_of_earth f32)
        (param $distance_from_center f32)

        ;; Return Type
        (result f32)

        ;; vars
        (local $radius_squared f32)

        ;; Calculations
        (local.get $distance_from_center)
        (local.get $distance_from_center)
        (f32.mul)
        (local.set $radius_squared)

        (local.get $gravitational_constant)
        (local.get $mass_of_earth)
        (f32.mul)

        (local.get $radius_squared)
        (f32.div)
    )

    ;; Rocket Thrust
    (func $compute_thrust (export "compute_thrust")
        ;; Params
        (param $mass_flow_rate f32)
        (param $exhaust_velocity f32)

        ;; Return Type
        (result f32)

        ;; Calculations
        (local.get $mass_flow_rate)
        (local.get $exhaust_velocity)
        (f32.mul)
    )

    ;; Net Force of Rocket
    (func $compute_net_force (export "compute_net_force")
        ;; Params
        (param $thrust_force f32)
        (param $drag_force f32)
        (param $force_of_gravity f32)

        ;; Return Type
        (result f32)

        ;; Calculations
        (local.get $thrust_force)
        (local.get $drag_force)
        (f32.sub)

        (local.get $force_of_gravity)
        (f32.sub)
    )

    ;;
    ;;
    ;;  Kinematics
    ;;
    ;;
    (func $compute_acceleration (export "compute_acceleration")
        ;; Params
        (param $net_force f32)
        (param $mass f32)

        ;; Return Type
        (result f32)

        ;; Calculations
        (local.get $net_force)
        (local.get $mass)
        (f32.div)
    )

    (func $compute_new_velocity (export "compute_new_velocity")
        ;; Params
        (param $current_velocity f32)
        (param $current_acceleration f32)
        (param $delta_time f32)

        ;; Return Type
        (result f32)

        ;; Calculations
        (local.get $current_acceleration)
        (local.get $delta_time)
        (f32.mul)

        (local.get $current_velocity)
        (f32.add)
    )

    (func $compute_new_altitude (export "compute_new_altitude")
        ;; Params
        (param $current_altitude f32)
        (param $current_velocity f32)
        (param $delta_time f32)

        ;; Return Type
        (result f32)

        ;; Calculations
        (local.get $current_velocity)
        (local.get $delta_time)
        (f32.mul)

        (local.get $current_altitude)
        (f32.add)
    )

    ;;
    ;;
    ;;  Supporting Calculations
    ;;
    ;;
    ;; Compute rocket's reference area
    (func $compute_reference_area (export "compute_reference_area")
        ;; Params
        (param $rocket_radius f32)

        ;; Return Type
        (result f32)

        (local $pi f32)

        (f32.const 3.1415968)
        (local.set $pi)

        ;; Calculations
        (local.get $rocket_radius)
        (local.get $rocket_radius)
        (f32.mul)

        (local.get $pi)
        (f32.mul)
    )

    (func $compute_air_density (export "compute_air_density")
        ;; Params
        (param $altitude f32)

        ;; Return Type
        (result f32)

        ;; Helper values:
        ;; sea level air density = 1.225 kg/m^3
        ;; scale height = 8,500 meters
        ;; e = 2.71728
        (local $sea_level_air_density f32)
        (local $scale_height f32)
        (local $exponent f32)

        (f32.const 1.225)
        (local.set $sea_level_air_density)

        (f32.const 8500)
        (local.set $scale_height)

        ;; Calculations
        (local.get $altitude)
        (local.get $scale_height)
        (f32.div)
        (f32.neg)
        (local.set $exponent)

        (local.get $exponent)
        (call $exp)

        (local.get $sea_level_air_density)
        (f32.mul)
    )

    (func $compute_mass_flow_rate (export "compute_mass_flow_rate")
        ;; Params
        (param $burn_rate f32)
        (param $throttle f32)

        ;; Return Type
        (result f32)

        ;; Calculations
        (local.get $burn_rate)
        (local.get $throttle)
        (f32.mul)
    )

    ;;
    ;;
    ;;  Rotational Physics
    ;;
    ;;
    (func $compute_first_half_target_pitch (export "compute_first_half_target_pitch")
        ;; Pararms
        (param $missionTime f32)

        ;; Return Type
        (result f32)

        (local $pi f32)
        (f32.const 3.1415968)
        (local.set $pi)

        ;; Calculations
        ;; PI / 4
        (local.get $pi)
        (f32.const 4)
        (f32.div)
        
        (local.get $missionTime)
        (f32.const 10)
        (f32.sub)
        (f32.const 50)
        (f32.div)

        (f32.mul)
    )

    (func $compute_second_half_target_pitch (export "compute_second_half_target_pitch")
        ;; Params
        (param $additionalTime f32)

        ;; Return Type
        (result f32)

        (local $pi f32)
        (f32.const 3.1415968)
        (local.set $pi)

        ;; Calcualtions
        (local.get $pi)
        (f32.const 4)
        (f32.div)
        (f32.const 2)
        (f32.mul)

        (local.get $additionalTime)
        (f32.const 90)
        (f32.div)
        (f32.const 1)
        (f32.min)

        (f32.mul)
    )
)