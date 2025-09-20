import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Stats } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from '@react-three/postprocessing';
import { ArrayVisualization } from './ArrayVisualization';
import { PointerVisualization } from './PointerVisualization';
import { TreeVisualization } from './TreeVisualization';
import { GraphVisualization } from './GraphVisualization';
import { useVisualizationStore } from '../../store/visualizationStore';

const Scene3D: React.FC = () => {
  const { arrays, pointers, currentStep, codeSteps, swapAnimation } = useVisualizationStore();

  // Get highlighted indices from current step
  const currentStepData = codeSteps[currentStep];
  const highlightedIndices = currentStepData?.highlightedIndices || [];

  return (
    <div className="w-full h-full">
      <Canvas 
        shadows 
        gl={{ 
          antialias: true, 
          alpha: false,
          powerPreference: "high-performance"
        }}
        dpr={[1, 2]}
        camera={{ position: [0, 8, 16], fov: 60 }}
      >
        <color attach="background" args={['#0a0f1c']} />
        
        {/* Enhanced Lighting Setup */}
        <ambientLight intensity={0.6} color="#ffffff" />
        
        <directionalLight
          position={[12, 12, 8]}
          intensity={1.5}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={50}
          shadow-camera-left={-15}
          shadow-camera-right={15}
          shadow-camera-top={15}
          shadow-camera-bottom={-15}
          color="#ffffff"
        />
        
        <pointLight position={[-10, 8, -8]} intensity={1.0} color="#3b82f6" distance={20} decay={2} />
        <pointLight position={[10, 8, 8]} intensity={1.0} color="#8b5cf6" distance={20} decay={2} />
        
        {/* Enhanced Controls */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxPolarAngle={Math.PI / 2.2}
          minPolarAngle={Math.PI / 8}
          minDistance={8}
          maxDistance={30}
          enableDamping={true}
          dampingFactor={0.05}
          rotateSpeed={0.8}
          zoomSpeed={0.8}
          panSpeed={0.8}
        />
        
        {/* Visualizations with enhanced positioning and swap animations */}
        <Suspense fallback={null}>
          {arrays.length > 0 ? (
            arrays.map((array, index) => (
              <ArrayVisualization 
                key={`${array.name}-${index}`} 
                array={array} 
                highlightedIndices={highlightedIndices}
                swapAnimation={swapAnimation}
              />
            ))
          ) : (
            // Default array when no code is parsed
            <ArrayVisualization 
              array={{
                name: 'Sample Array',
                values: [64, 34, 25, 12, 22, 11, 90],
                position: [0, 0, 0],
                color: '#3b82f6'
              }}
              highlightedIndices={[]}
              swapAnimation={swapAnimation}
            />
          )}
          
          {pointers.length > 0 && pointers.map((pointer, index) => (
            <PointerVisualization 
              key={`${pointer.name}-${index}`} 
              pointer={pointer}
              arrayLength={arrays[0]?.values.length || 7}
              arrayPosition={arrays[0]?.position || [0, 0, 0]}
            />
          ))}
        </Suspense>
        
        {/* Enhanced Ground plane */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, 0]} receiveShadow>
          <planeGeometry args={[40, 40]} />
          <meshLambertMaterial 
            color="#1e293b" 
            opacity={0.8} 
            transparent 
            emissive="#0f172a"
            emissiveIntensity={0.1}
          />
        </mesh>
        
        {/* Enhanced Grid helper */}
        <gridHelper 
          args={[30, 30, '#374151', '#1f2937']} 
          position={[0, -2.4, 0]} 
        />
        
        {/* Post-processing effects */}
        <EffectComposer multisampling={4}>
          <Bloom 
            intensity={0.8} 
            luminanceThreshold={0.3} 
            luminanceSmoothing={0.9}
          />
          <ChromaticAberration offset={[0.001, 0.001]} />
          <Vignette eskil={false} offset={0.1} darkness={0.2} />
        </EffectComposer>
        
        <Stats />
      </Canvas>
    </div>
  );
};

export default Scene3D;