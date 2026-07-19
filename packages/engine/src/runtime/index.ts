import type { Event, SimulationSnapshot } from '@eden/core';
import {
  createInitialState,
  satisfyStateNeed,
  updateCitizen,
  updateEmotions,
  type Citizen,
} from '@eden/citizen';
import {
  addMemory,
  createBrainRegistry,
  getOrCreateCitizenBrain,
  recordBrainOutput,
  thinkLocal,
  type BrainRegistry,
  type CitizenBrainState,
} from '@eden/ai';
import { advanceTime, createTimeSystem, type TimeSystem } from '../time';
import { updateResources, type Resource } from '../world/resources';

export interface RuntimeConfig {
  worldId?: string;
  worldName?: string;
  seed?: number;
  tickRate?: number;
  citizenCount?: number;
}

export interface SimulationRuntimeState {
  version: 1;
  worldId: string;
  worldName: string;
  seed: number;
  randomState: number;
  time: TimeSystem;
  citizens: Citizen[];
  resources: Resource[];
  brains: BrainRegistry;
  recentEvents: Event[];
  isRunning: boolean;
}

export interface SerializedRuntimeState extends Omit<SimulationRuntimeState, 'brains'> {
  brains: CitizenBrainState[];
}

const CITIZEN_TEMPLATES = [
  { id: 'citizen-aria', name: 'Aria', age: 28, gender: 'female' as const, color: '#ef7d5b' },
  { id: 'citizen-marcus', name: 'Marcus', age: 34, gender: 'male' as const, color: '#5da8d6' },
  { id: 'citizen-luna', name: 'Luna', age: 24, gender: 'female' as const, color: '#6dc69a' },
  { id: 'citizen-orion', name: 'Orion', age: 31, gender: 'male' as const, color: '#d6a65d' },
];

const WORLD_BOUNDARY = 30;

const CITIZEN_COLORS = new Map(CITIZEN_TEMPLATES.map((template) => [template.id, template.color]));

export function createSimulationRuntime(config: RuntimeConfig = {}): SimulationRuntimeState {
  const seed = normalizeSeed(config.seed ?? 7331);
  const citizenCount = Math.max(1, Math.min(config.citizenCount ?? CITIZEN_TEMPLATES.length, CITIZEN_TEMPLATES.length));
  let randomState = seed;

  const citizens = CITIZEN_TEMPLATES.slice(0, citizenCount).map((template, index) => {
    const personality = createPersonality(randomState);
    randomState = personality.state;

    return {
      identity: {
        id: template.id,
        name: template.name,
        age: template.age,
        gender: template.gender,
        birthDate: 0,
        personality: personality.value,
      },
      location: { x: index * 3 - 1, y: 0, z: index % 2 === 0 ? 2 : -2 },
      state: createInitialState(),
      tickCount: 0,
      isAlive: true,
    } satisfies Citizen;
  });

  return {
    version: 1,
    worldId: config.worldId ?? 'world-eden-prime',
    worldName: config.worldName ?? 'EDEN Prime',
    seed,
    randomState,
    time: createTimeSystem(config.tickRate ?? 1000),
    citizens,
    resources: createInitialResources(),
    brains: createBrainRegistry(citizens.map((citizen) => citizen.identity.id)),
    recentEvents: [],
    isRunning: false,
  };
}

