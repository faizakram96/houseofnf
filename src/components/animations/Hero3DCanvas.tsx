'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, ContactShadows, MeshWobbleMaterial } from '@react-three/drei';
import * as THREE from 'three';

function RoyalSilkFabricMesh() {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 0.4;
      const y = (e.clientY / window.innerHeight - 0.5) * 0.4;
      setMousePos({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.getElapsedTime();
      // Smooth subtle floating & rotation reflecting royal silk wave
      meshRef.current.rotation.x = Math.sin(t * 0.4) * 0.15 + mousePos.y * 0.5;
      meshRef.current.rotation.y = Math.cos(t * 0.3) * 0.2 + mousePos.x * 0.5;
      meshRef.current.rotation.z = Math.sin(t * 0.2) * 0.08;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.6}>
      <mesh ref={meshRef} position={[0.2, 0, 0]} scale={[1.4, 1.4, 1.4]}>
        {/* TorusKnot geometry creates a fluid draped silk ribbon shape */}
        <torusKnotGeometry args={[1.1, 0.35, 128, 32, 2, 3]} />
        <MeshWobbleMaterial
          color="#C5A059"
          attach="material"
          factor={0.25}
          speed={1.2}
          roughness={0.15}
          metalness={0.85}
          wireframe={false}
        />
      </mesh>
    </Float>
  );
}

export default function Hero3DCanvas() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-64 h-64 rounded-full bg-[#C5A059]/10 blur-3xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[420px] relative flex items-center justify-center pointer-events-none">
      <Canvas camera={{ position: [0, 0, 5.2], fov: 45 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 10, 8]} intensity={2.2} color="#FFFBF0" />
        <pointLight position={[-8, -8, -4]} intensity={0.8} color="#D4AF37" />
        <pointLight position={[6, 8, 4]} intensity={1.2} color="#E8C872" />

        <RoyalSilkFabricMesh />

        <ContactShadows
          position={[0, -2.2, 0]}
          opacity={0.35}
          scale={12}
          blur={3}
          far={5}
          color="#000000"
        />
      </Canvas>
    </div>
  );
}
