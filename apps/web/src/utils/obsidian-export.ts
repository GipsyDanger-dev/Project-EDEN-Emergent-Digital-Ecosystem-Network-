/**
 * Obsidian Vault Export - Creates actual vault that works with Obsidian
 */

export interface CitizenMemory {
  id: string;
  title: string;
  type: 'experience' | 'knowledge' | 'relationship' | 'skill' | 'emotion' | 'decision' | 'observation';
  content: string;
  tags: string[];
  linkedMemories: string[];  // titles of linked memories
  importance: number;
  emotionalWeight: number;
  tick: number;
  timestamp: number;
}

// ==================== FILE GENERATORS ====================

export function generateMemoryFile(memory: CitizenMemory, citizenName: string): string {
  const lines: string[] = [];

  // Frontmatter
  lines.push('---');
  lines.push(`type: ${memory.type}`);
  lines.push(`citizen: ${citizenName}`);
  lines.push(`importance: ${Math.round(memory.importance * 100)}`);
  lines.push(`emotional_weight: ${memory.emotionalWeight}`);
  lines.push(`tick: ${memory.tick}`);
  lines.push(`date: ${new Date(memory.timestamp).toISOString().split('T')[0]}`);
  lines.push('---');
  lines.push('');

  // Title
  lines.push(`# ${memory.title}`);
  lines.push('');

  // Tags at the top for visibility
  lines.push(memory.tags.map(t => `#${t.replace(/\s+/g, '-')}`).join(' '));
  lines.push('');

  // Content
  lines.push(memory.content);
  lines.push('');

  // Wiki-links to related memories
  if (memory.linkedMemories.length > 0) {
    lines.push('## Related');
    lines.push('');
    for (const link of memory.linkedMemories) {
      lines.push(`- [[${link}]]`);
    }
    lines.push('');
  }

  // Metadata
  lines.push('---');
  lines.push(`*Importance: ${Math.round(memory.importance * 100)}% | Emotional: ${memory.emotionalWeight >= 0 ? '+' : ''}${Math.round(memory.emotionalWeight * 100)}%*`);

  return lines.join('\n');
}