export function advanceSimulationRuntime(state: SimulationRuntimeState): SimulationRuntimeState {
  const time = advanceTime(state.time);
  const tick = time.currentTick;
  const events: Event[] = [];
  let eventSequence = 0;
  let randomState = state.randomState;
  let resources = updateResources(state.resources, time.season);
  const brains = new Map(state.brains);

  const citizens = state.citizens.map((previousCitizen) => {
    if (!previousCitizen.isAlive) return previousCitizen;

    let citizen = updateCitizen(previousCitizen, tick);
    const citizenId = citizen.identity.id;
    const brain = getOrCreateCitizenBrain(brains, citizenId);
    const currentGoal = deriveGoal(citizen);
    const perception = buildPerception(citizen, state.citizens, resources, time);
    const output = thinkLocal({
      citizen,
      perception,
      memories: brain.memories,
      currentGoal,
    });

    const decisionEvent = createRuntimeEvent(
      tick,
      eventSequence++,
      'DecisionMade',
      citizenId,
      {
        thought: output.thought,
        action: output.decision.action,
        target: output.decision.target,
        reason: output.decision.reason,
        explanation: output.explanation,
      },
      'citizen_brain'
    );
    events.push(decisionEvent);

    const actionResult = executeAction(citizen, output.decision.action, resources, randomState);
    citizen = actionResult.citizen;
    resources = actionResult.resources;
    randomState = actionResult.randomState;

    if (actionResult.moved) {
      events.push(createRuntimeEvent(
        tick,
        eventSequence++,
        'CitizenMoved',
        citizenId,
        { from: previousCitizen.location, to: citizen.location },
        decisionEvent.id
      ));
    }

    if (actionResult.satisfiedNeed) {
      events.push(createRuntimeEvent(
        tick,
        eventSequence++,
        'NeedSatisfied',
        citizenId,
        { need: actionResult.satisfiedNeed },
        decisionEvent.id
      ));
    }

    citizen = applyDerivedEmotions(citizen);
    const memories = addMemory(
      brain.memories,
      decisionEvent,
      output.decision.action === 'idle' ? 0.3 : 0.6,
      () => `memory-${tick}-${citizenId}-${brain.decisionCount + 1}`
    );
    brains.set(citizenId, recordBrainOutput(brain, output, memories, currentGoal));
    return citizen;
  });

  return {
    ...state,
    randomState,
    time,
    citizens,
    resources,
    brains,
    recentEvents: [...state.recentEvents, ...events].slice(-200),
  };
}

export function createSimulationSnapshot(state: SimulationRuntimeState): SimulationSnapshot {
  return {
    version: 1,
    worldId: state.worldId,
    worldName: state.worldName,
    seed: state.seed,
    tick: state.time.currentTick,
    time: {
      timeOfDay: state.time.timeOfDay,
      day: state.time.day,
      season: state.time.season,
      year: state.time.year,
    },
    isRunning: state.isRunning,
    citizens: state.citizens.map((citizen) => {
      const brain = getOrCreateCitizenBrain(state.brains, citizen.identity.id);
      return {
        id: citizen.identity.id,
        name: citizen.identity.name,
        age: citizen.identity.age,
        gender: citizen.identity.gender,
        color: CITIZEN_COLORS.get(citizen.identity.id) ?? '#76e6b8',
        position: [citizen.location.x, 0.5, citizen.location.y],
        needs: { ...citizen.state.needs },
        emotions: { ...citizen.state.emotions },
        isAlive: citizen.isAlive,
        action: brain.lastDecision?.action ?? 'idle',
        brain: {
          citizenId: brain.citizenId,
          currentGoal: brain.currentGoal,
          lastThought: brain.lastThought,
          lastExplanation: brain.lastExplanation,
          lastDecision: brain.lastDecision,
          decisionCount: brain.decisionCount,
          memories: [...brain.memories.shortTerm, ...brain.memories.longTerm]
            .slice(-100)
            .map((memory) => ({
              id: memory.id,
              type: memory.type,
              content: memory.content,
              importance: memory.importance,
              emotion: memory.emotion,
              timestamp: memory.timestamp,
              associations: [...memory.associations],
            })),
        },
      };
    }),
    resources: state.resources.map((resource) => ({
      id: resource.id,
      type: resource.type,
      amount: resource.amount,
      position: [resource.location.x, 0.2, resource.location.y],
    })),
    recentEvents: state.recentEvents.slice(-50),
  };
}

export function serializeSimulationRuntime(state: SimulationRuntimeState): SerializedRuntimeState {
  return {
    ...state,
    brains: Array.from(state.brains.values()),
  };
}

