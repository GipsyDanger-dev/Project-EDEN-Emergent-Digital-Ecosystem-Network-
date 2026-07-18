'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import {
  CHARACTER_PALETTES,
  CharacterPalette,
  BUILDING_SPRITES,
  ANIMAL_SPRITES,
  TREE_SPRITES,
  RESOURCE_SPRITES,
  createTextureFromPixels,
  createCharacterTexture,
  getRandomPalette,
} from '../utils/pixel-art-sprites';

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

// Get character palette based on citizen ID
function getCharacterPalette(citizen: CitizenData): CharacterPalette {
  const index = parseInt(citizen.id) % CHARACTER_PALETTES.length;
  return CHARACTER_PALETTES[index];
}

// Pixel Art Character Sprite with animation
function PixelCharacter({ citizen, onClick }: { citizen: CitizenData; onClick?: () => void }) {
  const spriteRef = useRef<THREE.Sprite>(null);
  const palette = getCharacterPalette(citizen);

  const texture = useMemo(() => {
    return createCharacterTexture(palette);
  }, [palette]);

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

  // Get emotion color
  const getEmotionColor = () => {
    const { happiness, sadness, anger, fear } = citizen.emotions;
    if (anger > 30) return '#ef4444';
    if (fear > 30) return '#a855f7';
    if (sadness > 30) return '#3b82f6';
    if (happiness > 30) return '#fbbf24';
    return '#22c55e';
  };

  return (
    <group>
      {/* Character sprite */}
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
      <Billboard position={[citizen.position[0], citizen.position[1] + 1.3, citizen.position[2]]}>
        <Text
          fontSize={0.12}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="black"
          font={undefined}
        >
          {citizen.name}
        </Text>
      </Billboard>

      {/* Emotion indicator */}
      <Billboard position={[citizen.position[0], citizen.position[1] + 1.5, citizen.position[2]]}>
        <mesh>
          <circleGeometry args={[0.08, 16]} />
          <meshBasicMaterial color={getEmotionColor()} />
        </mesh>
      </Billboard>

      {/* Action indicator */}
      {citizen.action && citizen.action !== 'idle' && (
        <Billboard position={[citizen.position[0] + 0.3, citizen.position[1] + 1.1, citizen.position[2]]}>
          <Text
            fontSize={0.08}
            color="#fbbf24"
            anchorX="center"
            anchorY="middle"
          >
            {getActionEmoji(citizen.action)}
          </Text>
        </Billboard>
      )}
    </group>
  );
}

function getActionEmoji(action: string): string {
  switch (action) {
    case 'find_food':
    case 'search_food':
      return '🍖';
    case 'find_rest':
      return '💤';
    case 'socialize':
    case 'approach_citizen':
      return '💬';
    case 'explore':
      return '🔍';
    case 'find_companion':
      return '👥';
    case 'find_shelter':
      return '🏠';
    default:
      return '❓';
  }
}

// Building Sprite
function BuildingSprite({ sprite, position }: { sprite: typeof BUILDING_SPRITES[0]; position: [number, number, number] }) {
  const texture = useMemo(() => {
    return createTextureFromPixels(sprite.pixels, sprite.palette);
  }, [sprite]);

  const material = useMemo(() => {
    return new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
    });
  }, [texture]);

  return (
    <sprite
      position={[position[0], position[1] + sprite.height * 0.02, position[2]]}
      scale={[sprite.width * 0.05, sprite.height * 0.05, 1]}
    >
      <primitive object={material} attach="material" />
    </sprite>
  );
}

// Tree Sprite
function TreeSprite({ sprite, position }: { sprite: typeof TREE_SPRITES[0]; position: [number, number, number] }) {
  const texture = useMemo(() => {
    return createTextureFromPixels(sprite.pixels, sprite.palette);
  }, [sprite]);

  const material = useMemo(() => {
    return new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
    });
  }, [texture]);

  const spriteRef = useRef<THREE.Sprite>(null);

  useFrame((state) => {
    if (spriteRef.current) {
      // Subtle swaying animation
      spriteRef.current.position.x = position[0] + Math.sin(state.clock.elapsedTime * 0.5 + position[0]) * 0.02;
    }
  });

  return (
    <sprite
      ref={spriteRef}
      position={[position[0], position[1] + 0.5, position[2]]}
      scale={[1.5, 2, 1]}
    >
      <primitive object={material} attach="material" />
    </sprite>
  );
}

// Animal Sprite
function AnimalSpriteComponent({ animal, position }: { animal: typeof ANIMAL_SPRITES[0]; position: [number, number, number] }) {
  const texture = useMemo(() => {
    const colorMap: Record<number, string> = {};
    animal.palette.forEach((color, index) => {
      colorMap[index + 1] = color;
    });
    return createTextureFromPixels(animal.frames[0], colorMap);
  }, [animal]);

  const material = useMemo(() => {
    return new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
    });
  }, [texture]);

  const spriteRef = useRef<THREE.Sprite>(null);

  useFrame((state) => {
    if (spriteRef.current) {
      // Random movement
      spriteRef.current.position.x = position[0] + Math.sin(state.clock.elapsedTime * 0.3 + position[0]) * 0.3;
      spriteRef.current.position.z = position[2] + Math.cos(state.clock.elapsedTime * 0.2 + position[2]) * 0.3;
    }
  });

  return (
    <sprite
      ref={spriteRef}
      position={[position[0], position[1] + 0.3, position[2]]}
      scale={[0.6, 0.6, 1]}
    >
      <primitive object={material} attach="material" />
    </sprite>
  );
}

