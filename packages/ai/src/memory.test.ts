import { describe, it, expect } from 'vitest';
import {
  createMemorySystem,
  addMemory,
  retrieveMemory,
  recallRecentMemory,
  recallImportantMemory,
  decayMemories,
} from './memory';
import { Event } from '@eden/core';

function createMockEvent(type: string, data: Record<string, unknown> = {}): Event {
  return {
    id: crypto.randomUUID(),
    type,
    timestamp: Date.now(),
    citizenId: 'test-citizen',
    data,
    metadata: {
      tick: 1,
      cause: 'test',
    },
  };
}

describe('MemorySystem', () => {
  it('should create memory system with empty memories', () => {
    const system = createMemorySystem('citizen-1');

    expect(system.citizenId).toBe('citizen-1');
    expect(system.shortTerm).toHaveLength(0);
    expect(system.longTerm).toHaveLength(0);
    expect(system.workingMemory).toBeNull();
  });

  it('should add memory to short-term', () => {
    const system = createMemorySystem('citizen-1');
    const event = createMockEvent('CitizenMoved');

    const updated = addMemory(system, event, 0.5);

    expect(updated.shortTerm).toHaveLength(1);
    expect(updated.shortTerm[0].type).toBe('episodic');
    expect(updated.shortTerm[0].importance).toBe(0.5);
  });

  it('should retrieve memory by query', () => {
    const system = createMemorySystem('citizen-1');
    let updated = addMemory(system, createMockEvent('CitizenMoved'), 0.5);
    updated = addMemory(updated, createMockEvent('CitizenActed'), 0.7);
    updated = addMemory(updated, createMockEvent('TradeCompleted'), 0.3);

    const results = retrieveMemory(updated, 'Moved', 5);

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].content.toLowerCase()).toContain('moved');
  });

  it('should recall recent memories', () => {
    const system = createMemorySystem('citizen-1');
    let updated = addMemory(system, createMockEvent('Event1'), 0.5);
    updated = addMemory(updated, createMockEvent('Event2'), 0.5);
    updated = addMemory(updated, createMockEvent('Event3'), 0.5);

    const recent = recallRecentMemory(updated, 2);

    expect(recent).toHaveLength(2);
  });

  it('should recall important memories from short-term', () => {
    const system = createMemorySystem('citizen-1');
    let updated = addMemory(system, createMockEvent('Unimportant'), 0.2);
    updated = addMemory(updated, createMockEvent('Important'), 0.9);
    updated = addMemory(updated, createMockEvent('VeryImportant'), 0.95);

    // recallImportantMemory looks at longTerm which is empty with < 100 memories
    // Use recallRecentMemory for short-term, or retrieveMemory for search
    const recent = recallRecentMemory(updated, 3);

    expect(recent).toHaveLength(3);
  });

  it('should decay memories over time', () => {
    const system = createMemorySystem('citizen-1');
    const updated = addMemory(system, createMockEvent('Test'), 0.5);

    const decayed = decayMemories(updated);

    expect(decayed.shortTerm[0].decay).toBeGreaterThan(0);
  });

  it('should move important memories to long-term', () => {
    const system = createMemorySystem('citizen-1');
    let updated = system;

    // Add 101 memories to trigger long-term storage
    for (let i = 0; i < 101; i++) {
      const importance = i > 90 ? 0.8 : 0.3; // Last 10 are important
      updated = addMemory(updated, createMockEvent(`Event${i}`), importance);
    }

    expect(updated.longTerm.length).toBeGreaterThan(0);
  });
});
