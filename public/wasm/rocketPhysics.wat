(module
    ;;
    ;; Compute Atmospheric Drag
    ;; formula being used:
    ;; 
    (func $compute_atmospheric_drag (export "compute_atmospheric_drag")
        ;; Params
        (param $drag_coefficient f32)
        (param $air_density f32)
        (param $velocity f32)
        (param $reference_area f32)

        ;; Return Type
        (result f32)

        (local.get $drag_coefficient)
        (local.get $air_density)
        (f32.add)
    )

    ;;
    ;; Compute rocket's reference area
    ;; formula being used:
    ;;
    (func $compute_reference_area (export "compute_reference_area")
        ;; Params
        (param $volume_of_rocket f32)

        ;; Return Type
        (result f32)

        (local.get $volume_of_rocket)
        (f32.const 2)
        (f32.mul)
    )

    ;;
    ;;
    ;;
    ;;
    (func $compute_gravity_variation (export "compute_gravity_variation")
        ;; Params
        (param $gravitational_constant f32)
        (param $mass_of_earth f32)
        (param $distance_from_center f32)

        ;; Return Type
        (result f32)

        (local.get $gravitational_constant)
        (f32.const 2)
        (f32.mul)
    )

    ;;
    ;; Compute the rocket's thrust
    ;; formula being used:
    ;;
    (func $compute_thrust (export "compute_thrust")
        ;; Params
        (param $mass_flow_rate f32)
        (param $exhaust_velocity f32)

        ;; Return Type
        (result f32)

        (local.get $exhaust_velocity)
        (f32.const 2)
        (f32.mul)
    )

    ;;
    ;; Compute Net Force of Rocket
    ;; Formula being used:
    ;; Net_Force = F_Thrust - F_Drag - F_Gravity
    ;;
    (func $compute_net_force (export "compute_net_force")
        ;; Params
        (param $thrust_force f32)
        (param $drag_force f32)
        (param $force_of_gravity f32)

        ;; Return Type
        (result f32)

        ;; Calculation
        (local.get $thrust_force)
        (local.get $drag_force)
        (i32.sub)
        
        (local.get $force_of_gravity)
        (i32.sub)
    )
)