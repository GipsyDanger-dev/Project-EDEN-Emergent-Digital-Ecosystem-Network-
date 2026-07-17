import { Perception, VisibleEntity } from './perception';
import { CitizenState } from '@eden/core';

export interface AttentionFocus {
  citizenId: string;
  timestamp: number;
  primaryFocus: FocusTarget | null;
  secondaryFocuses: FocusTarget[];
  urgency: 'low' | 'medium' | 'high';
}

export interface FocusTarget {
  entityId: string;
  entityType: string;
  reason: string;
  priority: number;
}

export function determineAttention(
  citizenId: string,
  perception: Perception,
  state: CitizenState
): AttentionFocus {
  const focusTargets: FocusTarget[] = [];

  // Prioritize based on needs
  if (state.needs.hunger < 30) {
    const foodSource = perception.visibleEntities.find(
      e => e.type === 'resource' && e.details.type === 'food'
    );
    if (foodSource) {
      focusTargets.push({
        entityId: foodSource.id,
        entityType: 'resource',
        reason: 'hungry - need food',
        priority: 100 - state.needs.hunger,
      });
    }
  }

  if (state.needs.social < 30) {
    const nearbyCitizen = perception.visibleEntities.find(
      e => e.type === 'citizen'
    );
    if (nearbyCitizen) {
      focusTargets.push({
        entityId: nearbyCitizen.id,
        entityType: 'citizen',
        reason: 'lonely - need social interaction',
        priority: 100 - state.needs.social,
      });
    }
  }

  // Add general environmental awareness
  if (perception.environment.nearbyEntities > 5) {
    focusTargets.push({
      entityId: 'environment',
      entityType: 'environment',
      reason: 'crowded area - high activity',
      priority: 30,
    });
  }

  // Sort by priority
  focusTargets.sort((a, b) => b.priority - a.priority);

  const primaryFocus = focusTargets[0] || null;
  const secondaryFocuses = focusTargets.slice(1, 4);

  const urgency = determineUrgency(state);

  return {
    citizenId,
    timestamp: Date.now(),
    primaryFocus,
    secondaryFocuses,
    urgency,
  };
}

function determineUrgency(state: CitizenState): 'low' | 'medium' | 'high' {
  const criticalNeeds = [
    state.needs.hunger < 20,
    state.needs.energy < 20,
    state.needs.safety < 20,
  ].filter(Boolean).length;

  if (criticalNeeds >= 2) return 'high';
  if (criticalNeeds >= 1) return 'medium';
  return 'low';
}

export function filterByAttention(
  entities: VisibleEntity[],
  attention: AttentionFocus
): VisibleEntity[] {
  const focusIds = new Set([
    attention.primaryFocus?.entityId,
    ...attention.secondaryFocuses.map(f => f.entityId),
  ].filter(Boolean));

  return entities.filter(e =>
    focusIds.has(e.id) || e.type === 'citizen'
  );
}
