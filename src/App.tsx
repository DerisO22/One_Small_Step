import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import Scene from './components/sceneComponents/Scene.tsx';

function App() {
	return (
		<div style={{ width: '100vw', height: '100vh' }}>
			<Canvas
				camera={{ position: [3, 5, 5], fov: 90 }}
				shadows
			>
				<Scene />
				<OrbitControls enableDamping dampingFactor={0.05} />
			</Canvas>
		</div>
	)
}

export default App;