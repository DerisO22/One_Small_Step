import { Canvas } from '@react-three/fiber'
import { OrbitControls, Sky, Stars } from '@react-three/drei'
import Scene from './components/sceneComponents/Scene.tsx';
import { Physics } from '@react-three/rapier';
import { skyConfig } from './utils/consts/skyConfig.ts';
import PreLaunchInterface from './components/interface/preLaunch.tsx';
import LaunchInterface from './components/interface/launch.tsx';

function App() {
	return (
		<>
			<div style={{ width: '100vw', height: '100vh' }}>
				<Canvas
					camera={{ position: [1000, 1000, 5], fov: 90 }}
					shadows
				>
					{/* Actual Level */}
					<Physics debug={false}>
						<Scene />
					</Physics>
					
					{/* Lighting, Background, and Camera */}
					<Sky 
						distance={10000} 
						sunPosition={[0, -200, 0]}
						inclination={skyConfig.inclination}
						azimuth={skyConfig.azimuth}
						mieCoefficient={skyConfig.mieCoefficient}
						mieDirectionalG={skyConfig.mieDirectionalG}
						rayleigh={skyConfig.rayleigh}
						turbidity={skyConfig.turbidity}
					/>
					<Stars 
						radius={500} 
						depth={10} 
						count={1000} 
						factor={20} 
						saturation={10} 
						fade={true}
						speed={1}
					/>
					<OrbitControls 
						enableDamping 
						dampingFactor={0.05}
						rotateSpeed={0.1}
						panSpeed={0.1}
						zoomSpeed={.1}
						// minDistance={10}
						// maxDistance={500}
					/>
				</Canvas>
			</div>

			<PreLaunchInterface />
			<LaunchInterface />
		</>
		
	)
}

export default App;