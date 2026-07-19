import type { CitizenBrainSnapshot, RuntimeMemorySnapshot } from '@eden/core';
import type { MemoryIndex, ObsidianBrain, ObsidianMemory } from '@eden/ai';

const MEMORY_TYPES: Record<RuntimeMemorySnapshot['type'], ObsidianMemory['type']> = {
  episodic: 'experience',
  semantic: 'knowledge',
  procedural: 'skill',
};

export function toObsidianBrain(brain: CitizenBrainSnapshot): ObsidianBrain {
  const memories = new Map<string, ObsidianMemory>();
  const byType = new Map<string, string[]>();
  const byTag = new Map<string, string[]>();
  const graph: MemoryIndex['graph'] = [];

  brain.memories.forEach((memory, index) => {
    const type = MEMORY_TYPES[memory.type];
    const tags = [memory.type, memory.emotion].filter(Boolean);
    const converted: ObsidianMemory = {
      id: memory.id,
      type,
      title: memory.content.slice(0, 48) || 'Untitled memory',
      content: memory.content,
      tags,
      links: memory.associations,
      importance: memory.importance,
      emotionalWeight: memory.emotion === 'positive' ? 0.6 : memory.emotion === 'negative' ? -0.6 : 0,
      timestamp: memory.timestamp,
      tick: Math.max(0, Math.floor(memory.timestamp / 1_000)),
      source: 'server_runtime',
    };
    memories.set(memory.id, converted);
    byType.set(type, [...(byType.get(type) ?? []), memory.id]);
    for (const tag of tags) byTag.set(tag, [...(byTag.get(tag) ?? []), memory.id]);
    for (const target of memory.associations) graph.push({ from: memory.id, to: target, strength: 1, type: 'semantic' });
    if (index > 0) graph.push({ from: brain.memories[index - 1].id, to: memory.id, strength: 0.35, type: 'temporal' });
  });

  return {
    citizenId: brain.citizenId,
    memories,
    dailyNotes: new Map(),
    index: {
      byType,
      byTag,
      byImportance: [...memories.values()].sort((a, b) => b.importance - a.importance).map((memory) => memory.id),
      recentMemories: brain.memories.slice(-50).map((memory) => memory.id),
      graph,
    },
    config: { maxMemories: 1_000, decayRate: 0.01, consolidationThreshold: 5, linkDistance: 10 },
  };
}