export function deserializeSimulationRuntime(serialized: SerializedRuntimeState): SimulationRuntimeState {
  return {
    ...serialized,
    brains: new Map(serialized.brains.map((brain) => [brain.citizenId, brain])),
  };
}

function executeAction(
  citizen: Citizen,
  action: string,
  resources: Resource[],
  randomState: number
): {
  citizen: Citizen;
  resources: Resource[];
  randomState: number;
  moved: boolean;
  satisfiedNeed: keyof Citizen['state']['needs'] | null;
} {
  const originalLocation = citizen.location;
  let nextCitizen = citizen;
  let nextResources = resources;
  let satisfiedNeed: keyof Citizen['state']['needs'] | null = null;

  if (action === 'seek_hunger') {
    const food = findNearestResource(citizen, resources, 'food');
    if (food) {
      const distance = distanceBetween(citizen.location, food.location);
      if (distance <= 1.5 && food.amount > 0) {
        nextCitizen = { ...citizen, state: satisfyStateNeed(citizen.state, 'hunger', 24) };
        nextResources = resources.map((resource) => resource.id === food.id
          ? { ...resource, amount: Math.max(0, resource.amount - 5) }
          : resource);
        satisfiedNeed = 'hunger';
      } else {
        nextCitizen = { ...citizen, location: moveTowards(citizen.location, food.location, 0.8) };
      }
    }
  } else if (action === 'seek_energy') {
    nextCitizen = { ...citizen, state: satisfyStateNeed(citizen.state, 'energy', 8) };
    satisfiedNeed = 'energy';
  } else if (action === 'seek_social' || action === 'socialize') {
    nextCitizen = { ...citizen, state: satisfyStateNeed(citizen.state, 'social', 4) };
    satisfiedNeed = 'social';
  } else if (action === 'seek_safety') {
    nextCitizen = { ...citizen, state: satisfyStateNeed(citizen.state, 'safety', 4) };
    satisfiedNeed = 'safety';
  } else if (action === 'look_around') {
    const xRandom = nextRandom(randomState);
    const yRandom = nextRandom(xRandom.state);
    randomState = yRandom.state;
    nextCitizen = {
      ...citizen,
      location: {
        x: clamp(citizen.location.x + (xRandom.value - 0.5) * 1.8, -WORLD_BOUNDARY, WORLD_BOUNDARY),
        y: clamp(citizen.location.y + (yRandom.value - 0.5) * 1.8, -WORLD_BOUNDARY, WORLD_BOUNDARY),
        z: 0,
      },
    };
  }

  return {
    citizen: nextCitizen,
    resources: nextResources,
    randomState,
    moved: originalLocation.x !== nextCitizen.location.x || originalLocation.y !== nextCitizen.location.y,
    satisfiedNeed,
  };
}

function buildPerception(
  citizen: Citizen,
  citizens: Citizen[],
  resources: Resource[],
  time: TimeSystem
) {
  return {
    nearbyCitizens: citizens
      .filter((other) => other.identity.id !== citizen.identity.id && other.isAlive)
      .map((other) => ({
        id: other.identity.id,
        name: other.identity.name,
        distance: distanceBetween(citizen.location, other.location),
      }))
      .filter((other) => other.distance <= 10)
      .sort((a, b) => a.distance - b.distance),
    nearbyResources: resources
      .filter((resource) => resource.amount > 0)
      .map((resource) => ({
        id: resource.id,
        type: resource.type,
        amount: resource.amount,
        distance: distanceBetween(citizen.location, resource.location),
      }))
      .filter((resource) => resource.distance <= 20)
      .sort((a, b) => a.distance - b.distance),
    timeOfDay: getTimeLabel(time.timeOfDay),
    season: time.season,
  };
}

function deriveGoal(citizen: Citizen): string | null {
  const [need, value] = (Object.entries(citizen.state.needs) as [string, number][])
    .sort((left, right) => left[1] - right[1])[0];
  return value < 60 ? `Restore ${need} above 70%` : null;
}

