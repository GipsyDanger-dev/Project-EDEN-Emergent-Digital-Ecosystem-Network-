/**
 * Pixel Art Generator for EDEN Citizens
 * Generates procedural pixel art characters using canvas
 */

export interface PixelCharacterConfig {
  id: string;
  name: string;
  skinColor: string;
  hairColor: string;
  shirtColor: string;
  pantsColor: string;
  eyeColor: string;
  size: number;
}

// Predefined character presets
export const CHARACTER_PRESETS: Record<string, PixelCharacterConfig> = {
  aria: {
    id: 'aria',
    name: 'Aria',
    skinColor: '#f4c7a3',
    hairColor: '#8b4513',
    shirtColor: '#e74c3c',
    pantsColor: '#34495e',
    eyeColor: '#2c3e50',
    size: 16,
  },
  marcus: {
    id: 'marcus',
    name: 'Marcus',
    skinColor: '#d4a574',
    hairColor: '#2c1810',
    shirtColor: '#3498db',
    pantsColor: '#2c3e50',
    eyeColor: '#1a1a2e',
    size: 16,
  },
  luna: {
    id: 'luna',
    name: 'Luna',
    skinColor: '#ffe0bd',
    hairColor: '#ffd93d',
    shirtColor: '#27ae60',
    pantsColor: '#7f8c8d',
    eyeColor: '#2ecc71',
    size: 16,
  },
  orion: {
    id: 'orion',
    name: 'Orion',
    skinColor: '#c68642',
    hairColor: '#1a1a1a',
    shirtColor: '#f39c12',
    pantsColor: '#2c3e50',
    eyeColor: '#34495e',
    size: 16,
  },
};

// Pixel art patterns (16x16 grid)
// 0 = transparent, 1 = skin, 2 = hair, 3 = shirt, 4 = pants, 5 = eye
const CHARACTER_PATTERN = [
  [0,0,0,0,0,2,2,2,2,2,2,0,0,0,0,0],
  [0,0,0,0,2,2,2,2,2,2,2,2,0,0,0,0],
  [0,0,0,2,2,2,2,2,2,2,2,2,2,0,0,0],
  [0,0,0,2,2,1,1,1,1,1,1,2,2,0,0,0],
  [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
  [0,0,0,1,1,5,1,1,1,5,1,1,1,0,0,0],
  [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
  [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],
  [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
  [0,0,0,0,3,3,3,3,3,3,3,3,0,0,0,0],
  [0,0,0,3,3,3,3,3,3,3,3,3,3,0,0,0],
  [0,0,0,3,3,3,3,3,3,3,3,3,3,0,0,0],
  [0,0,0,1,3,3,3,3,3,3,3,3,1,0,0,0],
  [0,0,0,0,4,4,4,0,4,4,4,0,0,0,0,0],
  [0,0,0,0,4,4,4,0,4,4,4,0,0,0,0,0],
  [0,0,0,0,4,4,4,0,4,4,4,0,0,0,0,0],
];

const COLOR_MAP: Record<number, keyof PixelCharacterConfig> = {
  1: 'skinColor',
  2: 'hairColor',
  3: 'shirtColor',
  4: 'pantsColor',
  5: 'eyeColor',
};

export function generatePixelCharacter(config: PixelCharacterConfig): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = config.size;
  canvas.height = config.size;
  const ctx = canvas.getContext('2d')!;

  // Clear canvas
  ctx.clearRect(0, 0, config.size, config.size);

  // Draw pixels
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      const pixel = CHARACTER_PATTERN[y][x];
      if (pixel === 0) continue;

      const colorKey = COLOR_MAP[pixel];
      if (colorKey) {
        ctx.fillStyle = config[colorKey];
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }

  return canvas;
}

export function generatePixelCharacterTexture(config: PixelCharacterConfig): THREE.CanvasTexture {
  const canvas = generatePixelCharacter(config);
  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  return texture;
}

// Export for use in ThreeJS
import * as THREE from 'three';

export function createPixelSpriteMaterial(config: PixelCharacterConfig): THREE.SpriteMaterial {
  const texture = generatePixelCharacterTexture(config);
  return new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
  });
}
