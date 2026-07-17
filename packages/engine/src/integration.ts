import { Citizen, Event } from '@eden/core';
import { createCitizen, updateCitizen } from '@eden/citizen';
import { createDriveSystem, updateDrives, getMostUrgentNeed } from '@eden/citizen';
import { createGoalSystem, generateGoals, prioritizeGoals, getHighestPriorityGoal } from '@eden/citizen';
import { createMemorySystem, addMemory, recallRecentMemory } from '@eden/ai';
import { perceive, Perception } from '@eden/ai';
import { determineAttention, AttentionFocus } from '@eden/ai';
import { generatePlan, Plan, advancePlan, getCurrentStep } from '@eden/ai';
import { makeDecision, Decision } from '@eden/ai';
import { World, addCitizenToWorld, moveCitizenInWorld, citizenHarvestResource } from './world';
import { EventBus, emitEvent } from './events';
import { HistorySystem, recordEvent } from '@eden/history';

export interface IntegratedCitizen {
  citizen: Citizen;
  driveSystem: ReturnType<typeof createDriveSystem>;
  goalSystem: ReturnType<typeof createGoalSystem>;
  memorySystem: ReturnType<typeof createMemorySystem>;
  currentPlan: Plan | null;
}

export function createIntegratedCitizen(
  name: string,
  age: number,
  gender: 'male' | 'female' | 'other'
): IntegratedCitizen {
  const citizen = createCitizen(name, age, gender, { x: 0, y: 0, z: 0 }, Date.now());

  return {
    citizen,
    driveSystem: createDriveSystem(citizen.identity.id),
    goalSystem: createGoalSystem(citizen.identity.id),
    memorySystem: createMemorySystem(citizen.identity.id),
    currentPlan: null,
  };
}

export function processIntegratedCitizen(
  integrated: IntegratedCitizen,
  world: World,
  tick: number
): {
  integrated: IntegratedCitizen;
  events: Event[];
} {
  const events: Event[] = [];

  // 1. Update drives
  const updatedDriveSystem = updateDrives(integrated.driveSystem);

  // 2. Generate/update goals
  let updatedGoalSystem = generateGoals(integrated.goalSystem, updatedDriveSystem);
  updatedGoalSystem = prioritizeGoals(updatedGoalSystem);

  // 3. Get highest priority goal
  const topGoal = getHighestPriorityGoal(updatedGoalSystem);

  // 4. Generate plan if needed
  let currentPlan = integrated.currentPlan;
  if (!currentPlan || currentPlan.status !== 'active') {
    if (topGoal) {
      // Simple plan generation for v0.1
      currentPlan = createSimplePlan(integrated.citizen, topGoal.description);
    }
  }

  // 5. Execute current plan step
  if (currentPlan && currentPlan.status === 'active') {
    const result = executePlanStep(integrated.citizen, currentPlan, world, tick);
    currentPlan = result.plan;
    events.push(...result.events);
  }

  // 6. Update citizen state
  const updatedCitizen = updateCitizen(integrated.citizen, tick);

  return {
    integrated: {
      ...integrated,
      citizen: updatedCitizen,
      driveSystem: updatedDriveSystem,
      goalSystem: updatedGoalSystem,
      currentPlan,
    },
    events,
  };
}

function createSimplePlan(citizen: Citizen, goalDescription: string): Plan {
  return {
    id: crypto.randomUUID(),
    citizenId: citizen.identity.id,
    goal: goalDescription,
    steps: [
      { action: 'look_around', description: 'Observe environment', estimatedDuration: 1 },
      { action: 'move', description: 'Move to target', estimatedDuration: 3 },
      { action: 'act', description: 'Perform action', estimatedDuration: 2 },
    ],
    currentStepIndex: 0,
    status: 'active',
    createdAt: Date.now(),
  };
}

function executePlanStep(
  citizen: Citizen,
  plan: Plan,
  world: World,
  tick: number
): { plan: Plan; events: Event[] } {
  const currentStep = getCurrentStep(plan);
  if (!currentStep) {
    return { plan: { ...plan, status: 'completed' }, events: [] };
  }

  const events: Event[] = [];

  // Execute the step
  switch (currentStep.action) {
    case 'move':
      // Simple random movement
      const newX = citizen.location.x + (Math.random() - 0.5) * 2;
      const newY = citizen.location.y + (Math.random() - 0.5) * 2;
      events.push({
        id: crypto.randomUUID(),
        type: 'CitizenMoved',
        timestamp: Date.now(),
        citizenId: citizen.identity.id,
        data: { from: citizen.location, to: { x: newX, y: newY, z: 0 } },
        metadata: { tick, cause: 'plan_execution' },
      });
      break;

    case 'act':
      events.push({
        id: crypto.randomUUID(),
        type: 'CitizenActed',
        timestamp: Date.now(),
        citizenId: citizen.identity.id,
        data: { action: plan.goal },
        metadata: { tick, cause: 'plan_execution' },
      });
      break;
  }

  // Advance plan
  const updatedPlan = advancePlan(plan);

  return { plan: updatedPlan, events };
}

export function integrateWorldAndCitizens(
  world: World,
  citizens: IntegratedCitizen[],
  tick: number
): {
  world: World;
  citizens: IntegratedCitizen[];
  events: Event[];
} {
  let currentWorld = world;
  const allEvents: Event[] = [];
  const updatedCitizens: IntegratedCitizen[] = [];

  for (const integrated of citizens) {
    const result = processIntegratedCitizen(integrated, currentWorld, tick);
    updatedCitizens.push(result.integrated);
    allEvents.push(...result.events);

    // Move citizen in world based on events
    for (const event of result.events) {
      if (event.type === 'CitizenMoved') {
        const to = event.data.to as { x: number; y: number; z: number };
        currentWorld = moveCitizenInWorld(currentWorld, integrated.citizen.identity.id, to);
      }
    }
  }

  return {
    world: currentWorld,
    citizens: updatedCitizens,
    events: allEvents,
  };
}
