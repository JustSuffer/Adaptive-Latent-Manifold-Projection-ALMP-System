import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ParticleNetworkProps {
  motionScore: number;
  latentVector?: number[]; 
}

// Cinematic Bioluminescent Palette: Neon Blue, Deep Cyan, Glowing Gold
const CYBER_PALETTE = ['#00d4ff', '#0055ff', '#ffb700', '#00ffaa'];

const ParticleNetwork: React.FC<ParticleNetworkProps> = ({ motionScore, latentVector }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  const NODE_COUNT = 30; // Fewer, but much more detailed nodes for macro photography

  // 1. Generate Cell Body Nodes (Somas)
  const nodesData = useMemo(() => {
    const arr = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      const radius = 6 + Math.random() * 14; 
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);
      
      const baseColor = new THREE.Color(CYBER_PALETTE[Math.floor(Math.random() * CYBER_PALETTE.length)]);
      baseColor.multiplyScalar(4.0); // Intense core bloom

      arr.push({
         basePos: new THREE.Vector3(x, y, z),
         currentPos: new THREE.Vector3(x, y, z),
         targetPos: new THREE.Vector3(x, y, z),
         color: baseColor,
         size: 0.6 + Math.random() * 0.5 // Random node sizes
      });
    }
    return arr;
  }, []);

  // 2. React to Latent Data Stream (Massive Morphing)
  useEffect(() => {
    const hasData = latentVector && latentVector.length > 0;
    
    nodesData.forEach((node, i) => {
       if (hasData) {
          const valX = latentVector[(i * 3) % latentVector.length];
          const valY = latentVector[(i * 3 + 1) % latentVector.length];
          const valZ = latentVector[(i * 3 + 2) % latentVector.length];
          
          // Cinematic explosion/morphing of the network based on vector
          node.targetPos.set(
            node.basePos.x + valX * 15.0,
            node.basePos.y + valY * 15.0,
            node.basePos.z + valZ * 15.0
          );
       } else {
          node.targetPos.copy(node.basePos);
       }
    });
  }, [latentVector, nodesData]);

  // 3. Generate Connections (Graph Topology)
  const connections = useMemo(() => {
    const pairs: [number, number][] = [];
    for (let i = 0; i < NODE_COUNT; i++) {
       const distances = [];
       for (let j = 0; j < NODE_COUNT; j++) {
          if (i === j) continue;
          distances.push({ j, d: nodesData[i].basePos.distanceTo(nodesData[j].basePos) });
       }
       distances.sort((a,b) => a.d - b.d);
       
       // Connect to 2 closest to ensure a web, avoid isolated nodes
       const numConns = 2;
       for (let k = 0; k < numConns; k++) {
          const j = distances[k].j;
          if (i < j) pairs.push([i, j]);
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

  return (
     <group ref={groupRef} rotation={[0.2, 0, 0]}>
       {/* Cinematic Neural Engine */}
       <NeuralEngine 
          nodesData={nodesData} 
          connections={connections} 
          motionScore={motionScore} 
          parentGroupRef={groupRef} 
       />
     </group>
  );
};

// ----------------------------------------------------------------------------------
// NeuralEngine: Handles InstancedMeshes, Spline Bundles, and Photon Particles
// ----------------------------------------------------------------------------------
const NeuralEngine = ({ nodesData, connections, motionScore, parentGroupRef }: any) => {
   const coreMeshRef = useRef<THREE.InstancedMesh>(null);
   const membraneMeshRef = useRef<THREE.InstancedMesh>(null);
   const linesRef = useRef<THREE.LineSegments>(null);
   const photonsRef = useRef<THREE.InstancedMesh>(null);
   
   // Fiber Bundles: 3 parallel curves per connection
   const CURVES_PER_CONNECTION = 3;
   const POINTS_PER_CURVE = 20;
   const SEGMENTS = POINTS_PER_CURVE - 1;
   const totalCurves = connections.length * CURVES_PER_CONNECTION;
   
   const linePositions = useMemo(() => new Float32Array(totalCurves * SEGMENTS * 2 * 3), [totalCurves, SEGMENTS]);
   const lineColors = useMemo(() => new Float32Array(totalCurves * SEGMENTS * 2 * 3), [totalCurves, SEGMENTS]);
   
   // Cache curves for photon pathing
   const curvesCache = useRef<THREE.CatmullRomCurve3[]>([]);

   // Photons (Data Transfer Particles)
   const PHOTON_COUNT = 300;
   const photonsData = useMemo(() => {
     const arr = [];
     for(let i=0; i < PHOTON_COUNT; i++) {
        arr.push({
           curveIdx: Math.floor(Math.random() * totalCurves),
           progress: Math.random(),
           speed: 0.2 + Math.random() * 0.8,
           color: new THREE.Color(CYBER_PALETTE[Math.floor(Math.random() * CYBER_PALETTE.length)]).multiplyScalar(5.0)
        });
     }
     return arr;
   }, [totalCurves]);

   // Pre-calculate line colors
   useEffect(() => {
     let offset = 0;
     const tempColor = new THREE.Color();
     connections.forEach(([a, b]: [number, number]) => {
         const colorA = nodesData[a].color;
         const colorB = nodesData[b].color;
         
         for (let c = 0; c < CURVES_PER_CONNECTION; c++) {
            for (let k = 0; k < SEGMENTS; k++) {
                const t1 = k / SEGMENTS;
                const t2 = (k + 1) / SEGMENTS;
                
                // Fade out edges of lines, brighter in middle or near nodes
                const alpha1 = Math.sin(t1 * Math.PI) * 0.5 + 0.5; 
                const alpha2 = Math.sin(t2 * Math.PI) * 0.5 + 0.5;
                
                tempColor.copy(colorA).lerp(colorB, t1).multiplyScalar(alpha1 * 1.5);
                lineColors[offset++] = tempColor.r; lineColors[offset++] = tempColor.g; lineColors[offset++] = tempColor.b;
                
                tempColor.copy(colorA).lerp(colorB, t2).multiplyScalar(alpha2 * 1.5);
                lineColors[offset++] = tempColor.r; lineColors[offset++] = tempColor.g; lineColors[offset++] = tempColor.b;
            }
         }
     });
     if (linesRef.current) {
        linesRef.current.geometry.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));
        linesRef.current.geometry.attributes.color.needsUpdate = true;
     }
   }, [connections, nodesData, lineColors, SEGMENTS, totalCurves]);

   useFrame((state, delta) => {
      // 1. Lerp Nodes & Update Meshes (Core + Membrane)
      for (let i = 0; i < nodesData.length; i++) {
         const n = nodesData[i];
         n.currentPos.lerp(n.targetPos, 0.04); 
         
         if (coreMeshRef.current && membraneMeshRef.current) {
            const dummy = new THREE.Object3D();
            dummy.position.copy(n.currentPos);
            
            // Core breathing
            const coreScale = n.size * (1.0 + Math.sin(state.clock.elapsedTime * 3.0 + i) * 0.15);
            dummy.scale.setScalar(coreScale);
            dummy.updateMatrix();
            coreMeshRef.current.setMatrixAt(i, dummy.matrix);
            coreMeshRef.current.setColorAt(i, n.color);
            
            // Membrane is slightly larger
            dummy.scale.setScalar(coreScale * 1.6);
            dummy.updateMatrix();
            membraneMeshRef.current.setMatrixAt(i, dummy.matrix);
         }
      }
      
      if (coreMeshRef.current) {
         coreMeshRef.current.instanceMatrix.needsUpdate = true;
         if (coreMeshRef.current.instanceColor) coreMeshRef.current.instanceColor.needsUpdate = true;
      }
      if (membraneMeshRef.current) {
         membraneMeshRef.current.instanceMatrix.needsUpdate = true;
      }

      // 2. Update Spline Bundles
      if (linesRef.current) {
         let offset = 0;
         curvesCache.current = []; // clear cache for this frame

         // We use vectors to calculate perpendicular offsets for parallel fiber bundles
         const up = new THREE.Vector3(0,1,0);
         const dir = new THREE.Vector3();
         const right = new THREE.Vector3();
         const norm = new THREE.Vector3();

         connections.forEach(([a, b]: [number, number], index: number) => {
            const pA = nodesData[a].currentPos;
            const pB = nodesData[b].currentPos;
            
            dir.subVectors(pB, pA).normalize();
            right.crossVectors(dir, up).normalize();
            norm.crossVectors(right, dir).normalize();
            
            const midPoint = pA.clone().lerp(pB, 0.5);
            const bend = midPoint.lerp(new THREE.Vector3(0,0,0), 0.3); // Core gravity pull
            bend.y += Math.sin(state.clock.elapsedTime + index) * 1.5; // Organic noise

            for (let c = 0; c < CURVES_PER_CONNECTION; c++) {
               // Offset each curve in the bundle slightly
               const bundleOffset = right.clone().multiplyScalar(Math.cos(c*Math.PI) * 0.4).add(norm.clone().multiplyScalar(Math.sin(c*Math.PI) * 0.4));
               
               const pA_off = pA.clone().add(bundleOffset.clone().multiplyScalar(0.2));
               const pB_off = pB.clone().add(bundleOffset.clone().multiplyScalar(0.2));
               const bend_off = bend.clone().add(bundleOffset.clone().multiplyScalar(1.5));
               
               const curve = new THREE.CatmullRomCurve3([pA_off, bend_off, pB_off]);
               curvesCache.current.push(curve);
               const points = curve.getPoints(SEGMENTS); 

               for (let k = 0; k < SEGMENTS; k++) {
                  linePositions[offset++] = points[k].x; linePositions[offset++] = points[k].y; linePositions[offset++] = points[k].z;
                  linePositions[offset++] = points[k+1].x; linePositions[offset++] = points[k+1].y; linePositions[offset++] = points[k+1].z;
               }
            }
         });
         
         const geom = linesRef.current.geometry;
         if (!geom.attributes.position) {
            geom.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
         }
         geom.attributes.position.needsUpdate = true;
      }

      // 3. Update Photons
      if (photonsRef.current && curvesCache.current.length > 0) {
         const dummy = new THREE.Object3D();
         const pos = new THREE.Vector3();
         
         photonsData.forEach((photon, i) => {
            // Speed up if motion score is high
            photon.progress += delta * photon.speed * (1 + motionScore * 2);
            
            if (photon.progress > 1.0) {
               photon.progress = 0.0;
               photon.curveIdx = Math.floor(Math.random() * curvesCache.current.length); // Pick new path
            }
            
            const targetCurve = curvesCache.current[photon.curveIdx];
            if (targetCurve) {
               targetCurve.getPointAt(photon.progress, pos);
               dummy.position.copy(pos);
               
               // Pulsate photon size based on progress
               const size = 0.1 + Math.sin(photon.progress * Math.PI) * 0.2;
               dummy.scale.setScalar(size);
               dummy.updateMatrix();
               
               if (photonsRef.current) {
                  photonsRef.current.setMatrixAt(i, dummy.matrix);
                  photonsRef.current.setColorAt(i, photon.color);
               }
            }
         });
         if (photonsRef.current) {
            photonsRef.current.instanceMatrix.needsUpdate = true;
            if (photonsRef.current.instanceColor) photonsRef.current.instanceColor.needsUpdate = true;
         }
      }

      // 4. Global Rotations
      if (parentGroupRef.current) {
         const speed = 0.03 + motionScore * 0.1; 
         parentGroupRef.current.rotation.y += delta * speed;
         parentGroupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.15;
      }
   });

   return (
     <>
       {/* Inner Glowing Cores (Somas) */}
       <instancedMesh ref={coreMeshRef} args={[undefined as any, undefined as any, nodesData.length]}>
          <sphereGeometry args={[1.0, 32, 32]} />
          <meshBasicMaterial toneMapped={false} />
       </instancedMesh>

       {/* Outer Translucent Membranes */}
       <instancedMesh ref={membraneMeshRef} args={[undefined as any, undefined as any, nodesData.length]}>
          <sphereGeometry args={[1.0, 32, 32]} />
          <meshPhysicalMaterial 
             transmission={0.95} 
             opacity={1} 
             metalness={0.1} 
             roughness={0.1} 
             ior={1.5} 
             thickness={1.5} 
             color="#ffffff" 
             transparent 
             depthWrite={false}
          />
       </instancedMesh>
       
       {/* Fiber Optic Bundles (Dendrites) */}
       <lineSegments ref={linesRef}>
          <bufferGeometry />
          <lineBasicMaterial 
            vertexColors 
            transparent 
            opacity={0.4} 
            blending={THREE.AdditiveBlending} 
            depthWrite={false} 
            toneMapped={false} 
          />
       </lineSegments>

       {/* Flowing Photons (Data Transfer) */}
       <instancedMesh ref={photonsRef} args={[undefined as any, undefined as any, PHOTON_COUNT]}>
          <sphereGeometry args={[1.0, 8, 8]} />
          <meshBasicMaterial toneMapped={false} transparent opacity={0.9} depthWrite={false} blending={THREE.AdditiveBlending} />
       </instancedMesh>
     </>
   );
};

export default ParticleNetwork;
