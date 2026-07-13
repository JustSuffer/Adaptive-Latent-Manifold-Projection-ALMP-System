import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ParticleNetworkProps {
  motionScore: number;
  latentVector?: number[]; 
}

const ParticleNetwork: React.FC<ParticleNetworkProps> = ({ motionScore, latentVector }) => {
  const groupRef = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.Points>(null);
  
  // Generate a beautiful Spiral Galaxy distribution
  const { positions, basePositions, colors, sizes } = useMemo(() => {
    const particleCount = 15000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    const colorInside = new THREE.Color('#ff0055'); // core color
    const colorOutside = new THREE.Color('#00f0ff'); // edge color
    
    const branches = 4;
    const radius = 18;
    const spin = 1.5;
    const randomness = 0.5;
    const randomnessPower = 3;
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      const currentRadius = Math.random() * radius;
      const spinAngle = currentRadius * spin;
      const branchAngle = ((i % branches) / branches) * Math.PI * 2;
      
      const randomX = Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * randomness * currentRadius;
      const randomY = Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * randomness * currentRadius;
      const randomZ = Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * randomness * currentRadius;
      
      positions[i3] = Math.cos(branchAngle + spinAngle) * currentRadius + randomX;
      positions[i3 + 1] = randomY; 
      positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * currentRadius + randomZ;
      
      const mixedColor = colorInside.clone();
      mixedColor.lerp(colorOutside, currentRadius / radius);
      
      colors[i3] = mixedColor.r;
      colors[i3 + 1] = mixedColor.g;
      colors[i3 + 2] = mixedColor.b;

      sizes[i] = Math.random() * 0.15;
    }
    const basePositions = new Float32Array(positions);
    
    return { positions, basePositions, colors, sizes };
  }, []);

  // Dynamic reaction to the incoming data stream
  useFrame(({ clock }, delta) => {
    if (groupRef.current) {
      // Base rotation speed
      let rotationSpeed = 0.05;
      
      // If we have a latent vector, use its first few values to introduce chaotic wobble
      let wobbleX = 0;
      let wobbleY = 0;
      if (latentVector && latentVector.length > 2) {
        wobbleX = latentVector[0] * 0.02;
        wobbleY = latentVector[1] * 0.02;
        
        // Increase base rotation speed significantly if motion score is high
        rotationSpeed += (motionScore * 0.2);
      }

      groupRef.current.rotation.y += delta * rotationSpeed;
      groupRef.current.rotation.x += wobbleX;
      groupRef.current.rotation.z = Math.sin(clock.elapsedTime * 0.1) * 0.1 + wobbleY;
      
      // Pulse scale based on motion score
      const scaleMultiplier = 1 + (motionScore * 0.1);
      groupRef.current.scale.set(scaleMultiplier, scaleMultiplier, scaleMultiplier);
    }

    if (pointsRef.current) {
      const geometry = pointsRef.current.geometry;
      const positionsAttr = geometry.attributes.position;
      const currentPositions = positionsAttr.array as Float32Array;
      const particleCount = currentPositions.length / 3;
      
      const hasData = latentVector && latentVector.length > 0;

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const baseX = basePositions[i3];
        const baseY = basePositions[i3 + 1];
        const baseZ = basePositions[i3 + 2];

        if (hasData) {
          const dataIndex = i % latentVector.length;
          const targetValue = latentVector[dataIndex]; // usually between -1 and 1

          // Morph shape based on latent vector
          const targetX = baseX + (targetValue * baseX * 0.8);
          const targetY = baseY + (targetValue * 8.0);
          const targetZ = baseZ + (targetValue * baseZ * 0.8);

          currentPositions[i3] += (targetX - currentPositions[i3]) * 0.05;
          currentPositions[i3 + 1] += (targetY - currentPositions[i3 + 1]) * 0.05;
          currentPositions[i3 + 2] += (targetZ - currentPositions[i3 + 2]) * 0.05;
        } else {
          // Revert to static galaxy smoothly
          currentPositions[i3] += (baseX - currentPositions[i3]) * 0.05;
          currentPositions[i3 + 1] += (baseY - currentPositions[i3 + 1]) * 0.05;
          currentPositions[i3 + 2] += (baseZ - currentPositions[i3 + 2]) * 0.05;
        }
      }

      positionsAttr.needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef} rotation={[0.4, 0, 0]}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[colors, 3]}
          />
          <bufferAttribute
            attach="attributes-size"
            args={[sizes, 1]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.15}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          vertexColors={true}
          transparent={true}
          opacity={0.8}
        />
      </points>
    </group>
  );
};

export default ParticleNetwork;
