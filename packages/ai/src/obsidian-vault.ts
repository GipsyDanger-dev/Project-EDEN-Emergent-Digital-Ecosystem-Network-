/**
 * Obsidian Vault System for EDEN Citizens
 * Creates actual .md files that can be opened in Obsidian
 */

export interface VaultMemory {
  id: string;
  title: string;
  type: 'experience' | 'knowledge' | 'relationship' | 'skill' | 'emotion' | 'observation' | 'decision';
  content: string;
  tags: string[];
  links: string[];  // wiki-links to other memories
  connections: string[];  // IDs of connected memories
  importance: number;
  emotionalWeight: number;
  tick: number;
  timestamp: number;
}

export interface VaultConfig {
  citizenId: string;
  citizenName: string;
  basePath: string;  // where to save the vault
}

// ==================== MARKDOWN GENERATION ====================

export function generateMemoryMarkdown(memory: VaultMemory, citizenName: string): string {
  const frontmatter = generateFrontmatter(memory);
  const body = generateBody(memory, citizenName);

  return `---
${frontmatter}
---

${body}`;
}

function generateFrontmatter(memory: VaultMemory): string {
  const lines: string[] = [];

  lines.push(`id: ${memory.id}`);
  lines.push(`type: ${memory.type}`);
  lines.push(`importance: ${memory.importance}`);
  lines.push(`emotional_weight: ${memory.emotionalWeight}`);
  lines.push(`tick: ${memory.tick}`);
  lines.push(`created: ${new Date(memory.timestamp).toISOString()}`);
  lines.push(`tags: [${memory.tags.join(', ')}]`);

  if (memory.connections.length > 0) {
    lines.push(`connections: [${memory.connections.join(', ')}]`);
  }

  return lines.join('\n');
}

function generateBody(memory: VaultMemory, citizenName: string): string {
  const lines: string[] = [];

  // Title
  lines.push(`# ${memory.title}`);
  lines.push('');

  // Type badge
  const typeEmoji = getTypeEmoji(memory.type);
  lines.push(`> ${typeEmoji} **${memory.type.toUpperCase()}** | Importance: ${Math.round(memory.importance * 100)}%`);
  lines.push('');

  // Content
  lines.push(memory.content);
  lines.push('');

  // Tags
  if (memory.tags.length > 0) {
    lines.push('## Tags');
    lines.push('');
    lines.push(memory.tags.map(t => `#${t.replace(/\s+/g, '-')}`).join(' '));
    lines.push('');
  }

  // Wiki-links to other memories
  if (memory.links.length > 0) {
    lines.push('## Related Memories');
    lines.push('');
    for (const link of memory.links) {
      lines.push(`- [[${link}]]`);
    }
    lines.push('');
  }

  // Metadata footer
  lines.push('---');
  lines.push(`*Recorded by ${citizenName} at tick ${memory.tick}*`);
  lines.push(`*Emotional weight: ${memory.emotionalWeight >= 0 ? '+' : ''}${Math.round(memory.emotionalWeight * 100)}%*`);

  return lines.join('\n');
}

function getTypeEmoji(type: VaultMemory['type']): string {
  const emojis: Record<string, string> = {
    experience: '📚',
    knowledge: '💡',
    relationship: '👥',
    skill: '⚡',
    emotion: '💜',
    observation: '👁️',
    decision: '⚖️',
  };
  return emojis[type] || '📝';
}

// ==================== VAULT STRUCTURE ====================

export function generateVaultStructure(citizenName: string): string {
  const lines: string[] = [];

  lines.push(`# ${citizenName}'s Mind`);
  lines.push('');
  lines.push('> This vault contains the memories, thoughts, and knowledge of a living being in EDEN.');
  lines.push('');
  lines.push('## 📂 Folders');
  lines.push('');
  lines.push('- [[Experiences/]] - Life experiences and events');
  lines.push('- [[Knowledge/]] - Things learned about the world');
  lines.push('- [[Relationships/]] - Connections with other citizens');
  lines.push('- [[Skills/]] - Abilities developed over time');
  lines.push('- [[Emotions/]] - Emotional experiences');
  lines.push('- [[Observations/]] - Things noticed in the environment');
  lines.push('- [[Decisions/]] - Choices made and their reasoning');
  lines.push('');
  lines.push('## 📊 Stats');
  lines.push('');
  lines.push('- Total memories will appear here');
  lines.push('- Most important memories');
  lines.push('- Recent activity');
  lines.push('');
  lines.push('## 🔗 Quick Links');
  lines.push('');
  lines.push('- [[Daily Notes/]] - Daily journal entries');
  lines.push('- [[Graph View]] - Visual knowledge graph');
  lines.push('');

  return lines.join('\n');
}

