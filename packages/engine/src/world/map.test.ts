import { describe, it, expect } from 'vitest';
import {
  createWorldMap,
  getTile,
  isWalkable,
  getRandomWalkablePosition,
  getNeighbors,
  calculateDistance,
  getTilesInRadius,
} from './map';

describe('WorldMap', () => {
  it('should create a world map with correct dimensions', () => {
    const map = createWorldMap('Test World', 20, 20);

    expect(map.name).toBe('Test World');
    expect(map.width).toBe(20);
    expect(map.height).toBe(20);
    expect(map.tiles).toHaveLength(20);
    expect(map.tiles[0]).toHaveLength(20);
  });

  it('should return null for out of bounds coordinates', () => {
    const map = createWorldMap('Test', 10, 10);

    expect(getTile(map, -1, 0)).toBeNull();
    expect(getTile(map, 10, 0)).toBeNull();
    expect(getTile(map, 0, -1)).toBeNull();
    expect(getTile(map, 0, 10)).toBeNull();
  });

  it('should return tile for valid coordinates', () => {
    const map = createWorldMap('Test', 10, 10);

    const tile = getTile(map, 5, 5);

    expect(tile).not.toBeNull();
    expect(tile?.x).toBe(5);
    expect(tile?.y).toBe(5);
  });

  it('should generate terrain with walkable tiles', () => {
    const map = createWorldMap('Test', 20, 20);

    // Check that at least some tiles are walkable
    let walkableCount = 0;
    for (let y = 0; y < 20; y++) {
      for (let x = 0; x < 20; x++) {
        if (isWalkable(map, x, y)) {
          walkableCount++;
        }
      }
    }

    expect(walkableCount).toBeGreaterThan(0);
  });

  it('should get random walkable position', () => {
    const map = createWorldMap('Test', 20, 20);

    const pos = getRandomWalkablePosition(map);

    expect(pos.x).toBeGreaterThanOrEqual(0);
    expect(pos.x).toBeLessThan(20);
    expect(pos.y).toBeGreaterThanOrEqual(0);
    expect(pos.y).toBeLessThan(20);
  });

  it('should get neighbors correctly', () => {
    const map = createWorldMap('Test', 10, 10);

    const neighbors = getNeighbors(map, 5, 5);

    // Should have 8 neighbors (including diagonals)
    expect(neighbors.length).toBe(8);
  });

  it('should calculate distance correctly', () => {
    const a = { x: 0, y: 0, z: 0 };
    const b = { x: 3, y: 4, z: 0 };

    const dist = calculateDistance(a, b);

    expect(dist).toBe(5); // 3-4-5 triangle
  });

  it('should get tiles in radius', () => {
    const map = createWorldMap('Test', 20, 20);
    const center = { x: 10, y: 10, z: 0 };

    const tiles = getTilesInRadius(map, center, 3);

    expect(tiles.length).toBeGreaterThan(0);
    tiles.forEach(tile => {
      const dist = calculateDistance(center, { x: tile.x, y: tile.y, z: 0 });
      expect(dist).toBeLessThanOrEqual(3);
    });
  });
});
