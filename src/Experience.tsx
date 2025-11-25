import { Canvas } from '@react-three/fiber'
import { OrbitControls, Sky, Stars } from '@react-three/drei'
import Scene from './components/sceneComponents/Scene.tsx';
import { Physics } from '@react-three/rapier';
import { skyConfig } from './utils/consts/skyConfig.ts';
import PreLaunchInterface from './components/interface/preLaunch.tsx';
import LaunchInterface from './components/interface/launch.tsx';
import { MissionProvider } from './stores/MissionContext.tsx';

function App() {
	return (
		<>
			<MissionProvider>
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
							rotateSpeed={0.01}
							panSpeed={.01}
							zoomSpeed={.001}
							// minDistance={10}
							// maxDistance={500}
						/>
					</Canvas>
				</div>

				<PreLaunchInterface />
				<LaunchInterface />
			</MissionProvider>
			
		</>
		
	)
}

export default App;