export function generateDailyNote(date: string, citizenName: string, memories: VaultMemory[]): string {
  const lines: string[] = [];

  lines.push(`# ${date} - ${citizenName}'s Day`);
  lines.push('');
  lines.push('## 📝 Summary');
  lines.push('');
  lines.push(`A day with ${memories.length} new memories.`);
  lines.push('');

  // Group memories by type
  const byType = memories.reduce((acc, m) => {
    acc[m.type] = acc[m.type] || [];
    acc[m.type].push(m);
    return acc;
  }, {} as Record<string, VaultMemory[]>);

  for (const [type, typeMemories] of Object.entries(byType)) {
    lines.push(`## ${getTypeEmoji(type as VaultMemory['type'])} ${type.charAt(0).toUpperCase() + type.slice(1)}`);
    lines.push('');
    for (const mem of typeMemories) {
      lines.push(`- [[${mem.title}]]`);
    }
    lines.push('');
  }

  // Key decisions
  const decisions = byType['decision'] || [];
  if (decisions.length > 0) {
    lines.push('## ⚖️ Key Decisions');
    lines.push('');
    for (const dec of decisions) {
      lines.push(`- **${dec.title}**: ${dec.content.split('.')[0]}.`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

export function generateGraphView(citizenName: string, memories: VaultMemory[]): string {
  const lines: string[] = [];

  lines.push(`# ${citizenName}'s Knowledge Graph`);
  lines.push('');
  lines.push('## 📊 Graph Statistics');
  lines.push('');
  lines.push(`- **Total Nodes:** ${memories.length}`);

  const edges = memories.reduce((sum, m) => sum + m.connections.length, 0);
  lines.push(`- **Total Edges:** ${edges}`);
  lines.push('');

  // Type distribution
  const byType = memories.reduce((acc, m) => {
    acc[m.type] = (acc[m.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  lines.push('## 🎨 Node Types');
  lines.push('');
  for (const [type, count] of Object.entries(byType)) {
    lines.push(`- ${getTypeEmoji(type as VaultMemory['type'])} **${type}**: ${count}`);
  }
  lines.push('');

  // Most connected memories
  const mostConnected = [...memories]
    .sort((a, b) => b.connections.length - a.connections.length)
    .slice(0, 5);

  lines.push('## 🔗 Most Connected Memories');
  lines.push('');
  for (const mem of mostConnected) {
    lines.push(`- **${mem.title}** (${mem.connections.length} connections)`);
  }
  lines.push('');

  // Most important memories
  const mostImportant = [...memories]
    .sort((a, b) => b.importance - a.importance)
    .slice(0, 5);

  lines.push('## ⭐ Most Important Memories');
  lines.push('');
  for (const mem of mostImportant) {
    lines.push(`- **${mem.title}** (${Math.round(mem.importance * 100)}%)`);
  }
  lines.push('');

  // Recent memories
  const recent = [...memories]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 5);

  lines.push('## 🕐 Recent Memories');
  lines.push('');
  for (const mem of recent) {
    lines.push(`- [[${mem.title}]] (tick ${mem.tick})`);
  }
  lines.push('');

  // Mermaid graph (Obsidian supports this)
  lines.push('## 📈 Visual Graph (Mermaid)');
  lines.push('');
  lines.push('```mermaid');
  lines.push('graph LR');

  // Create nodes
  for (const mem of memories.slice(0, 20)) {  // Limit for readability
    const safeId = mem.id.replace(/[^a-zA-Z0-9]/g, '_');
    const safeTitle = mem.title.replace(/[^a-zA-Z0-9\s]/g, '').slice(0, 20);
    lines.push(`    ${safeId}["${safeTitle}"]`);
  }

  lines.push('');

  // Create edges
  for (const mem of memories.slice(0, 20)) {
    const safeId = mem.id.replace(/[^a-zA-Z0-9]/g, '_');
    for (const connId of mem.connections.slice(0, 3)) {
      const safeConnId = connId.replace(/[^a-zA-Z0-9]/g, '_');
      lines.push(`    ${safeId} --> ${safeConnId}`);
    }
  }

  lines.push('```');
  lines.push('');

  return lines.join('\n');
}

// ==================== MEMORY CREATION ====================

export function createVaultMemory(
  id: string,
  title: string,
  type: VaultMemory['type'],
  content: string,
  tags: string[],
  importance: number,
  emotionalWeight: number,
  tick: number,
  links: string[] = [],
  connections: string[] = []
): VaultMemory {
  return {
    id,
    title,
    type,
    content,
    tags,
    links,
    connections,
    importance,
    emotionalWeight,
    tick,
    timestamp: Date.now(),
  };
}

export function findRelatedMemories(
  memory: VaultMemory,
  allMemories: VaultMemory[],
  limit: number = 5
): VaultMemory[] {
  const scored = allMemories
    .filter(m => m.id !== memory.id)
    .map(m => ({
      memory: m,
      score: calculateRelationScore(memory, m),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored.map(s => s.memory);
}

function calculateRelationScore(a: VaultMemory, b: VaultMemory): number {
  let score = 0;

  // Same type
  if (a.type === b.type) score += 0.3;

  // Shared tags
  const sharedTags = a.tags.filter(t => b.tags.includes(t));
  score += sharedTags.length * 0.2;

  // Similar importance
  score += (1 - Math.abs(a.importance - b.importance)) * 0.2;

  // Temporal proximity
  const tickDiff = Math.abs(a.tick - b.tick);
  if (tickDiff < 10) score += 0.3;
  else if (tickDiff < 50) score += 0.1;

  return score;
}

// ==================== EXPORT ====================

export function exportVaultToJSON(
  citizenName: string,
  memories: VaultMemory[]
): string {
  const vault = {
    name: `${citizenName}'s Mind`,
    created: new Date().toISOString(),
    citizen: citizenName,
    stats: {
      totalMemories: memories.length,
      byType: memories.reduce((acc, m) => {
        acc[m.type] = (acc[m.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      totalConnections: memories.reduce((sum, m) => sum + m.connections.length, 0),
    },
    memories: memories.map(m => ({
      ...m,
      markdown: generateMemoryMarkdown(m, citizenName),
    })),
  };

  return JSON.stringify(vault, null, 2);
}

export function generateMarkdownDownload(
  citizenName: string,
  memories: VaultMemory[]
): { filename: string; content: string }[] {
  const files: { filename: string; content: string }[] = [];

  // Index file
  files.push({
    filename: `${citizenName}_Mind/00_Index.md`,
    content: generateVaultStructure(citizenName),
  });

  // Graph view
  files.push({
    filename: `${citizenName}_Mind/Graph_View.md`,
    content: generateGraphView(citizenName, memories),
  });

  // Daily notes
  const byDate = memories.reduce((acc, m) => {
    const date = new Date(m.timestamp).toISOString().split('T')[0];
    acc[date] = acc[date] || [];
    acc[date].push(m);
    return acc;
  }, {} as Record<string, VaultMemory[]>);

  for (const [date, dayMemories] of Object.entries(byDate)) {
    files.push({
      filename: `${citizenName}_Mind/Daily_Notes/${date}.md`,
      content: generateDailyNote(date, citizenName, dayMemories),
    });
  }

  // Individual memories
  for (const memory of memories) {
    const folder = memory.type.charAt(0).toUpperCase() + memory.type.slice(1) + 's';
    files.push({
      filename: `${citizenName}_Mind/${folder}/${memory.title.replace(/[^a-zA-Z0-9]/g, '_')}.md`,
      content: generateMemoryMarkdown(memory, citizenName),
    });
  }

  return files;
}
