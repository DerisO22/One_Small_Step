import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useMission } from "../../stores/MissionContext";
import { PointMaterial, Points } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

const totalParticles = 300;

const RocketExhaustFlames = () => {
    const { state } = useMission();
    const particlesRef = useRef<THREE.Points>(null);

    const initParticlePositions = useMemo(() => {
        const positions = new Float32Array(totalParticles * 3);
    
        for (let i = 0; i < totalParticles; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 0.02;
            positions[i * 3 + 1] = -Math.random() * 0.05;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
        };
    
        return positions;
    }, []);

    useFrame((_, delta) => {
        if (!particlesRef.current || !state.launched || state.fuel <= 0) return;

        const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;

        for (let i = 0; i < totalParticles; i++) {

            // Y position goes down
            positions[i * 3 + 1] -= delta * 0.15;

            if (positions[i * 3 + 1] < -0.05) {
                positions[i * 3] = (Math.random() - 0.5) * 0.01;
                positions[i * 3 + 1] = 0;
                positions[i * 3 + 2] = (Math.random() - 0.5) * Math.sin(Math.PI * 3);
            }
        }

        particlesRef.current.geometry.attributes.position.needsUpdate = true;
    })

    return (
        (state.launched && state.fuel > 0) ? (
            <Points ref={particlesRef} positions={initParticlePositions}>  
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        args={[initParticlePositions, 3]}
                        count={totalParticles}
                        array={initParticlePositions}
                        itemSize={3}                    />
                </bufferGeometry>
                <PointMaterial 
                    size={0.001}
                    color="#FF6B00"
                    transparent
                    opacity={0.9}
                    sizeAttenuation
                />
            </Points>
        ) : null
        
    );
}

export default RocketExhaustFlames;