function applyDerivedEmotions(citizen: Citizen): Citizen {
  const needs = citizen.state.needs;
  const wellbeing = Object.values(needs).reduce((sum, value) => sum + value, 0) / 4;
  return {
    ...citizen,
    state: updateEmotions(citizen.state, {
      happiness: (wellbeing - 50) * 1.2,
      sadness: (50 - wellbeing) * 0.8,
      anger: needs.safety < 25 ? 20 : 0,
      fear: needs.safety < 30 ? 35 : -5,
    }),
  };
}

function createInitialResources(): Resource[] {
  return [
    createStableResource('resource-food-grove', 'food', 100, 8, 6),
    createStableResource('resource-food-orchard', 'food', 120, -21, 17),
    createStableResource('resource-water-spring', 'water', 150, -12, -9),
    createStableResource('resource-water-lake', 'water', 200, 14, 11),
    createStableResource('resource-wood-north', 'wood', 80, 5, -22),
    createStableResource('resource-wood-west', 'wood', 110, -24, -5),
    createStableResource('resource-stone-ridge', 'stone', 120, -18, 22),
    createStableResource('resource-ore-east', 'ore', 70, 24, -16),
    createStableResource('resource-herb-meadow', 'herb', 60, 19, 23),
  ];
}

function createStableResource(
  id: string,
  type: Resource['type'],
  amount: number,
  x: number,
  y: number
): Resource {
  return {
    id,
    type,
    name: type[0].toUpperCase() + type.slice(1),
    amount,
    maxAmount: amount,
    location: { x, y, z: 0 },
    respawnRate: type === 'water' ? 2 : 0.5,
    isDepleted: false,
  };
}

function createRuntimeEvent(
  tick: number,
  sequence: number,
  type: string,
  citizenId: string,
  data: Record<string, unknown>,
  cause: string
): Event {
  return {
    id: `event-${tick}-${sequence}`,
    type,
    timestamp: tick * 1000,
    citizenId,
    data,
    metadata: { tick, cause },
  };
}

function createPersonality(state: number) {
  const values: number[] = [];
  let currentState = state;
  for (let index = 0; index < 5; index++) {
    const result = nextRandom(currentState);
    currentState = result.state;
    values.push(Math.round(30 + result.value * 40));
  }
  return {
    state: currentState,
    value: {
      openness: values[0],
      conscientiousness: values[1],
      extraversion: values[2],
      agreeableness: values[3],
      neuroticism: values[4],
    },
  };
}

function nextRandom(state: number): { value: number; state: number } {
  let nextState = state | 0;
  nextState ^= nextState << 13;
  nextState ^= nextState >>> 17;
  nextState ^= nextState << 5;
  const normalizedState = nextState >>> 0;
  return { value: normalizedState / 4294967296, state: normalizedState };
}

function normalizeSeed(seed: number): number {
  const normalized = seed >>> 0;
  return normalized === 0 ? 1 : normalized;
}

function findNearestResource(citizen: Citizen, resources: Resource[], type: Resource['type']) {
  return resources
    .filter((resource) => resource.type === type && resource.amount > 0)
    .sort((left, right) =>
      distanceBetween(citizen.location, left.location) - distanceBetween(citizen.location, right.location)
    )[0] ?? null;
}

function moveTowards(
  from: Citizen['location'],
  to: Citizen['location'],
  speed: number
): Citizen['location'] {
  const distance = distanceBetween(from, to);
  if (distance <= speed) return { ...to };
  return {
    x: from.x + ((to.x - from.x) / distance) * speed,
    y: from.y + ((to.y - from.y) / distance) * speed,
    z: 0,
  };
}

function distanceBetween(
  left: { x: number; y: number },
  right: { x: number; y: number }
): number {
  return Math.hypot(right.x - left.x, right.y - left.y);
}

function getTimeLabel(timeOfDay: number): string {
  if (timeOfDay < 600 || timeOfDay >= 2100) return 'night';
  if (timeOfDay < 900) return 'morning';
  if (timeOfDay < 1500) return 'afternoon';
  if (timeOfDay < 1800) return 'evening';
  return 'night';
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(maximum, value));
}
