import { Citizen, Location } from '@eden/core';

export interface Perception {
  citizenId: string;
  timestamp: number;
  visibleEntities: VisibleEntity[];
  environment: EnvironmentInfo;
}

export interface VisibleEntity {
  id: string;
  type: 'citizen' | 'resource' | 'building' | 'animal';
  location: Location;
  distance: number;
  details: Record<string, unknown>;
}

export interface EnvironmentInfo {
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  weather: string;
  temperature: number;
  nearbyEntities: number;
}

export function perceive(
  citizen: Citizen,
  allEntities: VisibleEntity[],
  environment: EnvironmentInfo
): Perception {
  const perceptionRange = 50; // units

  const visibleEntities = allEntities
    .filter(entity => {
      const distance = calculateDistance(citizen.location, entity.location);
      return distance <= perceptionRange;
    })
    .map(entity => ({
      ...entity,
      distance: calculateDistance(citizen.location, entity.location),
    }))
    .sort((a, b) => a.distance - b.distance);

  return {
    citizenId: citizen.identity.id,
    timestamp: Date.now(),
    visibleEntities,
    environment: {
      ...environment,
      nearbyEntities: visibleEntities.length,
    },
  };
}

function calculateDistance(a: Location, b: Location): number {
  return Math.sqrt(
    (b.x - a.x) ** 2 +
    (b.y - a.y) ** 2 +
    (b.z - a.z) ** 2
  );
}

export function getEntitiesByType(
  perception: Perception,
  type: VisibleEntity['type']
): VisibleEntity[] {
  return perception.visibleEntities.filter(e => e.type === type);
}

export function getNearestEntity(
  perception: Perception,
  type: VisibleEntity['type']
): VisibleEntity | undefined {
  const entities = getEntitiesByType(perception, type);
  return entities[0];
}

export function hasEntityNearby(
  perception: Perception,
  type: VisibleEntity['type'],
  maxDistance: number
): boolean {
  return perception.visibleEntities.some(
    e => e.type === type && e.distance <= maxDistance
  );
}
