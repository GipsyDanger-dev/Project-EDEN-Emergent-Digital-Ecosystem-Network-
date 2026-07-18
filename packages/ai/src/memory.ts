import { Event } from '@eden/core';

export interface Memory {
  id: string;
  citizenId: string;
  type: 'episodic' | 'semantic' | 'procedural';
  content: string;
  importance: number;  // 0-1
  emotion: string;
  timestamp: number;
  decay: number;  // 0-1, how much this memory has faded
  associations: string[];  // IDs of related memories
}

export interface MemorySystem {
  citizenId: string;
  shortTerm: Memory[];  // Recent memories (last ~100)
  longTerm: Memory[];   // Important memories (persisted)
  workingMemory: Memory | null;  // Current focus
}

export function createMemorySystem(citizenId: string): MemorySystem {
  return {
    citizenId,
    shortTerm: [],
    longTerm: [],
    workingMemory: null,
  };
}

export function addMemory(
  system: MemorySystem,
  event: Event,
  importance: number
): MemorySystem {
  const memory: Memory = {
    id: crypto.randomUUID(),
    citizenId: system.citizenId,
    type: classifyMemoryType(event),
    content: formatMemoryContent(event),
    importance,
    emotion: detectEmotion(event),
    timestamp: event.timestamp,
    decay: 0,
    associations: [],
  };

  // Ensure shortTerm is an array
  const currentShortTerm = Array.isArray(system.shortTerm) ? system.shortTerm : [];
  const currentLongTerm = Array.isArray(system.longTerm) ? system.longTerm : [];

  // Add to short-term memory
  let newShortTerm = [...currentShortTerm, memory];

  // Keep only last 100 memories in short-term
  if (newShortTerm.length > 100) {
    // Move important ones to long-term
    const toPromote = newShortTerm
      .filter(m => m.importance > 0.7)
      .slice(-10);

    const newLongTerm = [...currentLongTerm, ...toPromote];

    newShortTerm = newShortTerm.slice(-100);

    return {
      ...system,
      shortTerm: newShortTerm,
      longTerm: newLongTerm,
    };
  }

  return {
    ...system,
    shortTerm: newShortTerm,
  };
}

export function retrieveMemory(
  system: MemorySystem,
  query: string,
  limit: number = 5
): Memory[] {
  // Ensure arrays
  const shortTerm = Array.isArray(system.shortTerm) ? system.shortTerm : [];
  const longTerm = Array.isArray(system.longTerm) ? system.longTerm : [];

  // Combine all memories
  const allMemories = [...shortTerm, ...longTerm];

  // Simple keyword matching (to be enhanced with vector search later)
  const scored = allMemories.map(memory => ({
    memory,
    score: calculateRelevance(memory, query),
  }));

  // Sort by relevance
  scored.sort((a, b) => b.score - a.score);

  return scored
    .slice(0, limit)
    .map(s => s.memory);
}

export function recallRecentMemory(
  system: MemorySystem,
  limit: number = 10
): Memory[] {
  const shortTerm = Array.isArray(system.shortTerm) ? system.shortTerm : [];
  return [...shortTerm]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);
}

export function recallImportantMemory(
  system: MemorySystem,
  limit: number = 10
): Memory[] {
  const longTerm = Array.isArray(system.longTerm) ? system.longTerm : [];
  return [...longTerm]
    .sort((a, b) => b.importance - a.importance)
    .slice(0, limit);
}

export function decayMemories(system: MemorySystem): MemorySystem {
  const decayRate = 0.01;
  const shortTerm = Array.isArray(system.shortTerm) ? system.shortTerm : [];
  const longTerm = Array.isArray(system.longTerm) ? system.longTerm : [];

  const newShortTerm = shortTerm
    .map(m => ({
      ...m,
      decay: Math.min(1, m.decay + decayRate),
    }))
    .filter(m => m.decay < 0.9);  // Remove heavily decayed memories

  const newLongTerm = longTerm
    .map(m => ({
      ...m,
      decay: Math.min(1, m.decay + decayRate * 0.1),  // Long-term decays slower
    }))
    .filter(m => m.decay < 0.95);

  return {
    ...system,
    shortTerm: newShortTerm,
    longTerm: newLongTerm,
  };
}

function classifyMemoryType(event: Event): Memory['type'] {
  if (event.type.includes('Action') || event.type.includes('Move')) {
    return 'episodic';
  }
  if (event.type.includes('Learn') || event.type.includes('Discover')) {
    return 'semantic';
  }
  return 'episodic';
}

function formatMemoryContent(event: Event): string {
  const data = event.data as Record<string, unknown>;
  return `${event.type}: ${JSON.stringify(data)}`;
}

function detectEmotion(event: Event): string {
  const type = event.type.toLowerCase();
  if (type.includes('happy') || type.includes('achieve')) return 'happy';
  if (type.includes('sad') || type.includes('fail')) return 'sad';
  if (type.includes('angry') || type.includes('conflict')) return 'angry';
  if (type.includes('fear') || type.includes('danger')) return 'fearful';
  return 'neutral';
}

function calculateRelevance(memory: Memory, query: string): number {
  const queryLower = query.toLowerCase();
  const contentLower = memory.content.toLowerCase();

  // Simple keyword matching
  const queryWords = queryLower.split(' ');
  const matchCount = queryWords.filter(word => contentLower.includes(word)).length;
  const keywordScore = matchCount / queryWords.length;

  // Recency score
  const age = Date.now() - memory.timestamp;
  const recencyScore = Math.exp(-age / (1000 * 60 * 60 * 24));  // Decay over days

  // Importance score
  const importanceScore = memory.importance;

  // Weighted combination
  return keywordScore * 0.5 + recencyScore * 0.3 + importanceScore * 0.2;
}
