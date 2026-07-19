import { describe, expect, it } from 'vitest';
import {
  advanceSimulationRuntime,
  createSimulationRuntime,
  createSimulationSnapshot,
  deserializeSimulationRuntime,
  serializeSimulationRuntime,
} from '.';

describe('server-authoritative simulation runtime', () => {
  it('is deterministic for the same seed', () => {
    let left = createSimulationRuntime({ seed: 42, citizenCount: 2 });
    let right = createSimulationRuntime({ seed: 42, citizenCount: 2 });

    for (let tick = 0; tick < 200; tick++) {
      left = advanceSimulationRuntime(left);
      right = advanceSimulationRuntime(right);
    }

    expect(createSimulationSnapshot(left)).toEqual(createSimulationSnapshot(right));
  });

  it('keeps an isolated brain and memory stream per citizen', () => {
    let state = createSimulationRuntime({ seed: 99, citizenCount: 2 });
    state = advanceSimulationRuntime(state);

    const ariaBrain = state.brains.get('citizen-aria');
    const marcusBrain = state.brains.get('citizen-marcus');

    expect(ariaBrain).toBeDefined();
    expect(marcusBrain).toBeDefined();
    expect(ariaBrain).not.toBe(marcusBrain);
    expect(ariaBrain?.memories.citizenId).toBe('citizen-aria');
    expect(marcusBrain?.memories.citizenId).toBe('citizen-marcus');
    expect(ariaBrain?.memories.shortTerm[0].citizenId).toBe('citizen-aria');
    expect(marcusBrain?.memories.shortTerm[0].citizenId).toBe('citizen-marcus');
  });

  it('restores an identical snapshot from serialized state', () => {
    let state = createSimulationRuntime({ seed: 7331 });
    for (let tick = 0; tick < 25; tick++) state = advanceSimulationRuntime(state);

    const restored = deserializeSimulationRuntime(
      JSON.parse(JSON.stringify(serializeSimulationRuntime(state)))
    );

    expect(createSimulationSnapshot(restored)).toEqual(createSimulationSnapshot(state));
  });

  it('remains stable for ten thousand ticks', () => {
    let state = createSimulationRuntime({ seed: 7 });
    for (let tick = 0; tick < 10_000; tick++) state = advanceSimulationRuntime(state);

    expect(state.time.currentTick).toBe(10_000);
    expect(state.recentEvents.length).toBeLessThanOrEqual(200);
    expect(createSimulationSnapshot(state).citizens).toHaveLength(4);
  });
});
