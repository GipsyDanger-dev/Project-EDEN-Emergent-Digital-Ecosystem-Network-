import type { BrainOutput } from './brain';
import { createMemorySystem, type MemorySystem } from './memory';

export interface CitizenBrainState {
  citizenId: string;
  memories: MemorySystem;
  currentGoal: string | null;
  lastThought: string;
  lastExplanation: string;
  lastDecision: BrainOutput['decision'] | null;
  decisionCount: number;
}

export type BrainRegistry = Map<string, CitizenBrainState>;

export function createCitizenBrain(citizenId: string): CitizenBrainState {
  return {
    citizenId,
    memories: createMemorySystem(citizenId),
    currentGoal: null,
    lastThought: '',
    lastExplanation: '',
    lastDecision: null,
    decisionCount: 0,
  };
}

export function createBrainRegistry(citizenIds: string[] = []): BrainRegistry {
  return new Map(citizenIds.map((citizenId) => [citizenId, createCitizenBrain(citizenId)]));
}

export function getOrCreateCitizenBrain(
  registry: BrainRegistry,
  citizenId: string
): CitizenBrainState {
  const existing = registry.get(citizenId);
  if (existing) return existing;

  const brain = createCitizenBrain(citizenId);
  registry.set(citizenId, brain);
  return brain;
}

export function recordBrainOutput(
  brain: CitizenBrainState,
  output: BrainOutput,
  memories: MemorySystem,
  currentGoal: string | null
): CitizenBrainState {
  return {
    ...brain,
    memories,
    currentGoal,
    lastThought: output.thought,
    lastExplanation: output.explanation,
    lastDecision: output.decision,
    decisionCount: brain.decisionCount + 1,
  };
}
