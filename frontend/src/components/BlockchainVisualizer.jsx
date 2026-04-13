import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Line, Preload } from '@react-three/drei';
import * as THREE from 'three';

function Node({ position, color }) {
  const meshRef = useRef();
  
  useFrame(({ clock }) => {
    meshRef.current.position.y = position[1] + Math.sin(clock.elapsedTime * 2 + position[0]) * 0.2;
  });

  return (
    <Sphere ref={meshRef} args={[0.3, 16, 16]} position={position}>
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} roughness={0.2} metalness={0.8} />
    </Sphere>
  );
}

function Connections({ points }) {
  return (
    <Line
      points={points}
      color="#3b82f6"
      lineWidth={1}
      transparent
      opacity={0.3}
    />
  );
}

export default function BlockchainVisualizer() {
  const nodes = [
    { pos: [-3, 0, 0], color: '#10b981' },
    { pos: [-1.5, 1, -1], color: '#3b82f6' },
    { pos: [0, -0.5, 1], color: '#3b82f6' },
    { pos: [1.5, 0.8, -0.5], color: '#3b82f6' },
    { pos: [3, -0.2, 0], color: '#10b981' },
  ];

  const points = nodes.map(n => new THREE.Vector3(...n.pos));

  return (
    <div className="w-full h-full min-h-[150px] relative rounded-xl overflow-hidden pointer-events-none">
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <Connections points={points} />
        {nodes.map((n, i) => (
          <Node key={i} position={n.pos} color={n.color} />
        ))}
        <Preload all />
      </Canvas>
    </div>
  );
}
