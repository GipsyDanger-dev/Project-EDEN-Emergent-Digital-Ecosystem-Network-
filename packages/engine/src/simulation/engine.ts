import { World, createWorld, addCitizenToWorld } from '../world';
import { Citizen } from '@eden/core';
import { EventBus, createEventBus } from '../events';
import { BrainConfig, createBrainConfig } from '@eden/ai';
import { executeTick, TickResult, createTickContext, TickContext } from './tick';
import { MemorySystem, createMemorySystem } from '@eden/ai';

export interface SimulationEngine {
  world: World;
  eventBus: EventBus;
  isRunning: boolean;
  tickInterval: ReturnType<typeof setInterval> | null;
  onTick: ((result: TickResult) => void) | null;
  stats: SimulationStats;
  brainConfig: BrainConfig | null;
  citizenMemories: Map<string, MemorySystem>;
  tickContext: TickContext | null;
}

export interface SimulationStats {
  totalTicks: number;
  averageTickDuration: number;
  totalDuration: number;
  ticksPerSecond: number;
}

export function createSimulationEngine(
  worldName: string,
  mapWidth: number,
  mapHeight: number,
  tickRate: number = 1000,
  brainConfig: BrainConfig | null = null
): SimulationEngine {
  const world = createWorld(worldName, mapWidth, mapHeight);
  world.time.tickRate = tickRate;

  return {
    world,
    eventBus: createEventBus(),
    isRunning: false,
    tickInterval: null,
    onTick: null,
    stats: {
      totalTicks: 0,
      averageTickDuration: 0,
      totalDuration: 0,
      ticksPerSecond: 0,
    },
    brainConfig,
    citizenMemories: new Map(),
    tickContext: null,
  };
}

export function addCitizen(
  engine: SimulationEngine,
  citizen: Citizen
): SimulationEngine {
  const newWorld = addCitizenToWorld(engine.world, citizen);

  // Initialize memory for new citizen
  const memories = createMemorySystem(citizen.identity.id);
  const newMemories = new Map(engine.citizenMemories);
  newMemories.set(citizen.identity.id, memories);

  return {
    ...engine,
    world: newWorld,
    citizenMemories: newMemories,
  };
}

export function startSimulation(engine: SimulationEngine): SimulationEngine {
  if (engine.isRunning) return engine;

  // Create tick context
  let tickContext = createTickContext(engine.world, engine.brainConfig);
  tickContext.citizenMemories = engine.citizenMemories;

  const tickRate = engine.world.time.tickRate;

  const interval = setInterval(async () => {
    try {
      // Update tick context
      tickContext.world = engine.world;
      tickContext.tick = engine.world.time.currentTick;

      const result = await executeTick(tickContext);

      // Update engine state
      engine.world = result.world;
      engine.citizenMemories = tickContext.citizenMemories;
      engine.stats.totalTicks++;
      engine.stats.totalDuration += result.duration;
      engine.stats.averageTickDuration =
        engine.stats.totalDuration / engine.stats.totalTicks;
      engine.stats.ticksPerSecond = 1000 / engine.stats.averageTickDuration;

      // Call callback if set
      if (engine.onTick) {
        engine.onTick(result);
      }
    } catch (error) {
      console.error('Tick error:', error);
    }
  }, tickRate);

  return {
    ...engine,
    isRunning: true,
    tickInterval: interval,
    tickContext,
  };
}

export function stopSimulation(engine: SimulationEngine): SimulationEngine {
  if (!engine.isRunning || !engine.tickInterval) return engine;

  clearInterval(engine.tickInterval);

  return {
    ...engine,
    isRunning: false,
    tickInterval: null,
  };
}

export function pauseSimulation(engine: SimulationEngine): SimulationEngine {
  return stopSimulation(engine);
}

export function resumeSimulation(engine: SimulationEngine): SimulationEngine {
  if (engine.isRunning) return engine;
  return startSimulation(engine);
}

export function setBrainConfig(
  engine: SimulationEngine,
  config: BrainConfig | null
): SimulationEngine {
  return {
    ...engine,
    brainConfig: config,
  };
}

export function setTickCallback(
  engine: SimulationEngine,
  callback: (result: TickResult) => void
): SimulationEngine {
  return {
    ...engine,
    onTick: callback,
  };
}

export function getSimulationStats(engine: SimulationEngine): SimulationStats {
  return { ...engine.stats };
}

export function getWorldState(engine: SimulationEngine): World {
  return engine.world;
}

export function getCitizenThoughts(result: TickResult): Map<string, string> {
  const thoughts = new Map<string, string>();
  for (const update of result.citizenUpdates) {
    thoughts.set(update.citizenId, update.thought);
  }
  return thoughts;
}
