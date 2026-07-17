'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import * as THREE from 'three';

interface WorldSceneProps {
  width: number;
  height: number;
  citizens: CitizenData[];
  resources: ResourceData[];
  onCitizenClick?: (citizenId: string) => void;
}

interface CitizenData {
  id: string;
  name: string;
  position: [number, number, number];
  color: string;
}

interface ResourceData {
  id: string;
  type: string;
  position: [number, number, number];
  amount: number;
}

function Terrain({ width, height }: { width: number; height: number }) {
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(width, height, width, height);
    const positions = geo.attributes.position;

    // Add some terrain variation
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = Math.sin(x * 0.1) * Math.cos(y * 0.1) * 0.5;
      positions.setZ(i, z);
    }

    geo.computeVertexNormals();
    return geo;
  }, [width, height]);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <primitive object={geometry} />
      <meshStandardMaterial
        color="#4ade80"
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function Citizen({ data, onClick }: { data: CitizenData; onClick?: () => void }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle bobbing animation
      meshRef.current.position.y = 0.5 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={data.position}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      <capsuleGeometry args={[0.2, 0.4, 8, 16]} />
      <meshStandardMaterial color={data.color} />
    </mesh>
  );
}

function Resource({ data }: { data: ResourceData }) {
  const getColor = (type: string) => {
    switch (type) {
      case 'food': return '#f97316';
      case 'water': return '#3b82f6';
      case 'wood': return '#84cc16';
      case 'stone': return '#6b7280';
      default: return '#ffffff';
    }
  };

  return (
    <mesh position={data.position}>
      <sphereGeometry args={[0.15, 8, 8]} />
      <meshStandardMaterial color={getColor(data.type)} />
    </mesh>
  );
}

function CameraController() {
  return (
    <OrbitControls
      makeDefault
      minPolarAngle={0}
      maxPolarAngle={Math.PI / 2.1}
      minDistance={5}
      maxDistance={50}
    />
  );
}

export function WorldScene({
  width,
  height,
  citizens,
  resources,
  onCitizenClick,
}: WorldSceneProps) {
  return (
    <Canvas
      camera={{ position: [10, 10, 10], fov: 50 }}
      style={{ width: '100%', height: '100vh' }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />

      <CameraController />

      <Terrain width={width} height={height} />

      {resources.map((resource) => (
        <Resource key={resource.id} data={resource} />
      ))}

      {citizens.map((citizen) => (
        <Citizen
          key={citizen.id}
          data={citizen}
          onClick={() => onCitizenClick?.(citizen.id)}
        />
      ))}

      <Grid
        args={[width, height]}
        position={[0, 0.01, 0]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#ffffff"
        sectionSize={5}
        fadeDistance={50}
        fadeStrength={1}
        infiniteGrid={false}
      />
    </Canvas>
  );
}
