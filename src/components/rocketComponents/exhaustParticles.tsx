import { useMemo } from 'react';

const totalParticles = 300;

const ExhaustParticles = useMemo(() => {
    const positions = new Float32Array(totalParticles * 3);

    for (let i = 0; i < totalParticles; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 0.02;
        positions[i * 3 + 1] = -Math.random() * 0.05;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
    };

    return positions;
}, []);

export default ExhaustParticles;
