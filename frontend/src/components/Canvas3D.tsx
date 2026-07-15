import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, DepthOfField } from '@react-three/postprocessing';
import ParticleNetwork from './ParticleNetwork';

interface Canvas3DProps {
  motionScore: number;
  latentVector?: number[];
}

const Canvas3D: React.FC<Canvas3DProps> = ({ motionScore, latentVector }) => {
  return (
    <div className="absolute inset-0 w-full h-full bg-cyber-black">
      <Canvas camera={{ position: [0, 8, 25], fov: 60 }}>
        <color attach="background" args={['#010205']} />
        
        {/* Deep space stars effect - reduced density for focus on neurons */}
        <Stars radius={100} depth={50} count={3000} factor={4} saturation={1} fade speed={1.0} />

        {/* The Manifold (Galaxy) */}
        <ParticleNetwork motionScore={motionScore} latentVector={latentVector} />

        {/* Post Processing for the cinematic macro glow */}
        <EffectComposer>
          <DepthOfField focusDistance={0.01} focalLength={0.02} bokehScale={3} height={480} />
          <Bloom luminanceThreshold={0.2} mipmapBlur luminanceSmoothing={0.9} intensity={2.5} />
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
