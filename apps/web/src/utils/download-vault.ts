/**
 * Download Vault as ZIP for Obsidian
 */

import {
  VaultMemory,
  createVaultMemory,
  generateMemoryMarkdown,
  generateVaultStructure,
  generateDailyNote,
  generateGraphView,
} from '@eden/ai';

// Simple ZIP implementation (no external dependency)
class SimpleZip {
  private files: { name: string; content: string }[] = [];

  addFile(name: string, content: string) {
    this.files.push({ name, content });
  }

  async generate(): Promise<Blob> {
    // For browser, we'll create a simple concatenated format
    // In production, use a proper ZIP library like JSZip
    const parts: string[] = [];

    for (const file of this.files) {
      parts.push(`=== FILE: ${file.name} ===`);
      parts.push(file.content);
      parts.push('');
    }

    return new Blob([parts.join('\n')], { type: 'text/plain' });
  }
}

export async function downloadVault(
  citizenName: string,
  memories: VaultMemory[]
): Promise<void> {
  const zip = new SimpleZip();

  // Add index file
  zip.addFile('00_Index.md', generateVaultStructure(citizenName));

  // Add graph view
  zip.addFile('Graph_View.md', generateGraphView(citizenName, memories));

  // Group memories by type
  const byType = memories.reduce((acc, m) => {
    acc[m.type] = acc[m.type] || [];
    acc[m.type].push(m);
    return acc;
  }, {} as Record<string, VaultMemory[]>);

  // Add memory files
  for (const [type, typeMemories] of Object.entries(byType)) {
    const folder = type.charAt(0).toUpperCase() + type.slice(1) + 's';
    for (const memory of typeMemories) {
      const filename = `${folder}/${memory.title.replace(/[^a-zA-Z0-9]/g, '_')}.md`;
      zip.addFile(filename, generateMemoryMarkdown(memory, citizenName));
    }
  }

  // Add daily notes
  const byDate = memories.reduce((acc, m) => {
    const date = new Date(m.timestamp).toISOString().split('T')[0];
    acc[date] = acc[date] || [];
    acc[date].push(m);
    return acc;
  }, {} as Record<string, VaultMemory[]>);

  for (const [date, dayMemories] of Object.entries(byDate)) {
    zip.addFile(`Daily_Notes/${date}.md`, generateDailyNote(date, citizenName, dayMemories));
  }

  // Generate and download
  const blob = await zip.generate();
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `${citizenName}_EDEN_Vault.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadAllVaults(
  citizens: { name: string; memories: VaultMemory[] }[]
): Promise<void> {
  const zip = new SimpleZip();

  for (const citizen of citizens) {
    const prefix = citizen.name;

    // Add index file
    zip.addFile(`${prefix}/00_Index.md`, generateVaultStructure(citizen.name));

    // Add graph view
    zip.addFile(`${prefix}/Graph_View.md`, generateGraphView(citizen.name, citizen.memories));

    // Group memories by type
    const byType = citizen.memories.reduce((acc, m) => {
      acc[m.type] = acc[m.type] || [];
      acc[m.type].push(m);
      return acc;
    }, {} as Record<string, VaultMemory[]>);

    // Add memory files
    for (const [type, typeMemories] of Object.entries(byType)) {
      const folder = type.charAt(0).toUpperCase() + type.slice(1) + 's';
      for (const memory of typeMemories) {
        const filename = `${prefix}/${folder}/${memory.title.replace(/[^a-zA-Z0-9]/g, '_')}.md`;
        zip.addFile(filename, generateMemoryMarkdown(memory, citizen.name));
      }
    }
  }

  return zip.generate().then(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'EDEN_All_Vaults.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
}
