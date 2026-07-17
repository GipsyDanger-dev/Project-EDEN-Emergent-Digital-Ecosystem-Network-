import { World, createWorld } from '../world';
import { EventBus, createEventBus } from '../events';
import { executeTick, TickResult } from './tick';

export interface SimulationEngine {
  world: World;
  eventBus: EventBus;
  isRunning: boolean;
  tickInterval: NodeJS.Timeout | null;
  onTick: ((result: TickResult) => void) | null;
  stats: SimulationStats;
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
  tickRate: number = 1000
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
  };
}

export function startSimulation(engine: SimulationEngine): SimulationEngine {
  if (engine.isRunning) return engine;

  const tickRate = engine.world.time.tickRate;

  const interval = setInterval(async () => {
    const result = await executeTick(engine.world, engine.eventBus);

    // Update engine state
    engine.world = result.world;
    engine.stats.totalTicks++;
    engine.stats.totalDuration += result.duration;
    engine.stats.averageTickDuration =
      engine.stats.totalDuration / engine.stats.totalTicks;
    engine.stats.ticksPerSecond = 1000 / engine.stats.averageTickDuration;

    // Call callback if set
    if (engine.onTick) {
      engine.onTick(result);
    }
  }, tickRate);

  return {
    ...engine,
    isRunning: true,
    tickInterval: interval,
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
