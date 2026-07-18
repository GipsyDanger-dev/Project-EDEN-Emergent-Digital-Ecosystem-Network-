/**
 * Obsidian-style Brain for EDEN Citizens
 * Uses markdown files with wiki-links as knowledge graph
 */

import { Citizen } from '@eden/core';

export interface Memory {
  id: string;
  type: 'experience' | 'knowledge' | 'relationship' | 'skill' | 'emotion' | 'location';
  title: string;
  content: string;
  tags: string[];
  links: string[];  // wiki-links to other memories
  importance: number;  // 0-1
  emotionalWeight: number;  // -1 to 1
  timestamp: number;
  tick: number;
  source: string;  // what caused this memory
}

export interface ObsidianBrain {
  citizenId: string;
  memories: Map<string, Memory>;
  dailyNotes: Map<string, DailyNote>;  // key: YYYY-MM-DD
  index: MemoryIndex;
  config: BrainConfig;
}

export interface DailyNote {
  date: string;
  summary: string;
  events: string[];
  thoughts: string[];
  decisions: string[];
  memories: string[];  // memory IDs created this day
}

export interface MemoryIndex {
  byType: Map<string, string[]>;
  byTag: Map<string, string[]>;
  byImportance: string[];  // sorted by importance
  recentMemories: string[];  // last 50 memories
  graph: GraphEdge[];  // connections between memories
}

export interface GraphEdge {
  from: string;
  to: string;
  strength: number;
  type: 'links' | 'temporal' | 'semantic' | 'causal';
}

export interface BrainConfig {
  maxMemories: number;
  decayRate: number;
  consolidationThreshold: number;
  linkDistance: number;  // temporal distance for auto-linking
}

const DEFAULT_CONFIG: BrainConfig = {
  maxMemories: 1000,
  decayRate: 0.01,
  consolidationThreshold: 5,
  linkDistance: 10,  // ticks
};

// ==================== CREATION ====================

export function createObsidianBrain(
  citizenId: string,
  config: Partial<BrainConfig> = {}
): ObsidianBrain {
  return {
    citizenId,
    memories: new Map(),
    dailyNotes: new Map(),
    index: createEmptyIndex(),
    config: { ...DEFAULT_CONFIG, ...config },
  };
}

function createEmptyIndex(): MemoryIndex {
  return {
    byType: new Map(),
    byTag: new Map(),
    byImportance: [],
    recentMemories: [],
    graph: [],
  };
}

// ==================== MEMORY OPERATIONS ====================

