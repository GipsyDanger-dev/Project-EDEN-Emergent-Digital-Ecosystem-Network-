import { Location } from '@eden/core';

export interface WorldMap {
  id: string;
  name: string;
  width: number;
  height: number;
  tiles: Tile[][];
  regions: Region[];
}

export interface Tile {
  x: number;
  y: number;
  terrain: TerrainType;
  isWalkable: boolean;
  resourceId?: string;
  buildingId?: string;
}

export type TerrainType = 'grass' | 'water' | 'forest' | 'mountain' | 'sand' | 'rock';

export interface Region {
  id: string;
  name: string;
  bounds: Bounds;
  type: 'village' | 'forest' | 'mountain' | 'lake' | 'desert';
}

export interface Bounds {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export function createWorldMap(
  name: string,
  width: number,
  height: number
): WorldMap {
  const tiles = generateTerrain(width, height);

  return {
    id: crypto.randomUUID(),
    name,
    width,
    height,
    tiles,
    regions: [],
  };
}

function generateTerrain(width: number, height: number): Tile[][] {
  const tiles: Tile[][] = [];

  for (let y = 0; y < height; y++) {
    const row: Tile[] = [];
    for (let x = 0; x < width; x++) {
      row.push({
        x,
        y,
        terrain: generateTerrainType(x, y, width, height),
        isWalkable: true,
      });
    }
    tiles.push(row);
  }

  return tiles;
}

function generateTerrainType(
  x: number,
  y: number,
  width: number,
  height: number
): TerrainType {
  // Simple terrain generation based on position
  const centerX = width / 2;
  const centerY = height / 2;
  const distFromCenter = Math.sqrt(
    (x - centerX) ** 2 + (y - centerY) ** 2
  );
  const maxDist = Math.sqrt(centerX ** 2 + centerY ** 2);
  const normalizedDist = distFromCenter / maxDist;

  // Lake in center
  if (normalizedDist < 0.15) return 'water';

  // Forest around lake
  if (normalizedDist < 0.35) return 'forest';

  // Grass in middle
  if (normalizedDist < 0.65) return 'grass';

  // Mountains at edges
  if (normalizedDist < 0.85) return 'mountain';

  // Desert at corners
  return 'sand';
}

export function getTile(map: WorldMap, x: number, y: number): Tile | null {
  if (x < 0 || x >= map.width || y < 0 || y >= map.height) {
    return null;
  }
  return map.tiles[y][x];
}

export function isWalkable(map: WorldMap, x: number, y: number): boolean {
  const tile = getTile(map, x, y);
  return tile?.isWalkable ?? false;
}

export function getRandomWalkablePosition(map: WorldMap): Location {
  let attempts = 0;
  while (attempts < 1000) {
    const x = Math.floor(Math.random() * map.width);
    const y = Math.floor(Math.random() * map.height);

    if (isWalkable(map, x, y)) {
      return { x, y, z: 0 };
    }
    attempts++;
  }

  // Fallback to center
  return { x: Math.floor(map.width / 2), y: Math.floor(map.height / 2), z: 0 };
}

export function getNeighbors(map: WorldMap, x: number, y: number): Tile[] {
  const neighbors: Tile[] = [];
  const directions = [
    [-1, 0], [1, 0], [0, -1], [0, 1],
    [-1, -1], [-1, 1], [1, -1], [1, 1],
  ];

  for (const [dx, dy] of directions) {
    const tile = getTile(map, x + dx, y + dy);
    if (tile) {
      neighbors.push(tile);
    }
  }

  return neighbors;
}

export function calculateDistance(a: Location, b: Location): number {
  return Math.sqrt(
    (b.x - a.x) ** 2 +
    (b.y - a.y) ** 2 +
    (b.z - a.z) ** 2
  );
}

export function getTilesInRadius(
  map: WorldMap,
  center: Location,
  radius: number
): Tile[] {
  const tiles: Tile[] = [];
  const startX = Math.max(0, Math.floor(center.x - radius));
  const endX = Math.min(map.width - 1, Math.ceil(center.x + radius));
  const startY = Math.max(0, Math.floor(center.y - radius));
  const endY = Math.min(map.height - 1, Math.ceil(center.y + radius));

  for (let y = startY; y <= endY; y++) {
    for (let x = startX; x <= endX; x++) {
      const tile = getTile(map, x, y);
      if (tile) {
        const dist = calculateDistance(center, { x, y, z: 0 });
        if (dist <= radius) {
          tiles.push(tile);
        }
      }
    }
  }

  return tiles;
}
