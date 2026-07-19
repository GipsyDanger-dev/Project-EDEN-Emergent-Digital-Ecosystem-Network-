import {
  advanceSimulationRuntime,
  createSimulationRuntime,
  createSimulationSnapshot,
  deserializeSimulationRuntime,
  serializeSimulationRuntime,
  type RuntimeConfig,
  type SimulationRuntimeState,
} from '@eden/engine';
import type { SimulationSnapshot } from '@eden/core';
import type { SimulationStore } from './simulation-store';

type SnapshotListener = (snapshot: SimulationSnapshot) => void;

export interface SimulationServiceOptions extends RuntimeConfig {
  persistEveryTicks?: number;
}

export class SimulationService {
  private state: SimulationRuntimeState;
  private timer: ReturnType<typeof setInterval> | null = null;
  private ticking = false;
  private readonly listeners = new Set<SnapshotListener>();
  private readonly persistEveryTicks: number;

  constructor(
    private readonly store: SimulationStore,
    private readonly options: SimulationServiceOptions = {}
  ) {
    this.state = createSimulationRuntime(options);
    this.persistEveryTicks = Math.max(1, options.persistEveryTicks ?? 10);
  }

  async initialize(): Promise<void> {
    const saved = await this.store.load(this.state.worldId);
    if (saved) {
      this.state = deserializeSimulationRuntime(saved);
    }
    this.state = { ...this.state, isRunning: false };
  }

  start(): void {
    if (this.timer) return;
    this.state = { ...this.state, isRunning: true };
    this.timer = setInterval(() => void this.tick(), this.state.time.tickRate);
    this.broadcast();
  }

  pause(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    this.state = { ...this.state, isRunning: false };
    this.broadcast();
  }

  async tick(): Promise<SimulationSnapshot> {
    if (this.ticking) return this.getSnapshot();
    this.ticking = true;
    try {
      this.state = advanceSimulationRuntime(this.state);
      if (this.state.time.currentTick % this.persistEveryTicks === 0) {
        await this.persist();
      }
      const snapshot = this.getSnapshot();
      for (const listener of this.listeners) listener(snapshot);
      return snapshot;
    } finally {
      this.ticking = false;
    }
  }

  getSnapshot(): SimulationSnapshot {
    return createSimulationSnapshot(this.state);
  }

  subscribe(listener: SnapshotListener): () => void {
    this.listeners.add(listener);
    listener(this.getSnapshot());
    return () => this.listeners.delete(listener);
  }

  async persist(): Promise<void> {
    await this.store.save(serializeSimulationRuntime(this.state));
  }

  async close(): Promise<void> {
    this.pause();
    await this.persist();
    await this.store.close();
  }

  private broadcast(): void {
    const snapshot = this.getSnapshot();
    for (const listener of this.listeners) listener(snapshot);
  }
}
