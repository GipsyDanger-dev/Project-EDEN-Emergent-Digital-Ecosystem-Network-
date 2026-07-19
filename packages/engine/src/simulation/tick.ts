import type { Event } from '@eden/core';
import type { Citizen } from '@eden/citizen';
import { World, updateWorld, findResourceForCitizen } from '../world';
import { emitEvent } from '../events';
import { think, thinkLocal, BrainConfig, BrainInput, BrainOutput } from '@eden/ai';
import { createMemorySystem, addMemory, MemorySystem } from '@eden/ai';
import { getTimeOfDayName } from '../time';

export interface TickContext {
  world: World;
  tick: number;
  events: Event[];
  startTime: number;
  brainConfig: BrainConfig | null;
  citizenMemories: Map<string, MemorySystem>;
}

export interface TickResult {
  world: World;
  events: Event[];
  duration: number;
  citizenUpdates: CitizenUpdate[];
}

export interface CitizenUpdate {
  citizenId: string;
  action: string;
  thought: string;
  explanation: string;
  events: Event[];
}

export type TickPhase =
  | 'world_update'
  | 'citizen_think'
  | 'citizen_act'
  | 'interaction'
  | 'persist';

export function createTickContext(
  world: World,
  brainConfig: BrainConfig | null = null
): TickContext {
  const citizenMemories = new Map<string, MemorySystem>();

  // Initialize memories for each citizen
  for (const citizen of world.citizens) {
    citizenMemories.set(citizen.identity.id, createMemorySystem(citizen.identity.id));
  }

  return {
    world,
    tick: world.time.currentTick,
    events: [],
    startTime: Date.now(),
    brainConfig,
    citizenMemories,
  };
}

export async function executeTick(
  context: TickContext
): Promise<TickResult> {
  const { world, startTime, brainConfig, citizenMemories } = context;
  const tick = world.time.currentTick;
  const allEvents: Event[] = [];

  // Phase 1: World Update
  const worldUpdated = updateWorld(world);

  // Phase 2: Citizen Think (parallel)
  const citizenUpdates: CitizenUpdate[] = [];

  for (const citizen of worldUpdated.citizens) {
    if (!citizen.isAlive) continue;

    // Get or create memory for this citizen
    let memories = citizenMemories.get(citizen.identity.id);
    if (!memories) {
      memories = createMemorySystem(citizen.identity.id);
      citizenMemories.set(citizen.identity.id, memories);
    }

    // Build perception
    const perception = buildPerception(citizen, worldUpdated);

    // Get current goal from citizen state
    const currentGoal = getCurrentGoal(citizen);

    // Think
    const brainInput: BrainInput = {
      citizen,
      perception,
      memories,
      currentGoal,
    };

    let brainOutput: BrainOutput;

    if (brainConfig) {
      // Use LLM brain
      brainOutput = await think(brainConfig, brainInput);
    } else {
      // Use local brain
      brainOutput = thinkLocal(brainInput);
    }

    // Record decision as event
    const decisionEvent: Event = {
      id: crypto.randomUUID(),
      type: 'DecisionMade',
      timestamp: Date.now(),
      citizenId: citizen.identity.id,
      data: {
        thought: brainOutput.thought,
        action: brainOutput.decision.action,
        target: brainOutput.decision.target,
        reason: brainOutput.decision.reason,
        explanation: brainOutput.explanation,
      },
      metadata: {
        tick,
        cause: brainConfig ? 'llm_brain' : 'local_brain',
      },
    };

    allEvents.push(decisionEvent);

    // Update memory with this decision
    const updatedMemory = addMemory(memories, decisionEvent, 0.5);
    citizenMemories.set(citizen.identity.id, updatedMemory);

    citizenUpdates.push({
      citizenId: citizen.identity.id,
      action: brainOutput.decision.action,
      thought: brainOutput.thought,
      explanation: brainOutput.explanation,
      events: [decisionEvent],
    });
  }

  // Phase 3: Execute Actions
  let currentWorld = worldUpdated;

  for (const update of citizenUpdates) {
    currentWorld = await executeAction(currentWorld, update, tick, allEvents);
  }

  // Emit all events
  for (const event of allEvents) {
    emitEvent(context.world.time ? context as any : { eventBus: { emit: () => {} } } as any, event);
  }

  return {
    world: currentWorld,
    events: allEvents,
    duration: Date.now() - startTime,
    citizenUpdates,
  };
}

