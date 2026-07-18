'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, Text } from '@react-three/drei';
import * as THREE from 'three';
import {
  CHARACTER_PRESETS,
  PixelCharacterConfig,
  generatePixelCharacterTexture,
} from '../utils/pixel-art';

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
  age: number;
  gender: string;
  needs: {
    hunger: number;
    energy: number;
    social: number;
    safety: number;
  };
  emotions: {
    happiness: number;
    sadness: number;
    anger: number;
    fear: number;
  };
  thought?: string;
  action?: string;
}

interface ResourceData {
  id: string;
  type: string;
  position: [number, number, number];
  amount: number;
}

// Get character preset based on citizen color
function getCharacterPreset(citizen: CitizenData): PixelCharacterConfig {
  const presets = Object.values(CHARACTER_PRESETS);
  const index = parseInt(citizen.id) % presets.length;
  return presets[index];
}

// Pixel Art Character Sprite
function PixelCharacter({ citizen, onClick }: { citizen: CitizenData; onClick?: () => void }) {
  const spriteRef = useRef<THREE.Sprite>(null);
  const preset = getCharacterPreset(citizen);

  const texture = useMemo(() => {
    return generatePixelCharacterTexture(preset);
  }, [preset]);

  const material = useMemo(() => {
    return new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
    });
  }, [texture]);

  useFrame((state) => {
    if (spriteRef.current) {
      // Gentle bobbing animation
      spriteRef.current.position.y = 0.8 + Math.sin(state.clock.elapsedTime * 2 + parseInt(citizen.id)) * 0.05;
    }
  });

  return (
    <group>
      <sprite
        ref={spriteRef}
        position={citizen.position}
        scale={[1.2, 1.5, 1]}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
      >
        <primitive object={material} attach="material" />
      </sprite>
      {/* Name tag */}
      <Text
        position={[citizen.position[0], citizen.position[1] + 1.2, citizen.position[2]]}
        fontSize={0.15}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="black"
      >
        {citizen.name}
      </Text>
      {/* Action indicator */}
      {citizen.action && citizen.action !== 'idle' && (
        <group position={[citizen.position[0], citizen.position[1] + 1.5, citizen.position[2]]}>
          <sprite scale={[0.3, 0.3, 1]}>
            <spriteMaterial color="#fbbf24" transparent opacity={0.8} />
          </sprite>
        </group>
      )}
    </group>
  );
}

// Resource Sprite
function ResourceSprite({ resource }: { resource: ResourceData }) {
  const spriteRef = useRef<THREE.Sprite>(null);

  const color = useMemo(() => {
    switch (resource.type) {
      case 'food': return '#f97316';
      case 'water': return '#3b82f6';
      case 'wood': return '#84cc16';
      case 'stone': return '#6b7280';
      default: return '#ffffff';
    }
  }, [resource.type]);

  useFrame((state) => {
    if (spriteRef.current) {
      spriteRef.current.position.y = 0.3 + Math.sin(state.clock.elapsedTime + parseInt(resource.id.slice(1))) * 0.1;
    }
  });

  return (
    <sprite ref={spriteRef} position={resource.position} scale={[0.4, 0.4, 1]}>
      <spriteMaterial color={color} transparent opacity={0.9} />
    </sprite>
  );
}

// Ground with grass texture
function Ground({ width, height }: { width: number; height: number }) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Base grass color
    ctx.fillStyle = '#2d5a27';
    ctx.fillRect(0, 0, 512, 512);

    // Add grass texture
    for (let i = 0; i < 1000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const shade = Math.random() * 20 - 10;
      ctx.fillStyle = `rgb(${45 + shade}, ${90 + shade}, ${39 + shade})`;
      ctx.fillRect(x, y, 2, 2);
    }

    // Add some darker patches
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const size = Math.random() * 30 + 10;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(width / 4, height / 4);
    return tex;
  }, [width, height]);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
}