// Resource Sprite
function ResourceSprite({ resource }: { resource: ResourceData }) {
  const spriteConfig = useMemo(() => {
    return RESOURCE_SPRITES.find(r => r.id.includes(resource.type)) || RESOURCE_SPRITES[0];
  }, [resource.type]);

  const texture = useMemo(() => {
    return createTextureFromPixels(spriteConfig.pixels, spriteConfig.palette);
  }, [spriteConfig]);

  const material = useMemo(() => {
    return new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
    });
  }, [texture]);

  const spriteRef = useRef<THREE.Sprite>(null);

  useFrame((state) => {
    if (spriteRef.current) {
      spriteRef.current.position.y = 0.3 + Math.sin(state.clock.elapsedTime + parseInt(resource.id.slice(1))) * 0.1;
    }
  });

  return (
    <sprite ref={spriteRef} position={resource.position} scale={[0.5, 0.5, 1]}>
      <primitive object={material} attach="material" />
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
    for (let i = 0; i < 2000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const shade = Math.random() * 30 - 15;
      ctx.fillStyle = `rgb(${45 + shade}, ${90 + shade}, ${39 + shade})`;
      ctx.fillRect(x, y, 2, 2);
    }

    // Add some darker patches
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const size = Math.random() * 40 + 10;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Add some lighter patches
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const size = Math.random() * 20 + 5;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
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

// Water with animated texture
function WaterTiles({ width, height }: { width: number; height: number }) {
  const tiles = useMemo(() => {
    const result: [number, number][] = [];
    // Create water in center area
    for (let x = -3; x <= 3; x++) {
      for (let z = -3; z <= 3; z++) {
        if (Math.sqrt(x * x + z * z) < 3) {
          result.push([x, z]);
        }
      }
    }
    return result;
  }, []);

  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.opacity = 0.6 + Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

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
            ref={materialRef}
            color="#3b82f6"
            transparent
            opacity={0.7}
          />
        </mesh>
      ))}
    </group>
  );
}

// Path tiles
function PathTiles() {
  const tiles = useMemo(() => {
    const result: [number, number][] = [];
    // Create paths
    for (let x = -5; x <= 5; x++) {
      result.push([x, 0]);
    }
    for (let z = -5; z <= 5; z++) {
      result.push([0, z]);
    }
    return result;
  }, []);

  return (
    <group>
      {tiles.map(([x, z], index) => (
        <mesh
          key={index}
          position={[x, 0.01, z]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[0.8, 0.8]} />
          <meshStandardMaterial color="#8b7355" />
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
      maxDistance={35}
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
  // Generate positions for trees, buildings, and animals
  const worldObjects = useMemo(() => {
    const trees: [number, number][] = [];
    const buildings: [number, number][] = [];
    const animals: [number, number][] = [];

    // Trees around the edges
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2;
      const radius = 8 + Math.random() * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      trees.push([x, z]);
    }

    // Buildings in corners
    buildings.push([-7, -7]);
    buildings.push([7, -7]);
    buildings.push([-7, 7]);
    buildings.push([7, 7]);

    // Animals scattered
    for (let i = 0; i < 5; i++) {
      const x = (Math.random() - 0.5) * 12;
      const z = (Math.random() - 0.5) * 12;
      if (Math.sqrt(x * x + z * z) > 4) {
        animals.push([x, z]);
      }
    }

    return { trees, buildings, animals };
  }, []);

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
      <pointLight position={[5, 5, 5]} intensity={0.2} color="#87ceeb" />

      {/* Sky color */}
      <color attach="background" args={['#1a1a2e']} />
      <fog attach="fog" args={['#1a1a2e', 25, 55]} />

      <CameraController />

      {/* Ground */}
      <Ground width={width} height={height} />
      <WaterTiles width={width} height={height} />
      <PathTiles />

      {/* Trees */}
      {worldObjects.trees.map(([x, z], index) => (
        <TreeSprite
          key={`tree-${index}`}
          sprite={TREE_SPRITES[index % TREE_SPRITES.length]}
          position={[x, 0, z]}
        />
      ))}

      {/* Buildings */}
      {worldObjects.buildings.map(([x, z], index) => (
        <BuildingSprite
          key={`building-${index}`}
          sprite={BUILDING_SPRITES[index % BUILDING_SPRITES.length]}
          position={[x, 0, z]}
        />
      ))}

      {/* Animals */}
      {worldObjects.animals.map(([x, z], index) => (
        <AnimalSpriteComponent
          key={`animal-${index}`}
          animal={ANIMAL_SPRITES[index % ANIMAL_SPRITES.length]}
          position={[x, 0, z]}
        />
      ))}

      {/* Grid */}
      <Grid
        args={[width, height]}
        position={[0, 0.01, 0]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#ffffff"
        sectionSize={5}
        fadeDistance={35}
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
