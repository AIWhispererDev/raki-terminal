import React, { useMemo, useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';

function getTextPoints(text: string) {
  const canvas = document.createElement('canvas');
  canvas.width = 300;
  canvas.height = 100;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return [];

  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.font = '900 70px "Share Tech Mono", monospace, sans-serif';
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;
  const points = [];

  const step = 2; // Step size controls particle density

  for (let y = 0; y < canvas.height; y += step) {
    for (let x = 0; x < canvas.width; x += step) {
      const index = (y * canvas.width + x) * 4;
      const r = data[index];
      if (r > 128) {
        // Slight randomization so it isn't a perfect grid
        const rx = (Math.random() - 0.5) * 0.02;
        const ry = (Math.random() - 0.5) * 0.02;
        points.push(new THREE.Vector3(
          (x - canvas.width / 2) * 0.035 + rx, 
          -(y - canvas.height / 2) * 0.035 + ry, 
          0
        ));
      }
    }
  }
  return points;
}

function ParticleText({ text }: { text: string }) {
  // Add a small delay/trigger to wait for custom fonts if needed
  const [points, setPoints] = useState<THREE.Vector3[]>([]);

  useEffect(() => {
    // Generate them slightly after mount to allow font loading
    const tm = setTimeout(() => {
      setPoints(getTextPoints(text));
    }, 150);
    return () => clearTimeout(tm);
  }, [text]);

  const geomRef = useRef<THREE.BufferGeometry>(null);
  
  const basePositions = useMemo(() => {
    const arr = new Float32Array(points.length * 3);
    points.forEach((p, i) => {
      arr[i * 3] = p.x;
      arr[i * 3 + 1] = p.y;
      arr[i * 3 + 2] = p.z;
    });
    return arr;
  }, [points]);
  
  const currentPositions = useMemo(() => new Float32Array(basePositions), [basePositions]);
  const velocities = useMemo(() => new Float32Array(points.length * 3), [points]);

  const { viewport } = useThree();

  useFrame((state) => {
    if (!geomRef.current || points.length === 0) return;
    
    // state.pointer is -1 to 1. Map to world units based on viewport
    const px = (state.pointer.x * viewport.width) / 2;
    const py = (state.pointer.y * viewport.height) / 2;

    const positions = geomRef.current.attributes.position.array as Float32Array;
    
    for (let i = 0; i < points.length; i++) {
        const i3 = i * 3;
        const bx = basePositions[i3];
        const by = basePositions[i3+1];
        const cx = positions[i3];
        const cy = positions[i3+1];

        const dx = cx - px;
        const dy = cy - py;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        // Custom physics values for the cyber/glitch feel
        // Repulsion force
        if (dist < 1.4) {
            const force = (1.4 - dist) * 0.15;
            velocities[i3] += (dx/dist) * force;
            velocities[i3+1] += (dy/dist) * force;
        }

        // Return force (elasticity)
        velocities[i3] += (bx - cx) * 0.12;
        velocities[i3+1] += (by - cy) * 0.12;

        // Damping (friction)
        velocities[i3] *= 0.82;
        velocities[i3+1] *= 0.82;

        positions[i3] += velocities[i3];
        positions[i3+1] += velocities[i3+1];
    }
    
    geomRef.current.attributes.position.needsUpdate = true;
  });

  if (points.length === 0) return null;

  return (
    <points>
      <bufferGeometry ref={geomRef}>
        <bufferAttribute
          attach="attributes-position"
          count={points.length}
          array={currentPositions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial 
        size={0.06} 
        color="#ff0000" 
        sizeAttenuation={true} 
        transparent={true} 
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function ParticleLogo() {
  return (
    <div className="w-full h-full cursor-crosshair">
      <Canvas camera={{ position: [0, 0, 4.5], fov: 50 }}>
        <ParticleText text="rAkI" />
      </Canvas>
    </div>
  );
}
