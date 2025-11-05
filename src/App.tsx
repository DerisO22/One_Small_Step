import { Canvas } from '@react-three/fiber'
import { OrbitControls, Sky, Stars } from '@react-three/drei'
import Scene from './components/sceneComponents/Scene.tsx';
import { Physics } from '@react-three/rapier';
import { skyConfig } from './utils/skyConfig.ts';

function App() {
	return (
		<div style={{ width: '100vw', height: '100vh' }}>
			<Canvas
				camera={{ position: [3, 5, 5], fov: 90 }}
				shadows
			>
				{/* Actual Level */}
				<Physics debug={true}>
					<Scene />
				</Physics>
				
				{/* Lighting, Background, and Camera */}
				<Sky 
					distance={300} 
					sunPosition={[0, -200, 0]}
					inclination={skyConfig.inclination}
					azimuth={skyConfig.azimuth}
					mieCoefficient={skyConfig.mieCoefficient}
					mieDirectionalG={skyConfig.mieDirectionalG}
					rayleigh={skyConfig.rayleigh}
					turbidity={skyConfig.turbidity}
				/>
				<Stars 
					radius={1} 
					depth={50} 
					count={1000} 
					factor={1.2} 
					saturation={10} 
					fade={true}
					speed={1}
            	/>
				<OrbitControls enableDamping dampingFactor={0.05} />
			</Canvas>
		</div>
	)
}

export default App;