import type { Location } from '@eden/core';
import type { Citizen } from '@eden/citizen';
import { WorldMap, createWorldMap, getRandomWalkablePosition, isWalkable } from './map';
import { Resource, createResource, ResourceType, updateResources, findNearestResource, harvestResource } from './resources';
import { TimeSystem, createTimeSystem, advanceTime } from '../time';

export interface World {
  id: string;
  name: string;
  map: WorldMap;
  resources: Resource[];
  time: TimeSystem;
  citizens: Citizen[];
  maxCitizens: number;
}

export function createWorld(
  name: string,
  mapWidth: number,
  mapHeight: number,
  maxCitizens: number = 100
): World {
  const map = createWorldMap(name, mapWidth, mapHeight);
  const resources = generateInitialResources(map);

  return {
    id: crypto.randomUUID(),
    name,
    map,
    resources,
    time: createTimeSystem(),
    citizens: [],
    maxCitizens,
  };
}

function generateInitialResources(map: WorldMap): Resource[] {
  const resources: Resource[] = [];

  // Generate resources in appropriate terrain
  for (let y = 0; y < map.height; y++) {
    for (let x = 0; x < map.width; x++) {
      const tile = map.tiles[y][x];

      // Random chance to spawn resource
      if (Math.random() > 0.95) {
        let type: ResourceType = 'food';

        switch (tile.terrain) {
          case 'forest':
            type = Math.random() > 0.5 ? 'wood' : 'food';
            break;
          case 'grass':
            type = Math.random() > 0.7 ? 'food' : 'water';
            break;
          case 'mountain':
            type = Math.random() > 0.5 ? 'stone' : 'ore';
            break;
          case 'water':
            type = 'water';
            break;
        }

        resources.push(createResource(type, { x, y, z: 0 }));
      }
    }
  }

  return resources;
}

export function addCitizenToWorld(world: World, citizen: Citizen): World {
  if (world.citizens.length >= world.maxCitizens) {
    return world;
  }

  // Find spawn position
  const spawnPosition = getRandomWalkablePosition(world.map);

  const updatedCitizen = {
    ...citizen,
    location: spawnPosition,
  };

  return {
    ...world,
    citizens: [...world.citizens, updatedCitizen],
  };
}

export function removeCitizenFromWorld(world: World, citizenId: string): World {
  return {
    ...world,
    citizens: world.citizens.filter(c => c.identity.id !== citizenId),
  };
}

export function moveCitizenInWorld(
  world: World,
  citizenId: string,
  target: Location
): World {
  if (!isWalkable(world.map, target.x, target.y)) {
    return world;
  }

  return {
    ...world,
    citizens: world.citizens.map(c =>
      c.identity.id === citizenId
        ? { ...c, location: target }
        : c
    ),
  };
}

export function updateWorld(world: World): World {
  const newTime = advanceTime(world.time);
  const newResources = updateResources(world.resources, world.time.season);

  return {
    ...world,
    time: newTime,
    resources: newResources,
  };
}

export function getWorldStats(world: World) {
  return {
    citizenCount: world.citizens.length,
    resourceCount: world.resources.length,
    totalFood: world.resources.filter(r => r.type === 'food').reduce((sum, r) => sum + r.amount, 0),
    totalWater: world.resources.filter(r => r.type === 'water').reduce((sum, r) => sum + r.amount, 0),
    tick: world.time.currentTick,
    day: world.time.day,
    season: world.time.season,
  };
}

export function findResourceForCitizen(
  world: World,
  citizen: Citizen,
  resourceType: ResourceType
): Resource | null {
  return findNearestResource(world.resources, citizen.location, resourceType);
}

export function citizenHarvestResource(
  world: World,
  citizenId: string,
  resourceId: string,
  amount: number
): World {
  const resource = world.resources.find(r => r.id === resourceId);
  if (!resource) return world;

  const { resource: updatedResource, harvested } = harvestResource(resource, amount);
  if (harvested === 0) return world;

  return {
    ...world,
    resources: world.resources.map(r =>
      r.id === resourceId ? updatedResource : r
    ),
  };
}
