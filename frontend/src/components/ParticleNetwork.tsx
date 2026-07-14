import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ParticleNetworkProps {
  motionScore: number;
  latentVector?: number[]; 
}

// Organic Cyber-Neural Palette (Purples, Blues, Magentas, Oranges)
const CYBER_PALETTE = ['#ff0055', '#00f0ff', '#b026ff', '#ff8800', '#7d00ff'];

const ParticleNetwork: React.FC<ParticleNetworkProps> = ({ motionScore, latentVector }) => {
  const groupRef = useRef<THREE.Group>(null);
  const dustRef = useRef<THREE.Points>(null);
  
  const NODE_COUNT = 42;
  const DUST_COUNT = 2500;

  // 1. Generate core neural nodes
  const nodesData = useMemo(() => {
    const arr = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      const radius = 8 + Math.random() * 12; // Between 8 and 20
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);
      
      // Choose a vibrant color and amplify it for intense Bloom glow
      const baseColor = new THREE.Color(CYBER_PALETTE[Math.floor(Math.random() * CYBER_PALETTE.length)]);
      baseColor.multiplyScalar(2.0); // Glow amplification

      arr.push({
         basePos: new THREE.Vector3(x, y, z),
         currentPos: new THREE.Vector3(x, y, z),
         targetPos: new THREE.Vector3(x, y, z),
         color: baseColor
      });
    }
    return arr;
  }, []);

  // 2. React to Latent Data Stream
  useEffect(() => {
    const hasData = latentVector && latentVector.length > 0;
    
    nodesData.forEach((node, i) => {
       if (hasData) {
          // Map to latent vectors safely (wrapping if needed)
          const valX = latentVector[(i * 3) % latentVector.length];
          const valY = latentVector[(i * 3 + 1) % latentVector.length];
          const valZ = latentVector[(i * 3 + 2) % latentVector.length];
          
          // Deterministic morphing (Neural Expansion)
          node.targetPos.set(
            node.basePos.x + valX * node.basePos.x * 0.8,
            node.basePos.y + valY * 12.0, // Vertical spine expansion
            node.basePos.z + valZ * node.basePos.z * 0.8
          );
       } else {
          // Resting / Idle State
          node.targetPos.copy(node.basePos);
       }
    });
  }, [latentVector, nodesData]);

  // 3. Generate Dendrite Connections dynamically
  const connections = useMemo(() => {
    const pairs: [number, number][] = [];
    for (let i = 0; i < NODE_COUNT; i++) {
       const distances = [];
       for (let j = 0; j < NODE_COUNT; j++) {
          if (i === j) continue;
          distances.push({ j, d: nodesData[i].basePos.distanceTo(nodesData[j].basePos) });
       }
       distances.sort((a,b) => a.d - b.d);
       // Connect to 2 or 3 closest nodes to form an organic web
       const numConns = 2 + Math.floor(Math.random() * 2);
       for (let k = 0; k < numConns; k++) {
          const j = distances[k].j;
          if (i < j) { // Prevent double counting
             pairs.push([i, j]);
          }
       }
    }
    // Filter duplicates
    const uniquePairs: [number, number][] = [];
    const seen = new Set();
    pairs.forEach(([a, b]) => {
      const key = `${a}-${b}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniquePairs.push([a, b]);
      }
    });
    return uniquePairs;
  }, [nodesData]);

  // 4. Generate Cosmic Dust / Ambient background points
  const dustGeometry = useMemo(() => {
    const positions = new Float32Array(DUST_COUNT * 3);
    const colors = new Float32Array(DUST_COUNT * 3);
    for (let i = 0; i < DUST_COUNT; i++) {
       const r = 5 + Math.random() * 30;
       const t = Math.random() * Math.PI * 2;
       const p = Math.acos((Math.random() * 2) - 1);
       
       positions[i*3] = r * Math.sin(p) * Math.cos(t);
       positions[i*3+1] = r * Math.sin(p) * Math.sin(t) * 0.5; // Flattened disc
       positions[i*3+2] = r * Math.cos(p);
       
       const c = new THREE.Color(CYBER_PALETTE[Math.floor(Math.random() * CYBER_PALETTE.length)]);
       c.multiplyScalar(0.4); // Subtle, to stay in background
       colors[i*3] = c.r;
       colors[i*3+1] = c.g;
       colors[i*3+2] = c.b;
    }
    return { positions, colors };
  }, []);

  return (
     <group ref={groupRef} rotation={[0.2, 0, 0]}>
       {/* Background Dust Cloud */}
       <points ref={dustRef}>
         <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[dustGeometry.positions, 3]} />
            <bufferAttribute attach="attributes-color" args={[dustGeometry.colors, 3]} />
         </bufferGeometry>
         <pointsMaterial size={0.06} vertexColors transparent opacity={0.4} blending={THREE.AdditiveBlending} depthWrite={false} />
       </points>

       {/* Neural Network Engine (Nodes & Splines) */}
       <NeuralEngine 
          nodesData={nodesData} 
          connections={connections} 
          motionScore={motionScore} 
          parentGroupRef={groupRef} 
          dustRef={dustRef} 
       />
     </group>
  );
};

// ----------------------------------------------------------------------------------
// NeuralEngine: Handles the heavy calculation of InstancedMesh and LineSegments
// ----------------------------------------------------------------------------------
const NeuralEngine = ({ nodesData, connections, motionScore, parentGroupRef, dustRef }: any) => {
   const linesRef = useRef<THREE.LineSegments>(null);
   const nodesMeshRef = useRef<THREE.InstancedMesh>(null);
   
   // CatmullRom settings
   const POINTS_PER_CURVE = 20;
   const SEGMENTS = POINTS_PER_CURVE - 1;
   
   const linePositions = useMemo(() => new Float32Array(connections.length * SEGMENTS * 2 * 3), [connections, SEGMENTS]);
   const lineColors = useMemo(() => new Float32Array(connections.length * SEGMENTS * 2 * 3), [connections, SEGMENTS]);

   // Pre-calculate line colors (Gradient from Node A to Node B)
   useEffect(() => {
     let offset = 0;
     const tempColor = new THREE.Color();
     connections.forEach(([a, b]: [number, number]) => {
         const colorA = nodesData[a].color;
         const colorB = nodesData[b].color;
         
         for (let k = 0; k < SEGMENTS; k++) {
             const t1 = k / SEGMENTS;
             const t2 = (k + 1) / SEGMENTS;
             
             tempColor.copy(colorA).lerp(colorB, t1);
             lineColors[offset++] = tempColor.r;
             lineColors[offset++] = tempColor.g;
             lineColors[offset++] = tempColor.b;
             
             tempColor.copy(colorA).lerp(colorB, t2);
             lineColors[offset++] = tempColor.r;
             lineColors[offset++] = tempColor.g;
             lineColors[offset++] = tempColor.b;
         }
     });
     if (linesRef.current) {
        linesRef.current.geometry.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));
        linesRef.current.geometry.attributes.color.needsUpdate = true;
     }
   }, [connections, nodesData, lineColors, SEGMENTS]);

   useFrame((state, delta) => {
      // 1. Lerp & Update Core Nodes
      for (let i = 0; i < nodesData.length; i++) {
         const n = nodesData[i];
         n.currentPos.lerp(n.targetPos, 0.05); // Smooth organic movement
         
         if (nodesMeshRef.current) {
            const dummy = new THREE.Object3D();
            dummy.position.copy(n.currentPos);
            // Pulsate slightly
            const scale = 1.0 + Math.sin(state.clock.elapsedTime * 2.0 + i) * 0.3;
            dummy.scale.setScalar(scale);
            dummy.updateMatrix();
            nodesMeshRef.current.setMatrixAt(i, dummy.matrix);
            nodesMeshRef.current.setColorAt(i, n.color);
         }
      }
      if (nodesMeshRef.current) {
         nodesMeshRef.current.instanceMatrix.needsUpdate = true;
         if (nodesMeshRef.current.instanceColor) nodesMeshRef.current.instanceColor.needsUpdate = true;
      }

      // 2. Update CatmullRom Dendrite Splines
      if (linesRef.current) {
         let offset = 0;
         connections.forEach(([a, b]: [number, number], index: number) => {
            const pA = nodesData[a].currentPos;
            const pB = nodesData[b].currentPos;
            
            // Singularity Gravity: Bend dendrite towards the center (0,0,0)
            const midPoint = pA.clone().lerp(pB, 0.5);
            const bend = midPoint.lerp(new THREE.Vector3(0,0,0), 0.4);
            
            // Add biological noise
            bend.y += Math.sin(state.clock.elapsedTime + index) * 1.5;
            bend.x += Math.cos(state.clock.elapsedTime * 0.8 + index) * 1.0;

            const curve = new THREE.CatmullRomCurve3([pA, bend, pB]);
            const points = curve.getPoints(SEGMENTS); 

            for (let k = 0; k < SEGMENTS; k++) {
               // Start of line segment
               linePositions[offset++] = points[k].x;
               linePositions[offset++] = points[k].y;
               linePositions[offset++] = points[k].z;
               // End of line segment
               linePositions[offset++] = points[k+1].x;
               linePositions[offset++] = points[k+1].y;
               linePositions[offset++] = points[k+1].z;
            }
         });
         
         const geom = linesRef.current.geometry;
         if (!geom.attributes.position) {
            geom.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
         }
         geom.attributes.position.needsUpdate = true;
      }

      // 3. Global Network Rotations
      if (parentGroupRef.current) {
         const speed = 0.05 + motionScore * 0.15; // Accel during active inference
         parentGroupRef.current.rotation.y += delta * speed;
         parentGroupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
         
         const scaleMultiplier = 1 + (motionScore * 0.08);
         parentGroupRef.current.scale.set(scaleMultiplier, scaleMultiplier, scaleMultiplier);
      }
      
      // 4. Counter-rotate cosmic dust for parallax depth
      if (dustRef.current) {
         dustRef.current.rotation.y -= delta * 0.03;
      }
   });

   return (
     <>
       <instancedMesh ref={nodesMeshRef} args={[undefined as any, undefined as any, nodesData.length]}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshBasicMaterial toneMapped={false} />
       </instancedMesh>
       
       <lineSegments ref={linesRef}>
          <bufferGeometry />
          <lineBasicMaterial 
            vertexColors 
            transparent 
            opacity={0.8} 
            blending={THREE.AdditiveBlending} 
            depthWrite={false} 
            toneMapped={false} 
          />
       </lineSegments>
     </>
   );
};

export default ParticleNetwork;
