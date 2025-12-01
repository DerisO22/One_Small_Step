import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useMission } from "../../stores/MissionContext";
import { useFrame } from "@react-three/fiber";
import { flameShaderMaterial } from "../../utils/consts/rocketFlames";

const totalParticles = 300;

const RocketExhaustFlames = () => {
    const { state } = useMission();
    const particlesRef = useRef<THREE.Points>(null);
    const velocitiesRef = useRef<Float32Array>(new Float32Array(totalParticles * 3));

    const initParticleData = useMemo(() => {
        const positions = new Float32Array(totalParticles * 3);
        const colors = new Float32Array(totalParticles * 3);
        const sizes = new Float32Array(totalParticles);
        const velocities = velocitiesRef.current;
    
        // Adjust the positioning
        for (let i = 0; i < totalParticles; i++) {
            // Cone shape
            const height = Math.random() * 0.06;
            const radius = height * 0.1;
            const angle  = Math.random() * Math.PI * 2;

            // positions of flames
            positions[i * 3] = Math.cos(angle) * radius * Math.random();
            positions[i * 3 + 1] = -height;
            positions[i * 3 + 2] = Math.sin(angle) * radius * Math.random();

            // velocities of flames
            velocities[i * 3] = Math.cos(angle) * 0.02 * Math.random();
            velocities[i * 3 + 1] = -0.5 - Math.random() * 0.3;
            velocities[i * 3 + 2] = Math.sin(angle) * 0.02 * Math.random();

            // colors of flames
            const colorVariation = Math.random();

            if(colorVariation > 0.3) {
                // white - yellow
                colors[i * 3] = 1.0;
                colors[i * 3 + 1] = 0.95;
                colors[i * 3 + 2] = 0.7;
            } else if(colorVariation < 0.7) {
                // orange - yellow
                colors[i * 3] = 1.0;
                colors[i * 3 + 1] = 0.6;
                colors[i * 3 + 2] = 0.2;
            } else {
                // orange - red
                colors[i * 3] = 1.0;
                colors[i * 3 + 1] = 0.3;
                colors[i * 3 + 2] = 0.0;
            }

            // sizes of flames
            sizes[i] = Math.random() * 0.1;

        };
    
        return {positions, colors, sizes};
    }, []);

    useFrame((_, delta) => {
        if (!particlesRef.current || !state.launched || state.fuel <= 0) return;

        const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
        const colors = particlesRef.current.geometry.attributes.customColor.array as Float32Array;
        const velocities = velocitiesRef.current;
        const coneAngle = 50;

        for (let i = 0; i < totalParticles; i++) {
            const i3 = i * 3;
            // Update positions based on velocities
            positions[i3] += velocities[i3] * delta;
            positions[i3 + 1] += velocities[i3 + 1] * delta;
            positions[i3 + 2] += velocities[i3 + 2] * delta;
            
            velocities[i3] += velocities[i3] * coneAngle * delta;
            velocities[i3 + 2] += velocities[i3 + 2] * coneAngle * delta;

            colors[i3] = 1;
            colors[i3 + 1] = 0.2;
            colors[i3 + 2] = 0.1;
            
            // Reset particles that have moved too far down
            if (positions[i3 + 1] < -0.1) {
                const angle = Math.random() * Math.PI * 2;
                const startRadius = 0.005 * Math.random();
                
                positions[i3] = Math.cos(angle) * startRadius;
                positions[i3 + 1] = -0.03;
                positions[i3 + 2] = Math.sin(angle) * startRadius;
                
                velocities[i3] = Math.cos(angle) * 0.02 * Math.random();
                velocities[i3 + 1] = -0.5 - Math.random() * 0.3;
                velocities[i3 + 2] = Math.sin(angle) * 0.02 * Math.random();

                // reset colors to white-yellow
                colors[i3] = 1.0;
                colors[i3 + 1] = 0.95;
                colors[i3 + 2] = 0.7;
            }
        }

        particlesRef.current.geometry.attributes.position.needsUpdate = true;
    });

    return (state.launched && state.fuel > 0) ? (
        <>
            <points ref={particlesRef} position={[0, 0.02, 0]}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={totalParticles}
                        array={initParticleData.positions}
                        itemSize={3}
                        args={[initParticleData.positions, 3]}
                    />
                    <bufferAttribute
                        attach="attributes-customColor"
                        count={totalParticles}
                        array={initParticleData.colors}
                        itemSize={3}
                        args={[initParticleData.colors, 3]}
                    />
                    <bufferAttribute
                        attach="attributes-size"
                        count={totalParticles}
                        array={initParticleData.sizes}
                        itemSize={1}
                        args={[initParticleData.sizes, 3]}
                    />
                </bufferGeometry>
                <shaderMaterial
                    vertexShader={flameShaderMaterial.vertexShader}
                    fragmentShader={flameShaderMaterial.fragmentShader}
                    transparent={true}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </points>
            
            {/* Add glow to the flames */}
            <pointLight 
                position={[0, -0.05, 0]} 
                intensity={2} 
                distance={0.15} 
                color="#FF6B00" 
            />
        </>
    ) : null;
}

export default RocketExhaustFlames;