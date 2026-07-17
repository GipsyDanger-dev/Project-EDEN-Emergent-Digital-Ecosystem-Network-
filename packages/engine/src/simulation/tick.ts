import { Citizen, Event } from '@eden/core';
import { World, updateWorld } from '../world';
import { EventBus, emitEvent } from '../events';

export interface TickContext {
  world: World;
  tick: number;
  events: Event[];
  startTime: number;
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
  events: Event[];
}

export type TickPhase =
  | 'world_update'
  | 'citizen_think'
  | 'citizen_act'
  | 'interaction'
  | 'persist';

export async function executeTick(
  world: World,
  eventBus: EventBus
): Promise<TickResult> {
  const startTime = Date.now();
  const tick = world.time.currentTick;
  const context: TickContext = {
    world,
    tick,
    events: [],
    startTime,
  };

  // Phase 1: World Update
  const worldUpdated = await phaseWorldUpdate(context);

  // Phase 2: Citizen Think (parallel)
  const citizenUpdates = await phaseCitizenThink(worldUpdated);

  // Phase 3: Citizen Act
  const worldWithActions = await phaseCitizenAct(worldUpdated, citizenUpdates);

  // Phase 4: Interactions
  const worldWithInteractions = await phaseInteractions(worldWithActions);

  // Phase 5: Persist
  await phasePersist(worldWithInteractions, context.events);

  // Emit all events
  for (const event of context.events) {
    emitEvent(eventBus, event);
  }

  return {
    world: worldWithInteractions,
    events: context.events,
    duration: Date.now() - startTime,
    citizenUpdates,
  };
}

async function phaseWorldUpdate(context: TickContext): Promise<World> {
  return updateWorld(context.world);
}

async function phaseCitizenThink(world: World): Promise<CitizenUpdate[]> {
  const updates: CitizenUpdate[] = [];

  // Process each citizen (will be parallel in future)
  for (const citizen of world.citizens) {
    if (!citizen.isAlive) continue;

    const update = await processCitizenThink(citizen, world);
    updates.push(update);
  }

  return updates;
}

async function processCitizenThink(
  citizen: Citizen,
  world: World
): Promise<CitizenUpdate> {
  // Simple decision making for v0.1
  const needs = citizen.state.needs;
  let action = 'idle';

  // Find most urgent need
  const urgentNeed = Object.entries(needs)
    .sort(([, a], [, b]) => a - b)[0];

  if (urgentNeed && urgentNeed[1] < 50) {
    action = `seek_${urgentNeed[0]}`;
  }

  return {
    citizenId: citizen.identity.id,
    action,
    events: [],
  };
}

async function phaseCitizenAct(
  world: World,
  updates: CitizenUpdate[]
): Promise<World> {
  let currentWorld = world;

  for (const update of updates) {
    currentWorld = await executeCitizenAction(currentWorld, update);
  }

  return currentWorld;
}

async function executeCitizenAction(
  world: World,
  update: CitizenUpdate
): Promise<World> {
  // Simple action execution for v0.1
  // Will be expanded with AI brain integration

  return world;
}

async function phaseInteractions(world: World): Promise<World> {
  // Handle citizen-citizen interactions
  // Will be expanded in future sprints
  return world;
}

async function phasePersist(world: World, events: Event[]): Promise<void> {
  // Save state to database
  // Will be implemented with database layer
}
