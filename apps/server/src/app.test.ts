import { afterEach, describe, expect, it } from 'vitest';
import type { EdenApp } from './app';
import { buildApp } from './app';
import { MemorySimulationStore } from './simulation-store';
import { SimulationService } from './simulation-service';

describe('EDEN server', () => {
  let app: EdenApp | null = null;

  afterEach(async () => {
    if (app) await app.close();
    app = null;
  });

  it('serves health and the current simulation snapshot', async () => {
    app = await buildApp({ logger: false, autoStart: false, seed: 42 });

    const health = await app.inject({ method: 'GET', url: '/health' });
    const snapshot = await app.inject({ method: 'GET', url: '/api/snapshot' });

    expect(health.statusCode).toBe(200);
    expect(health.json()).toMatchObject({ status: 'ok', tick: 0 });
    expect(snapshot.statusCode).toBe(200);
    expect(snapshot.json()).toMatchObject({ worldId: 'world-eden-prime', seed: 42, tick: 0 });
  });

  it('restores the persisted world state', async () => {
    const store = new MemorySimulationStore();
    const first = new SimulationService(store, { seed: 11, persistEveryTicks: 1 });
    await first.initialize();
    await first.tick();
    await first.tick();
    await first.persist();

    const second = new SimulationService(store, { seed: 11 });
    await second.initialize();

    expect(second.getSnapshot().tick).toBe(2);
    expect(second.getSnapshot()).toEqual(first.getSnapshot());
  });

  it('publishes snapshots and exposes authoritative runtime controls', async () => {
    app = await buildApp({ logger: false, autoStart: false, seed: 73, tickRate: 60_000 });
    const ticks: number[] = [];
    const unsubscribe = app.simulation.subscribe((snapshot) => ticks.push(snapshot.tick));

    await app.simulation.tick();
    const resume = await app.inject({ method: 'POST', url: '/api/simulation/resume' });
    const pause = await app.inject({ method: 'POST', url: '/api/simulation/pause' });
    unsubscribe();

    expect(ticks).toContain(0);
    expect(ticks).toContain(1);
    expect(resume.json()).toMatchObject({ tick: 1, isRunning: true });
    expect(pause.json()).toMatchObject({ tick: 1, isRunning: false });
  });
});
