import type { Emotions, Event, Needs } from '../types';

export interface RuntimeMemorySnapshot {
  id: string;
  type: 'episodic' | 'semantic' | 'procedural';
  content: string;
  importance: number;
  emotion: string;
  timestamp: number;
  associations: string[];
}

export interface CitizenBrainSnapshot {
  citizenId: string;
  currentGoal: string | null;
  lastThought: string;
  lastExplanation: string;
  lastDecision: {
    action: string;
    target?: string;
    reason: string;
  } | null;
  decisionCount: number;
  memories: RuntimeMemorySnapshot[];
}

export interface RuntimeCitizenSnapshot {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  color: string;
  position: [number, number, number];
  needs: Needs;
  emotions: Emotions;
  isAlive: boolean;
  action: string;
  brain: CitizenBrainSnapshot;
}

export interface RuntimeResourceSnapshot {
  id: string;
  type: string;
  amount: number;
  position: [number, number, number];
}

export interface SimulationSnapshot {
  version: 1;
  worldId: string;
  worldName: string;
  seed: number;
  tick: number;
  time: {
    timeOfDay: number;
    day: number;
    season: string;
    year: number;
  };
  isRunning: boolean;
  citizens: RuntimeCitizenSnapshot[];
  resources: RuntimeResourceSnapshot[];
  recentEvents: Event[];
}

export type SimulationServerMessage =
  | { type: 'snapshot'; data: SimulationSnapshot }
  | { type: 'events'; data: Event[] }
  | { type: 'status'; data: { isRunning: boolean; tick: number } };
