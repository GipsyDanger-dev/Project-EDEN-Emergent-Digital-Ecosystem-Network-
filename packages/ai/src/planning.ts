import type { Citizen } from '@eden/citizen';
import { AttentionFocus } from './attention';
import { MemorySystem } from './memory';

export interface Plan {
  id: string;
  citizenId: string;
  goal: string;
  steps: PlanStep[];
  currentStepIndex: number;
  status: 'active' | 'completed' | 'failed';
  createdAt: number;
}

export interface PlanStep {
  action: string;
  target?: string;
  description: string;
  estimatedDuration: number;
}

export function generatePlan(
  citizen: Citizen,
  _attention: AttentionFocus,
  _memory: MemorySystem
): Plan | null {
  const urgentNeed = getMostUrgentNeed(citizen);

  if (!urgentNeed) {
    return createIdlePlan(citizen);
  }

  const steps = planStepsForNeed(urgentNeed);

  if (steps.length === 0) {
    return null;
  }

  return {
    id: crypto.randomUUID(),
    citizenId: citizen.identity.id,
    goal: `Satisfy ${urgentNeed.name}`,
    steps,
    currentStepIndex: 0,
    status: 'active',
    createdAt: Date.now(),
  };
}

function getMostUrgentNeed(citizen: Citizen): { name: string; value: number } | null {
  const needs = citizen.state.needs;
  const needEntries = Object.entries(needs) as [string, number][];

  const sorted = needEntries.sort((a, b) => a[1] - b[1]);
  const mostUrgent = sorted[0];

  if (mostUrgent[1] > 50) {
    return null; // No urgent need
  }

  return { name: mostUrgent[0], value: mostUrgent[1] };
}

function planStepsForNeed(
  need: { name: string; value: number }
): PlanStep[] {
  const steps: PlanStep[] = [];

  switch (need.name) {
    case 'hunger':
      steps.push(
        { action: 'find_food', description: 'Look for food source', estimatedDuration: 3 },
        { action: 'move_to_food', description: 'Move to food location', estimatedDuration: 5 },
        { action: 'eat', description: 'Consume food', estimatedDuration: 2 }
      );
      break;

    case 'energy':
      steps.push(
        { action: 'find_rest', description: 'Find a safe place to rest', estimatedDuration: 2 },
        { action: 'sleep', description: 'Rest to restore energy', estimatedDuration: 10 }
      );
      break;

    case 'social':
      steps.push(
        { action: 'find_citizen', description: 'Look for other citizens', estimatedDuration: 3 },
        { action: 'approach', description: 'Move towards citizen', estimatedDuration: 2 },
        { action: 'socialize', description: 'Engage in social interaction', estimatedDuration: 5 }
      );
      break;

    case 'safety':
      steps.push(
        { action: 'find_shelter', description: 'Look for safe location', estimatedDuration: 3 },
        { action: 'move_to_safety', description: 'Move to shelter', estimatedDuration: 5 }
      );
      break;
  }

  return steps;
}

function createIdlePlan(citizen: Citizen): Plan {
  return {
    id: crypto.randomUUID(),
    citizenId: citizen.identity.id,
    goal: 'Idle - explore surroundings',
    steps: [
      { action: 'look_around', description: 'Observe the environment', estimatedDuration: 1 },
      { action: 'wander', description: 'Move randomly', estimatedDuration: 5 },
    ],
    currentStepIndex: 0,
    status: 'active',
    createdAt: Date.now(),
  };
}

export function advancePlan(plan: Plan): Plan {
  const nextIndex = plan.currentStepIndex + 1;

  if (nextIndex >= plan.steps.length) {
    return { ...plan, status: 'completed' };
  }

  return { ...plan, currentStepIndex: nextIndex };
}

export function getCurrentStep(plan: Plan): PlanStep | null {
  return plan.steps[plan.currentStepIndex] || null;
}

export function abandonPlan(plan: Plan): Plan {
  return { ...plan, status: 'failed' };
}