// Water tiles
function WaterTiles({ width, height }: { width: number; height: number }) {
  const tiles = useMemo(() => {
    const result: [number, number][] = [];
    // Create water in center area
    for (let x = -2; x <= 2; x++) {
      for (let z = -2; z <= 2; z++) {
        if (Math.sqrt(x * x + z * z) < 2.5) {
          result.push([x, z]);
        }
      }
    }
    return result;
  }, []);

  return (
    <group>
      {tiles.map(([x, z], index) => (
        <mesh
          key={index}
          position={[x, 0.02, z]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[1, 1]} />
          <meshStandardMaterial
            color="#3b82f6"
            transparent
            opacity={0.7}
          />
        </mesh>
      ))}
    </group>
  );
}

// Trees
function Trees({ width, height }: { width: number; height: number }) {
  const trees = useMemo(() => {
    const result: [number, number][] = [];
    for (let i = 0; i < 15; i++) {
      const x = (Math.random() - 0.5) * (width - 2);
      const z = (Math.random() - 0.5) * (height - 2);
      // Avoid center area
      if (Math.sqrt(x * x + z * z) > 4) {
        result.push([x, z]);
      }
    }
    return result;
  }, [width, height]);

  return (
    <group>
      {trees.map(([x, z], index) => (
        <group key={index} position={[x, 0, z]}>
          {/* Tree trunk */}
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.1, 0.15, 1, 8]} />
            <meshStandardMaterial color="#5d4037" />
          </mesh>
          {/* Tree leaves */}
          <mesh position={[0, 1.3, 0]}>
            <coneGeometry args={[0.5, 1, 8]} />
            <meshStandardMaterial color="#228b22" />
          </mesh>
          <mesh position={[0, 1.7, 0]}>
            <coneGeometry args={[0.4, 0.8, 8]} />
            <meshStandardMaterial color="#2e8b2e" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// Rocks
function Rocks({ width, height }: { width: number; height: number }) {
  const rocks = useMemo(() => {
    const result: [number, number, number][] = [];
    for (let i = 0; i < 10; i++) {
      const x = (Math.random() - 0.5) * (width - 2);
      const z = (Math.random() - 0.5) * (height - 2);
      const scale = Math.random() * 0.3 + 0.2;
      result.push([x, scale / 2, z]);
    }
    return result;
  }, [width, height]);

  return (
    <group>
      {rocks.map(([x, y, z], index) => (
        <mesh key={index} position={[x, y, z]}>
          <dodecahedronGeometry args={[y, 0]} />
          <meshStandardMaterial color="#6b7280" />
        </mesh>
      ))}
    </group>
  );
}

function CameraController() {
  return (
    <OrbitControls
      makeDefault
      minPolarAngle={0.3}
      maxPolarAngle={Math.PI / 2.2}
      minDistance={5}
      maxDistance={30}
      target={[0, 0, 0]}
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
      camera={{ position: [12, 10, 12], fov: 45 }}
      style={{ width: '100%', height: '100vh' }}
      shadows
    >
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 15, 10]}
        intensity={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <pointLight position={[-5, 5, -5]} intensity={0.3} color="#ffd93d" />

      {/* Sky color */}
      <color attach="background" args={['#1a1a2e']} />
      <fog attach="fog" args={['#1a1a2e', 20, 50]} />

      <CameraController />

      {/* Ground */}
      <Ground width={width} height={height} />
      <WaterTiles width={width} height={height} />

      {/* Environment */}
      <Trees width={width} height={height} />
      <Rocks width={width} height={height} />

      {/* Grid */}
      <Grid
        args={[width, height]}
        position={[0, 0.01, 0]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#ffffff"
        sectionSize={5}
        fadeDistance={30}
        fadeStrength={1}
        infiniteGrid={false}
      />

      {/* Resources */}
      {resources.map((resource) => (
        <ResourceSprite key={resource.id} resource={resource} />
      ))}

      {/* Citizens */}
      {citizens.map((citizen) => (
        <PixelCharacter
          key={citizen.id}
          citizen={citizen}
          onClick={() => onCitizenClick?.(citizen.id)}
        />
      ))}
    </Canvas>
  );
}