function buildPerception(citizen: Citizen, world: World): BrainInput['perception'] {
  const perceptionRange = 20;

  // Find nearby citizens
  const nearbyCitizens = world.citizens
    .filter(c => c.identity.id !== citizen.identity.id && c.isAlive)
    .map(c => ({
      id: c.identity.id,
      name: c.identity.name,
      distance: calculateDistance(citizen.location, c.location),
    }))
    .filter(c => c.distance <= perceptionRange)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 5);

  // Find nearby resources
  const nearbyResources = world.resources
    .map(r => ({
      id: r.id,
      type: r.type,
      amount: r.amount,
      distance: calculateDistance(citizen.location, r.location),
    }))
    .filter(r => r.distance <= perceptionRange && r.amount > 0)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 5);

  return {
    nearbyCitizens,
    nearbyResources,
    timeOfDay: getTimeOfDayName(world.time.timeOfDay),
    season: world.time.season,
  };
}

function calculateDistance(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);
}

function getCurrentGoal(citizen: Citizen): string | null {
  const needs = citizen.state.needs;
  const mostUrgent = Object.entries(needs)
    .sort(([, a], [, b]) => a - b)[0];

  if (mostUrgent && mostUrgent[1] < 50) {
    return `Satisfy ${mostUrgent[0]} (currently at ${Math.round(mostUrgent[1])}%)`;
  }

  return null;
}

async function executeAction(
  world: World,
  update: CitizenUpdate,
  tick: number,
  allEvents: Event[]
): Promise<World> {
  const citizen = world.citizens.find(c => c.identity.id === update.citizenId);
  if (!citizen) return world;

  let newLocation = { ...citizen.location };

  switch (update.action) {
    case 'seek_hunger':
    case 'seek_energy':
    {
      // Try to find food
      const food = findResourceForCitizen(world, citizen, 'food');
      if (food) {
        // Move towards food
        newLocation = moveTowards(citizen.location, food.location, 2);
      }
      break;
    }

    case 'seek_social':
      // Move towards nearest citizen
      if (update.events[0]?.data?.target) {
        const target = world.citizens.find(
          c => c.identity.id === (update.events[0].data as any).target
        );
        if (target) {
          newLocation = moveTowards(citizen.location, target.location, 2);
        }
      }
      break;

    case 'socialize':
      // Stay in place (socializing)
      break;

    case 'look_around':
      // Random movement
      newLocation = {
        x: citizen.location.x + (Math.random() - 0.5) * 2,
        y: citizen.location.y + (Math.random() - 0.5) * 2,
        z: 0,
      };
      break;

    default:
      // Stay in place
      break;
  }

  // Update citizen location
  const updatedCitizens = world.citizens.map(c =>
    c.identity.id === update.citizenId
      ? { ...c, location: newLocation }
      : c
  );

  // Record movement event if location changed
  if (newLocation.x !== citizen.location.x || newLocation.y !== citizen.location.y) {
    const moveEvent: Event = {
      id: crypto.randomUUID(),
      type: 'CitizenMoved',
      timestamp: Date.now(),
      citizenId: update.citizenId,
      data: {
        from: citizen.location,
        to: newLocation,
      },
      metadata: {
        tick,
        cause: 'action_execution',
      },
    };
    allEvents.push(moveEvent);
  }

  return {
    ...world,
    citizens: updatedCitizens,
  };
}

function moveTowards(
  from: { x: number; y: number },
  to: { x: number; y: number },
  speed: number
): { x: number; y: number; z: number } {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist <= speed) {
    return { x: to.x, y: to.y, z: 0 };
  }

  return {
    x: from.x + (dx / dist) * speed,
    y: from.y + (dy / dist) * speed,
    z: 0,
  };
}
