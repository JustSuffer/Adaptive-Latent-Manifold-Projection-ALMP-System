import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ParticleNetworkProps {
  motionScore: number;
  latentVector?: number[]; 
}

// Cinematic Bioluminescent Palette: Neon Blue, Deep Cyan, Glowing White/Gold
const CYBER_PALETTE = ['#0055ff', '#00e5ff', '#ffffff', '#ffdd00'];

const ParticleNetwork: React.FC<ParticleNetworkProps> = ({ motionScore, latentVector }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  const NODE_COUNT = 40; 

  // 1. Generate Cell Body Nodes (Somas)
  const nodesData = useMemo(() => {
    const arr = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      const radius = 6 + Math.random() * 12; 
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);
      
      const baseColor = new THREE.Color(CYBER_PALETTE[Math.floor(Math.random() * CYBER_PALETTE.length)]);
      
      // Make some nodes exceptionally bright
      if (Math.random() > 0.8) baseColor.multiplyScalar(3.0); 

      arr.push({
         basePos: new THREE.Vector3(x, y, z),
         currentPos: new THREE.Vector3(x, y, z),
         targetPos: new THREE.Vector3(x, y, z),
         color: baseColor,
         size: 0.05 + Math.random() * 0.03 // MICROSCOPIC SIZES (0.05 - 0.08)
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
          
          node.targetPos.set(
            node.basePos.x + valX * 10.0,
            node.basePos.y + valY * 10.0,
            node.basePos.z + valZ * 10.0
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
       
       const numConns = 2; // Keep sparse graph for web
       for (let k = 0; k < numConns; k++) {
          const j = distances[k].j;
          if (i < j) pairs.push([i, j]);
       }
    }
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
// NeuralEngine: Razor sharp nodes, microscopic fiber bundles, tiny photons
// ----------------------------------------------------------------------------------
const NeuralEngine = ({ nodesData, connections, motionScore, parentGroupRef }: any) => {
   const coreMeshRef = useRef<THREE.InstancedMesh>(null);
   const linesRef = useRef<THREE.LineSegments>(null);
   const photonsRef = useRef<THREE.InstancedMesh>(null);
   
   // Fiber Bundles: 30 HAIR-THIN PARALLEL CURVES per connection
   const CURVES_PER_CONNECTION = 30;
   const POINTS_PER_CURVE = 20;
   const SEGMENTS = POINTS_PER_CURVE - 1;
   const totalCurves = connections.length * CURVES_PER_CONNECTION;
   
   const linePositions = useMemo(() => new Float32Array(totalCurves * SEGMENTS * 2 * 3), [totalCurves, SEGMENTS]);
   const lineColors = useMemo(() => new Float32Array(totalCurves * SEGMENTS * 2 * 3), [totalCurves, SEGMENTS]);
   
   const curvesCache = useRef<THREE.CatmullRomCurve3[]>([]);

   // Photons (800 Microscopic particles)
   const PHOTON_COUNT = 800;
   const photonsData = useMemo(() => {
     const arr = [];
     for(let i=0; i < PHOTON_COUNT; i++) {
        arr.push({
           curveIdx: Math.floor(Math.random() * totalCurves),
           progress: Math.random(),
           speed: 0.1 + Math.random() * 0.4,
           color: new THREE.Color(CYBER_PALETTE[Math.floor(Math.random() * CYBER_PALETTE.length)]).multiplyScalar(8.0) // Very bright
        });
     }
     return arr;
   }, [totalCurves]);

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
                
                // Fade out edges
                const alpha1 = Math.sin(t1 * Math.PI) * 0.8 + 0.2; 
                const alpha2 = Math.sin(t2 * Math.PI) * 0.8 + 0.2;
                
                tempColor.copy(colorA).lerp(colorB, t1).multiplyScalar(alpha1);
                lineColors[offset++] = tempColor.r; lineColors[offset++] = tempColor.g; lineColors[offset++] = tempColor.b;
                
                tempColor.copy(colorA).lerp(colorB, t2).multiplyScalar(alpha2);
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
      // 1. Lerp Nodes & Update Core Meshes
      for (let i = 0; i < nodesData.length; i++) {
         const n = nodesData[i];
         n.currentPos.lerp(n.targetPos, 0.04); 
         
         if (coreMeshRef.current) {
            const dummy = new THREE.Object3D();
            dummy.position.copy(n.currentPos);
            // Constant tiny scale, minor pulse
            const coreScale = n.size * (1.0 + Math.sin(state.clock.elapsedTime * 4.0 + i) * 0.2);
            dummy.scale.setScalar(coreScale);
            dummy.updateMatrix();
            coreMeshRef.current.setMatrixAt(i, dummy.matrix);
            coreMeshRef.current.setColorAt(i, n.color);
         }
      }
      
      if (coreMeshRef.current) {
         coreMeshRef.current.instanceMatrix.needsUpdate = true;
         if (coreMeshRef.current.instanceColor) coreMeshRef.current.instanceColor.needsUpdate = true;
      }

      // 2. Update Spline Bundles
      if (linesRef.current) {
         let offset = 0;
         curvesCache.current = []; 

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
            // Slight organic bend
            const bend = midPoint.lerp(new THREE.Vector3(0,0,0), 0.1); 
            bend.y += Math.sin(state.clock.elapsedTime * 0.5 + index) * 0.5;

            for (let c = 0; c < CURVES_PER_CONNECTION; c++) {
               // Scatter the 30 lines randomly around the central axis to form a bundle
               const angle = Math.random() * Math.PI * 2;
               const radius = Math.random() * 0.4; // Max bundle thickness
               
               const bundleOffset = right.clone().multiplyScalar(Math.cos(angle) * radius).add(norm.clone().multiplyScalar(Math.sin(angle) * radius));
               
               // Taper ends: endpoints are close to center, midpoint spreads out
               const pA_off = pA.clone().add(bundleOffset.clone().multiplyScalar(0.05));
               const pB_off = pB.clone().add(bundleOffset.clone().multiplyScalar(0.05));
               const bend_off = bend.clone().add(bundleOffset.clone().multiplyScalar(1.0));
               
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
            photon.progress += delta * photon.speed * (1 + motionScore * 1.5);
            
            if (photon.progress > 1.0) {
               photon.progress = 0.0;
               photon.curveIdx = Math.floor(Math.random() * curvesCache.current.length);
            }
            
            const targetCurve = curvesCache.current[photon.curveIdx];
            if (targetCurve) {
               targetCurve.getPointAt(photon.progress, pos);
               dummy.position.copy(pos);
               
               // Microscopic photon scale (0.015 - 0.02)
               dummy.scale.setScalar(0.015 + Math.sin(photon.progress * Math.PI) * 0.01);
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
         const speed = 0.02 + motionScore * 0.05; 
         parentGroupRef.current.rotation.y += delta * speed;
         parentGroupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.05) * 0.1;
      }
   });

   return (
     <>
       {/* Microscopic Glowing Cores */}
       <instancedMesh ref={coreMeshRef} args={[undefined as any, undefined as any, nodesData.length]}>
          <sphereGeometry args={[1.0, 16, 16]} />
          <meshBasicMaterial toneMapped={false} />
       </instancedMesh>
       
       {/* 30x Hair-thin Fiber Bundles */}
       <lineSegments ref={linesRef}>
          <bufferGeometry />
          <lineBasicMaterial 
            vertexColors 
            transparent 
            opacity={0.15} // Extremely low opacity for wispy volumetric look
            blending={THREE.AdditiveBlending} 
            depthWrite={false} 
            toneMapped={false} 
          />
       </lineSegments>

       {/* Hundreds of Flowing Photons */}
       <instancedMesh ref={photonsRef} args={[undefined as any, undefined as any, PHOTON_COUNT]}>
          <sphereGeometry args={[1.0, 8, 8]} />
          <meshBasicMaterial toneMapped={false} transparent opacity={1.0} depthWrite={false} blending={THREE.AdditiveBlending} />
       </instancedMesh>
     </>
   );
};

export default ParticleNetwork;