export function addMemory(
  brain: ObsidianBrain,
  memory: Omit<Memory, 'id' | 'timestamp'>
): ObsidianBrain {
  const id = `mem_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const newMemory: Memory = {
    ...memory,
    id,
    timestamp: Date.now(),
  };

  const newMemories = new Map(brain.memories);
  newMemories.set(id, newMemory);

  // Update index
  const newIndex = updateIndex(brain.index, newMemory, brain.config);

  // Auto-link with recent memories
  const autoLinks = findAutoLinks(newMemory, brain);
  newMemory.links = [...newMemory.links, ...autoLinks];

  // Update graph
  const newGraph = updateGraph(newIndex.graph, newMemory, autoLinks);

  // Update daily note
  const dateKey = new Date().toISOString().split('T')[0];
  const newDailyNotes = new Map(brain.dailyNotes);
  const existingNote = newDailyNotes.get(dateKey) || createDailyNote(dateKey);
  existingNote.memories.push(id);
  newDailyNotes.set(dateKey, existingNote);

  return {
    ...brain,
    memories: newMemories,
    dailyNotes: newDailyNotes,
    index: { ...newIndex, graph: newGraph },
  };
}

function createDailyNote(date: string): DailyNote {
  return {
    date,
    summary: '',
    events: [],
    thoughts: [],
    decisions: [],
    memories: [],
  };
}

function updateIndex(
  index: MemoryIndex,
  memory: Memory,
  config: BrainConfig
): MemoryIndex {
  // Update byType
  const byType = new Map(index.byType);
  const typeList = byType.get(memory.type) || [];
  byType.set(memory.type, [...typeList, memory.id]);

  // Update byTag
  const byTag = new Map(index.byTag);
  for (const tag of memory.tags) {
    const tagList = byTag.get(tag) || [];
    byTag.set(tag, [...tagList, memory.id]);
  }

  // Update byImportance (sorted)
  const byImportance = [...index.byImportance, memory.id].sort((a, b) => {
    const memA = index.byImportance.includes(a) ? 0 : memory.importance;
    const memB = index.byImportance.includes(b) ? 0 : memory.importance;
    return memB - memA;
  }).slice(0, config.maxMemories);

  // Update recentMemories
  const recentMemories = [memory.id, ...index.recentMemories].slice(0, 50);

  return {
    ...index,
    byType,
    byTag,
    byImportance,
    recentMemories,
  };
}

function findAutoLinks(memory: Memory, brain: ObsidianBrain): string[] {
  const links: string[] = [];
  const recentIds = brain.index.recentMemories.slice(0, brain.config.linkDistance);

  for (const id of recentIds) {
    const existing = brain.memories.get(id);
    if (!existing) continue;

    // Link if same type
    if (existing.type === memory.type) {
      links.push(id);
    }

    // Link if shared tags
    const sharedTags = memory.tags.filter(t => existing.tags.includes(t));
    if (sharedTags.length > 0) {
      links.push(id);
    }

    // Link if high emotional weight
    if (Math.abs(memory.emotionalWeight) > 0.5 && Math.abs(existing.emotionalWeight) > 0.5) {
      links.push(id);
    }
  }

  return [...new Set(links)];  // unique links
}

function updateGraph(
  graph: GraphEdge[],
  memory: Memory,
  links: string[]
): GraphEdge[] {
  const newEdges: GraphEdge[] = links.map(linkId => ({
    from: memory.id,
    to: linkId,
    strength: 0.5,
    type: 'causal' as const,
  }));

  return [...graph, ...newEdges].slice(-500);  // limit graph size
}

// ==================== RETRIEVAL ====================

export function recallMemories(
  brain: ObsidianBrain,
  query: string,
  options: {
    limit?: number;
    type?: Memory['type'];
    tags?: string[];
    minImportance?: number;
  } = {}
): Memory[] {
  const { limit = 10, type, tags, minImportance = 0 } = options;

  let candidates = Array.from(brain.memories.values());

  // Filter by type
  if (type) {
    candidates = candidates.filter(m => m.type === type);
  }

  // Filter by tags
  if (tags && tags.length > 0) {
    candidates = candidates.filter(m =>
      tags.some(t => m.tags.includes(t))
    );
  }

  // Filter by importance
  candidates = candidates.filter(m => m.importance >= minImportance);

  // Score by relevance to query
  const scored = candidates.map(memory => ({
    memory,
    score: scoreMemory(memory, query),
  }));

  // Sort by score
  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map(s => s.memory);
}

function scoreMemory(memory: Memory, query: string): number {
  let score = 0;

  // Title match
  if (memory.title.toLowerCase().includes(query.toLowerCase())) {
    score += 0.4;
  }

  // Content match
  if (memory.content.toLowerCase().includes(query.toLowerCase())) {
    score += 0.3;
  }

  // Tag match
  const queryWords = query.toLowerCase().split(' ');
  const tagMatches = memory.tags.filter(t =>
    queryWords.some(w => t.toLowerCase().includes(w))
  ).length;
  score += (tagMatches / Math.max(memory.tags.length, 1)) * 0.2;

  // Importance boost
  score += memory.importance * 0.1;

  // Recency boost (decay over time)
  const age = Date.now() - memory.timestamp;
  const recencyBoost = Math.exp(-age / (1000 * 60 * 60 * 24));  // decay over days
  score += recencyBoost * 0.1;

  return score;
}

export function getRecentMemories(
  brain: ObsidianBrain,
  limit: number = 10
): Memory[] {
  return brain.index.recentMemories
    .slice(0, limit)
    .map(id => brain.memories.get(id))
    .filter((m): m is Memory => m !== undefined);
}

export function getImportantMemories(
  brain: ObsidianBrain,
  limit: number = 10
): Memory[] {
  return brain.index.byImportance
    .slice(0, limit)
    .map(id => brain.memories.get(id))
    .filter((m): m is Memory => m !== undefined);
}

export function getMemoriesByType(
  brain: ObsidianBrain,
  type: Memory['type'],
  limit: number = 10
): Memory[] {
  const ids = brain.index.byType.get(type) || [];
  return ids
    .slice(0, limit)
    .map(id => brain.memories.get(id))
    .filter((m): m is Memory => m !== undefined);
}

export function getConnectedMemories(
  brain: ObsidianBrain,
  memoryId: string,
  depth: number = 1
): Memory[] {
  const connected = new Set<string>();
  const toVisit = [memoryId];
  let currentDepth = 0;

  while (currentDepth < depth && toVisit.length > 0) {
    const nextVisit: string[] = [];

    for (const id of toVisit) {
      // Find edges from this memory
      const outEdges = brain.index.graph.filter(e => e.from === id);
      const inEdges = brain.index.graph.filter(e => e.to === id);

      for (const edge of [...outEdges, ...inEdges]) {
        const targetId = edge.from === id ? edge.to : edge.from;
        if (!connected.has(targetId) && targetId !== memoryId) {
          connected.add(targetId);
          nextVisit.push(targetId);
        }
      }
    }

    toVisit.length = 0;
    toVisit.push(...nextVisit);
    currentDepth++;
  }

  return Array.from(connected)
    .map(id => brain.memories.get(id))
    .filter((m): m is Memory => m !== undefined);
}

// ==================== KNOWLEDGE GRAPH ====================

export function getGraphStats(brain: ObsidianBrain): {
  totalMemories: number;
  totalEdges: number;
  typeDistribution: Record<string, number>;
  topTags: [string, number][];
  avgImportance: number;
  graphDensity: number;
} {
  const memories = Array.from(brain.memories.values());

  // Type distribution
  const typeDistribution: Record<string, number> = {};
  for (const mem of memories) {
    typeDistribution[mem.type] = (typeDistribution[mem.type] || 0) + 1;
  }

  // Tag frequency
  const tagFrequency = new Map<string, number>();
  for (const mem of memories) {
    for (const tag of mem.tags) {
      tagFrequency.set(tag, (tagFrequency.get(tag) || 0) + 1);
    }
  }
  const topTags = Array.from(tagFrequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  // Average importance
  const avgImportance = memories.length > 0
    ? memories.reduce((sum, m) => sum + m.importance, 0) / memories.length
    : 0;

  // Graph density
  const maxEdges = memories.length * (memories.length - 1) / 2;
  const graphDensity = maxEdges > 0 ? brain.index.graph.length / maxEdges : 0;

  return {
    totalMemories: memories.length,
    totalEdges: brain.index.graph.length,
    typeDistribution,
    topTags,
    avgImportance,
    graphDensity,
  };
}

// ==================== EXPORT TO MARKDOWN ====================

export function exportToMarkdown(brain: ObsidianBrain): string {
  const lines: string[] = [];

  lines.push(`# ${brain.citizenId} Brain`);
  lines.push('');
  lines.push(`Total memories: ${brain.memories.size}`);
  lines.push('');

  // Export memories as markdown files
  for (const [id, memory] of brain.memories) {
    lines.push(`## ${memory.title}`);
    lines.push('');
    lines.push(`**Type:** ${memory.type}`);
    lines.push(`**Importance:** ${Math.round(memory.importance * 100)}%`);
    lines.push(`**Tags:** ${memory.tags.map(t => `#${t}`).join(' ')}`);
    lines.push('');

    if (memory.links.length > 0) {
      lines.push('**Links:**');
      for (const linkId of memory.links) {
        const linked = brain.memories.get(linkId);
        if (linked) {
          lines.push(`- [[${linked.title}]]`);
        }
      }
      lines.push('');
    }

    lines.push(memory.content);
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  // Export daily notes
  lines.push('# Daily Notes');
  lines.push('');

  for (const [date, note] of brain.dailyNotes) {
    lines.push(`## ${date}`);
    lines.push('');
    if (note.summary) {
      lines.push(note.summary);
      lines.push('');
    }
    if (note.thoughts.length > 0) {
      lines.push('### Thoughts');
      for (const thought of note.thoughts) {
        lines.push(`- ${thought}`);
      }
      lines.push('');
    }
    if (note.decisions.length > 0) {
      lines.push('### Decisions');
      for (const decision of note.decisions) {
        lines.push(`- ${decision}`);
      }
      lines.push('');
    }
  }

  return lines.join('\n');
}

// ==================== GRAPH EXPORT ====================

export function exportGraphToDOT(brain: ObsidianBrain): string {
  const lines: string[] = [];

  lines.push('graph Brain {');
  lines.push('  rankdir=LR;');
  lines.push('  node [shape=box];');
  lines.push('');

  // Nodes
  for (const [id, memory] of brain.memories) {
    const label = memory.title.replace(/"/g, '\\"');
    const color = getTypeColor(memory.type);
    lines.push(`  "${id}" [label="${label}" fillcolor="${color}" style=filled];`);
  }

  lines.push('');

  // Edges
  for (const edge of brain.index.graph) {
    lines.push(`  "${edge.from}" -- "${edge.to}" [penwidth=${edge.strength * 2}];`);
  }

  lines.push('}');

  return lines.join('\n');
}

function getTypeColor(type: Memory['type']): string {
  const colors: Record<string, string> = {
    experience: '#3498db',
    knowledge: '#2ecc71',
    relationship: '#e74c3c',
    skill: '#f39c12',
    emotion: '#9b59b6',
    location: '#1abc9c',
  };
  return colors[type] || '#95a5a6';
}
