import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import ParticleNetwork from './ParticleNetwork';

interface Canvas3DProps {
  motionScore: number;
  latentVector?: number[];
}

const Canvas3D: React.FC<Canvas3DProps> = ({ motionScore, latentVector }) => {
  return (
    <div className="absolute inset-0 w-full h-full bg-cyber-black">
      <Canvas camera={{ position: [0, 8, 25], fov: 60 }}>
        <color attach="background" args={['#02040a']} />
        
        {/* Deep space stars effect */}
        <Stars radius={100} depth={50} count={8000} factor={6} saturation={1} fade speed={1.5} />

        {/* The Manifold (Galaxy) */}
        <ParticleNetwork motionScore={motionScore} latentVector={latentVector} />

        {/* Post Processing for the ultimate glow */}
        <EffectComposer>
          <Bloom luminanceThreshold={0.1} mipmapBlur luminanceSmoothing={0.9} intensity={3.0} />
        </EffectComposer>

        {/* User controls */}
        <OrbitControls 
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          maxDistance={40}
          minDistance={5}
        />
      </Canvas>
    </div>
  );
};

export default Canvas3D;
