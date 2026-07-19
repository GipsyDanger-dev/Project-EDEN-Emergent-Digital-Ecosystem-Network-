'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Grid, Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import {
  BUILDING_SPRITES,
  ANIMAL_SPRITES,
  TREE_SPRITES,
  RESOURCE_SPRITES,
  createTextureFromPixels,
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

const CHARACTER_ASSETS: Record<string, string> = {
  'citizen-aria': '/assets/characters/aria-archer.png',
  'citizen-marcus': '/assets/characters/marcus-soldier.png',
  'citizen-luna': '/assets/characters/luna-mage.png',
  'citizen-orion': '/assets/characters/orion-warrior.png',
};

// Pixel Art Character Sprite with animation
function PixelCharacter({ citizen, onClick }: { citizen: CitizenData; onClick?: () => void }) {
  const spriteRef = useRef<THREE.Sprite>(null);
  const sourceTexture = useLoader(
    THREE.TextureLoader,
    CHARACTER_ASSETS[citizen.id] ?? CHARACTER_ASSETS['citizen-aria']
  );
  const texture = useMemo(() => {
    const nextTexture = sourceTexture.clone();
    nextTexture.colorSpace = THREE.SRGBColorSpace;
    nextTexture.magFilter = THREE.NearestFilter;
    nextTexture.minFilter = THREE.NearestFilter;
    nextTexture.wrapS = THREE.RepeatWrapping;
    nextTexture.wrapT = THREE.RepeatWrapping;
    nextTexture.repeat.set(1 / 24, 1 / 8);
    const row = [...citizen.id].reduce((total, character) => total + character.charCodeAt(0), 0) % 8;
    nextTexture.offset.set(0, row / 8);
    nextTexture.needsUpdate = true;
    return nextTexture;
  }, [citizen.id, sourceTexture]);

  const material = useMemo(() => {
    return new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
    });
  }, [texture]);

  useFrame((state) => {
    if (spriteRef.current) {
      const moving = citizen.action !== 'idle';
      const frame = moving ? 4 + Math.floor(state.clock.elapsedTime * 7) % 6 : Math.floor(state.clock.elapsedTime * 2) % 2;
      texture.offset.x = frame / 24;
      spriteRef.current.position.y = citizen.position[1] + 0.65 + Math.sin(state.clock.elapsedTime * 5) * 0.035;
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
        scale={[1.35, 1.35, 1]}
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
      return 'FOOD';
    case 'find_rest':
      return 'REST';
    case 'socialize':
    case 'approach_citizen':
      return 'TALK';
    case 'explore':
      return 'SCOUT';
    case 'find_companion':
      return 'GROUP';
    case 'find_shelter':
      return 'HOME';
    default:
      return 'ACT';
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
    ctx.fillStyle = '#17382d';
    ctx.fillRect(0, 0, 512, 512);

    // Add grass texture
    for (let i = 0; i < 2000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const shade = Math.random() * 30 - 15;
      ctx.fillStyle = `rgb(${23 + shade}, ${56 + shade}, ${45 + shade})`;
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
function WaterTiles() {
  const tiles = useMemo(() => {
    const result: [number, number][] = [];
    const ponds = [[-12, -9, 4], [14, 11, 5], [0, 0, 3]];
    for (const [centerX, centerZ, radius] of ponds) {
      for (let x = -radius; x <= radius; x++) {
        for (let z = -radius; z <= radius; z++) {
          if (Math.sqrt(x * x + z * z) < radius) result.push([centerX + x, centerZ + z]);
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
            color="#206477"
            transparent
            opacity={0.7}
          />
        </mesh>
      ))}
    </group>
  );
}

// Path tiles
function PathTiles({ width, height }: { width: number; height: number }) {
  const tiles = useMemo(() => {
    const result: [number, number][] = [];
    for (let x = -width / 2 + 3; x <= width / 2 - 3; x++) {
      result.push([x, 0]);
    }
    for (let z = -height / 2 + 3; z <= height / 2 - 3; z++) {
      result.push([0, z]);
    }
    return result;
  }, [height, width]);

  return (
    <group>
      {tiles.map(([x, z], index) => (
        <mesh
          key={index}
          position={[x, 0.01, z]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[0.8, 0.8]} />
          <meshStandardMaterial color="#5c5544" roughness={0.95} />
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
      maxDistance={82}
      screenSpacePanning
      enableDamping
      dampingFactor={0.06}
      target={[0, 0, -1]}
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

    // Deterministic forest belt across the expanded world.
    for (let i = 0; i < 96; i++) {
      const angle = (i / 96) * Math.PI * 2;
      const radius = 18 + ((i * 37) % 13);
      const x = Math.cos(angle) * radius + ((i * 17) % 5) - 2;
      const z = Math.sin(angle) * radius + ((i * 29) % 5) - 2;
      trees.push([x, z]);
    }

    buildings.push([-22, -19], [21, -20], [-23, 18], [22, 20], [-8, 13], [10, -14]);

    for (let i = 0; i < 18; i++) {
      const x = ((i * 19) % 49) - 24;
      const z = ((i * 31) % 51) - 25;
      if (Math.sqrt(x * x + z * z) > 6) animals.push([x, z]);
    }

    return { trees, buildings, animals };
  }, []);

  return (
    <Canvas
      camera={{ position: [28, 25, 30], fov: 45 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      style={{ width: '100%', height: '100vh' }}
      shadows
    >
      {/* Lighting */}
      <ambientLight intensity={0.32} color="#b7d8ca" />
      <hemisphereLight intensity={0.55} color="#c5eadb" groundColor="#07110e" />
      <directionalLight
        position={[10, 16, 8]}
        intensity={1.35}
        color="#f5d8a4"
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <pointLight position={[-6, 4, -5]} intensity={0.45} distance={18} color="#6ee7b7" />
      <pointLight position={[6, 5, 5]} intensity={0.3} distance={20} color="#f0bd6d" />

      {/* Sky color */}
      <color attach="background" args={['#06110e']} />
      <fog attach="fog" args={['#06110e', 48, 92]} />

      <CameraController />

      {/* Ground */}
      <Ground width={width} height={height} />
      <WaterTiles />
      <PathTiles width={width} height={height} />

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
        cellColor="#7dd3ae"
        sectionColor="#a7f3d0"
        sectionSize={5}
        sectionThickness={0.8}
        fadeDistance={68}
        fadeStrength={2}
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
