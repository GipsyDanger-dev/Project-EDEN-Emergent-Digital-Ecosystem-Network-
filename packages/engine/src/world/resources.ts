import { Location } from '@eden/core';

export interface Resource {
  id: string;
  type: ResourceType;
  name: string;
  amount: number;
  maxAmount: number;
  location: Location;
  respawnRate: number;  // Amount per tick
  isDepleted: boolean;
}

export type ResourceType = 'food' | 'water' | 'wood' | 'stone' | 'ore' | 'herb';

export interface ResourceConfig {
  type: ResourceType;
  name: string;
  baseAmount: number;
  respawnRate: number;
  seasonalMultiplier: Record<string, number>;
}

export const RESOURCE_CONFIGS: Record<ResourceType, ResourceConfig> = {
  food: {
    type: 'food',
    name: 'Food',
    baseAmount: 100,
    respawnRate: 2,
    seasonalMultiplier: { spring: 1.2, summer: 1.0, autumn: 0.8, winter: 0.3 },
  },
  water: {
    type: 'water',
    name: 'Water',
    baseAmount: 200,
    respawnRate: 5,
    seasonalMultiplier: { spring: 1.0, summer: 0.7, autumn: 1.0, winter: 0.5 },
  },
  wood: {
    type: 'wood',
    name: 'Wood',
    baseAmount: 150,
    respawnRate: 1,
    seasonalMultiplier: { spring: 1.0, summer: 1.0, autumn: 1.0, winter: 0.8 },
  },
  stone: {
    type: 'stone',
    name: 'Stone',
    baseAmount: 200,
    respawnRate: 0.5,
    seasonalMultiplier: { spring: 1.0, summer: 1.0, autumn: 1.0, winter: 1.0 },
  },
  ore: {
    type: 'ore',
    name: 'Ore',
    baseAmount: 50,
    respawnRate: 0.2,
    seasonalMultiplier: { spring: 1.0, summer: 1.0, autumn: 1.0, winter: 1.0 },
  },
  herb: {
    type: 'herb',
    name: 'Herb',
    baseAmount: 30,
    respawnRate: 0.3,
    seasonalMultiplier: { spring: 1.5, summer: 1.0, autumn: 0.5, winter: 0.1 },
  },
};

export function createResource(
  type: ResourceType,
  location: Location,
  amount?: number
): Resource {
  const config = RESOURCE_CONFIGS[type];
  return {
    id: crypto.randomUUID(),
    type,
    name: config.name,
    amount: amount ?? config.baseAmount,
    maxAmount: config.baseAmount,
    location,
    respawnRate: config.respawnRate,
    isDepleted: false,
  };
}

export function updateResources(
  resources: Resource[],
  season: string
): Resource[] {
  return resources.map(resource => {
    if (resource.isDepleted) {
      // Try to respawn
      const newAmount = resource.amount + resource.respawnRate;
      if (newAmount > 0) {
        return {
          ...resource,
          amount: Math.min(newAmount, resource.maxAmount),
          isDepleted: false,
        };
      }
      return resource;
    }

    // Apply seasonal multiplier to respawn
    const config = RESOURCE_CONFIGS[resource.type];
    const multiplier = config.seasonalMultiplier[season] ?? 1.0;
    const respawn = resource.respawnRate * multiplier;

    const newAmount = Math.min(resource.amount + respawn, resource.maxAmount);

    return {
      ...resource,
      amount: newAmount,
      isDepleted: newAmount <= 0,
    };
  });
}

export function harvestResource(
  resource: Resource,
  amount: number
): { resource: Resource; harvested: number } {
  const harvested = Math.min(amount, resource.amount);
  const newAmount = resource.amount - harvested;

  return {
    resource: {
      ...resource,
      amount: newAmount,
      isDepleted: newAmount <= 0,
    },
    harvested,
  };
}

export function findNearestResource(
  resources: Resource[],
  location: Location,
  type: ResourceType
): Resource | null {
  const filtered = resources.filter(r => r.type === type && !r.isDepleted);
  if (filtered.length === 0) return null;

  return filtered.reduce((nearest, current) => {
    const distNearest = calculateDistance(location, nearest.location);
    const distCurrent = calculateDistance(location, current.location);
    return distCurrent < distNearest ? current : nearest;
  });
}

function calculateDistance(a: Location, b: Location): number {
  return Math.sqrt(
    (b.x - a.x) ** 2 +
    (b.y - a.y) ** 2 +
    (b.z - a.z) ** 2
  );
}

export function getResourcesInRadius(
  resources: Resource[],
  center: Location,
  radius: number
): Resource[] {
  return resources.filter(resource => {
    const dist = calculateDistance(center, resource.location);
    return dist <= radius && !resource.isDepleted;
  });
}

export function getTotalResourcesByType(
  resources: Resource[],
  type: ResourceType
): number {
  return resources
    .filter(r => r.type === type)
    .reduce((sum, r) => sum + r.amount, 0);
}