export function generateIndexFile(citizenName: string, memories: CitizenMemory[]): string {
  const lines: string[] = [];

  lines.push(`# ${citizenName}'s Mind`);
  lines.push('');
  lines.push('Welcome to the knowledge vault of **' + citizenName + '**.');
  lines.push('Every thought, experience, and relationship is captured here.');
  lines.push('');
  lines.push('---');
  lines.push('');

  // Stats
  lines.push('## 📊 Overview');
  lines.push('');
  lines.push(`- **Total Memories:** ${memories.length}`);

  const byType = memories.reduce((acc, m) => {
    acc[m.type] = (acc[m.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  for (const [type, count] of Object.entries(byType)) {
    lines.push(`- **${type.charAt(0).toUpperCase() + type.slice(1)}:** ${count}`);
  }
  lines.push('');

  // Type sections with links
  const typeEmoji: Record<string, string> = {
    experience: '📚',
    knowledge: '💡',
    relationship: '👥',
    skill: '⚡',
    emotion: '💜',
    decision: '⚖️',
    observation: '👁️',
  };

  for (const [type, count] of Object.entries(byType)) {
    const typeMemories = memories.filter(m => m.type === type);
    lines.push(`## ${typeEmoji[type] || '📝'} ${type.charAt(0).toUpperCase() + type.slice(1)}s (${count})`);
    lines.push('');
    for (const mem of typeMemories.slice(0, 10)) {
      lines.push(`- [[${mem.title}]]`);
    }
    if (typeMemories.length > 10) {
      lines.push(`- *... and ${typeMemories.length - 10} more*`);
    }
    lines.push('');
  }

  // Recent memories
  lines.push('## 🕐 Recent');
  lines.push('');
  const recent = [...memories].sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);
  for (const mem of recent) {
    lines.push(`- [[${mem.title}]]`);
  }
  lines.push('');

  // Most important
  lines.push('## ⭐ Most Important');
  lines.push('');
  const important = [...memories].sort((a, b) => b.importance - a.importance).slice(0, 10);
  for (const mem of important) {
    lines.push(`- [[${mem.title}]] (${Math.round(mem.importance * 100)}%)`);
  }
  lines.push('');

  return lines.join('\n');
}

export function generateDailyNote(date: string, citizenName: string, memories: CitizenMemory[]): string {
  const lines: string[] = [];

  lines.push(`# ${date}`);
  lines.push('');
  lines.push(`**${citizenName}'s Day**`);
  lines.push('');

  // Group by type
  const byType = memories.reduce((acc, m) => {
    acc[m.type] = acc[m.type] || [];
    acc[m.type].push(m);
    return acc;
  }, {} as Record<string, CitizenMemory[]>);

  for (const [type, typeMemories] of Object.entries(byType)) {
    const emoji = getTypeEmoji(type);
    lines.push(`## ${emoji} ${type.charAt(0).toUpperCase() + type.slice(1)}`);
    lines.push('');
    for (const mem of typeMemories) {
      lines.push(`- [[${mem.title}]]`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

function getTypeEmoji(type: string): string {
  const emojis: Record<string, string> = {
    experience: '📚',
    knowledge: '💡',
    relationship: '👥',
    skill: '⚡',
    emotion: '💜',
    decision: '⚖️',
    observation: '👁️',
  };
  return emojis[type] || '📝';
}

// ==================== VAULT CREATION ====================

export interface VaultFile {
  path: string;
  content: string;
}

export function createObsidianVault(
  citizenName: string,
  memories: CitizenMemory[]
): VaultFile[] {
  const files: VaultFile[] = [];
  const prefix = `${citizenName}_EDEN_Vault`;

  // Index
  files.push({
    path: `${prefix}/00 - Index.md`,
    content: generateIndexFile(citizenName, memories),
  });

  // README
  files.push({
    path: `${prefix}/README.md`,
    content: `# ${citizenName}'s EDEN Vault\n\nThis vault contains the memories and knowledge of **${citizenName}**, an AI citizen in the EDEN digital world.\n\n## How to Use\n\n1. Open this folder as a vault in Obsidian\n2. Use Graph View to see memory connections\n3. Click on any [[wiki-link]] to navigate\n4. Tags help organize and filter memories\n\n## Structure\n\n- **Index** - Overview of all memories\n- **Experiences/** - Life events\n- **Knowledge/** - Things learned\n- **Relationships/** - People met\n- **Skills/** - Abilities gained\n- **Emotions/** - Feelings experienced\n- **Decisions/** - Choices made\n- **Observations/** - Things noticed\n- **Daily Notes/** - Daily journals\n`,
  });

  // Create folders and files
  const typeFolders: Record<string, string> = {
    experience: 'Experiences',
    knowledge: 'Knowledge',
    relationship: 'Relationships',
    skill: 'Skills',
    emotion: 'Emotions',
    decision: 'Decisions',
    observation: 'Observations',
  };

  // Add memory files
  for (const memory of memories) {
    const folder = typeFolders[memory.type] || 'Other';
    const filename = memory.title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, ' ');
    files.push({
      path: `${prefix}/${folder}/${filename}.md`,
      content: generateMemoryFile(memory, citizenName),
    });
  }

  // Add daily notes
  const byDate = memories.reduce((acc, m) => {
    const date = new Date(m.timestamp).toISOString().split('T')[0];
    acc[date] = acc[date] || [];
    acc[date].push(m);
    return acc;
  }, {} as Record<string, CitizenMemory[]>);

  for (const [date, dayMemories] of Object.entries(byDate)) {
    files.push({
      path: `${prefix}/Daily Notes/${date}.md`,
      content: generateDailyNote(date, citizenName, dayMemories),
    });
  }

  return files;
}

// ==================== DOWNLOAD ====================

export async function downloadObsidianVault(
  citizenName: string,
  memories: CitizenMemory[]
): Promise<void> {
  const files = createObsidianVault(citizenName, memories);

  // Create downloadable content
  const lines: string[] = [];

  lines.push('# EDEN Obsidian Vault');
  lines.push('');
  lines.push('This file contains all the markdown files for the Obsidian vault.');
  lines.push('Copy each section into its own .md file in the folder structure shown.');
  lines.push('');
  lines.push('## Folder Structure');
  lines.push('');
  lines.push('```');
  for (const file of files) {
    lines.push(file.path);
  }
  lines.push('```');
  lines.push('');
  lines.push('---');
  lines.push('');

  // Add each file
  for (const file of files) {
    lines.push(`## 📄 ${file.path}`);
    lines.push('');
    lines.push('```markdown');
    lines.push(file.content);
    lines.push('```');
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `${citizenName}_Obsidian_Vault.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadAllVaults(
  citizens: { name: string; memories: CitizenMemory[] }[]
): void {
  const lines: string[] = [];

  lines.push('# EDEN Obsidian Vaults - All Citizens');
  lines.push('');
  lines.push('---');
  lines.push('');

  for (const citizen of citizens) {
    const files = createObsidianVault(citizen.name, citizen.memories);

    lines.push(`# 🧠 ${citizen.name}'s Vault`);
    lines.push('');

    for (const file of files) {
      lines.push(`## 📄 ${file.path}`);
      lines.push('');
      lines.push('```markdown');
      lines.push(file.content);
      lines.push('```');
      lines.push('');
    }

    lines.push('---');
    lines.push('');
  }

  const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'EDEN_All_Citizen_Vaults.md';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
