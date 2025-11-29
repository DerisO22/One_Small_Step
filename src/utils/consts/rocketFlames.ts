// Custom shader for flame-like particles
export const flameShaderMaterial = {
    vertexShader: `
        attribute float size;
        attribute vec3 customColor;
        varying vec3 vColor;
        
        void main() {
            vColor = customColor;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = size * (300.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
        }
    `,
    fragmentShader: `
        varying vec3 vColor;
        
        void main() {
            // Create circular gradient
            vec2 center = gl_PointCoord - vec2(0.5);
            float dist = length(center);
            
            // Soft circular falloff
            float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
            alpha = pow(alpha, 2.0); // Make edges softer
            
            // Add some brightness variation from center to edge
            float brightness = 1.0 - (dist * 1.2);
            brightness = max(brightness, 0.0);
            
            vec3 finalColor = vColor * (0.8 + brightness * 0.5);
            
            gl_FragColor = vec4(finalColor, alpha * 0.9);
        }
    `
};