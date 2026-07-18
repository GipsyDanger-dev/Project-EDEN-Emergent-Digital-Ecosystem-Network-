/**
 * Memory Generator - Auto-generates memories to create dense neural network
 */

import { ObsidianBrain, Memory } from '@eden/ai';

// Memory templates for auto-generation
const MEMORY_TEMPLATES = {
  experience: [
    'Walked through the forest today',
    'Found a interesting rock formation',
    'Watched the sunset from the hill',
    'Explored the eastern border',
    'Discovered a hidden path',
    'Crossed the river carefully',
    'Rest under the old oak tree',
    'Followed the sound of birds',
    'Climbed to the highest point',
    'Sheltered from the rain',
    'Wandered through the meadow',
    'Sat by the water stream',
    'Listened to the wind',
    'Tracked animal footprints',
    'Built a small shelter',
  ],
  knowledge: [
    'Learned that berries near water are safe',
    'Discovered石头 can be used for tools',
    'Learned to predict weather by clouds',
    'Found out fish are easier to catch at dawn',
    'Learned that certain plants have medicinal value',
    'Discovered fire can be made from dry wood',
    'Learned to read the stars for navigation',
    'Found that working together is more efficient',
    'Discovered the value of rest after work',
    'Learned to identify safe drinking water',
    'Found that morning is the best time for hunting',
    'Learned to store food for later',
    'Discovered the importance of shelter',
    'Found that some plants are poisonous',
    'Learned to track time by the sun',
  ],
  emotion: [
    'Felt a deep sense of peace today',
    'Experienced joy when seeing a friend',
    'Felt lonely during the night',
    'Was anxious about the approaching storm',
    'Felt proud after helping someone',
    'Experienced gratitude for the warm sun',
    'Felt scared in the dark forest',
    'Was happy to find fresh water',
    'Felt content just sitting and thinking',
    'Experienced wonder at the night sky',
    'Felt sad thinking about the past',
    'Was excited about exploring new areas',
    'Felt calm by the flowing river',
    'Experienced surprise at finding a cave',
    'Felt determined to survive',
  ],
  observation: [
    'Noticed birds flying south',
    'Observed clouds gathering in the west',
    'Saw another citizen in the distance',
    'Found animal tracks near the water',
    'Noticed the trees changing color',
    'Observed the river flowing faster',
    'Saw fish jumping in the lake',
    'Found fresh footprints in the mud',
    'Noticed the temperature dropping',
    'Observed stars appearing one by one',
    'Saw smoke in the distance',
    'Found berry bushes near the path',
    'Noticed the wind changing direction',
    'Observed a deer drinking water',
    'Found a natural spring',
  ],
  decision: [
    'Decided to rest before continuing',
    'Chose to take the longer, safer path',
    'Decided to share food with a stranger',
    'Chose to explore rather than stay put',
    'Decided to build shelter before dark',
    'Chose to trust the new citizen',
    'Decided to save food for later',
    'Chose to investigate the strange sound',
    'Decided to follow the river downstream',
    'Chose to wait for better weather',
    'Decided to learn from the elder',
    'Chose to work alone today',
    'Decided to help build the community',
    'Chose to document what I learned',
    'Decided to stay optimistic',
  ],
  relationship: [
    'Had a meaningful conversation with a friend',
    'Shared stories around the fire',
    'Worked together on a project',
    'Taught someone a new skill',
    'Learned from an experienced citizen',
    'Helped someone in need',
    'Exchanged knowledge with a neighbor',
    'Built trust through honest communication',
    'Collaborated on solving a problem',
    'Supported someone during difficult times',
    'Shared resources with the community',
    'Mentored a younger citizen',
    'Resolved a disagreement peacefully',
    'Celebrated a success together',
    'Planned future activities with friends',
  ],
  skill: [
    'Improved my foraging technique',
    'Got better at reading the weather',
    'Learned to identify new plants',
    'Practiced fire-making skills',
    'Improved my navigation abilities',
    'Learned to craft simple tools',
    'Got better at predicting animal behavior',
    'Practiced communication skills',
    'Learned basic first aid',
    'Improved my shelter building',
    'Got better at time management',
    'Learned to conserve energy',
    'Practiced observation skills',
    'Improved my memory techniques',
    'Learned to work more efficiently',
  ],
};

const TAGS_BY_TYPE: Record<string, string[]> = {
  experience: ['outdoor', 'exploration', 'nature', 'adventure', 'daily'],
  knowledge: ['learning', 'survival', 'wisdom', 'discovery', 'insight'],
  emotion: ['feeling', 'mood', 'psychology', 'wellbeing', 'reflection'],
  observation: ['awareness', 'noticing', 'perception', 'environment', 'detail'],
  decision: ['choice', 'reasoning', 'strategy', 'planning', 'judgment'],
  relationship: ['social', 'bonding', 'community', 'trust', 'cooperation'],
  skill: ['ability', 'practice', 'mastery', 'development', 'growth'],
};

const LINKABLE_TYPES = ['experience', 'knowledge', 'emotion', 'observation'];

export function generateAutoMemories(
  brain: ObsidianBrain,
  tick: number,
  citizenName: string
): ObsidianBrain {
  let currentBrain = brain;

  // Generate 2-4 memories per tick batch
  const memoriesToGenerate = 2 + Math.floor(Math.random() * 3);

  for (let i = 0; i < memoriesToGenerate; i++) {
    // Pick random type
    const types = Object.keys(MEMORY_TEMPLATES) as (keyof typeof MEMORY_TEMPLATES)[];
    const type = types[Math.floor(Math.random() * types.length)];

    // Pick random template
    const templates = MEMORY_TEMPLATES[type];
    const template = templates[Math.floor(Math.random() * templates.length)];

    // Generate unique title
    const title = `${template.slice(0, 40)}..._${tick}_${i}`;

    // Pick random tags
    const availableTags = TAGS_BY_TYPE[type] || [];
    const numTags = 2 + Math.floor(Math.random() * 3);
    const tags = [];
    for (let j = 0; j < numTags; j++) {
      const tag = availableTags[Math.floor(Math.random() * availableTags.length)];
      if (!tags.includes(tag)) tags.push(tag);
    }

    // Generate links to random existing memories
    const existingMemories = Array.from(currentBrain.memories.values());
    const numLinks = Math.min(
      Math.floor(Math.random() * 3),
      existingMemories.length
    );
    const links: string[] = [];
    if (existingMemories.length > 0 && numLinks > 0) {
      const shuffled = [...existingMemories].sort(() => Math.random() - 0.5);
      for (let j = 0; j < numLinks && j < shuffled.length; j++) {
        links.push(shuffled[j].id);
      }
    }

    // Create memory
    const memory: Memory = {
      id: `auto_${tick}_${i}_${Math.random().toString(36).slice(2, 9)}`,
      citizenId: brain.citizenId,
      type: type as Memory['type'],
      content: template,
      importance: 0.3 + Math.random() * 0.5,
      emotion: type === 'emotion' ? 'positive' : 'neutral',
      timestamp: Date.now(),
      decay: 0,
      associations: links,
    };

    // Add to brain
    const newMemories = new Map(currentBrain.memories);
    newMemories.set(memory.id, memory);

    // Update index
    const byType = new Map(currentBrain.index.byType);
    const typeList = byType.get(type) || [];
    byType.set(type, [...typeList, memory.id]);

    const byTag = new Map(currentBrain.index.byTag);
    for (const tag of tags) {
      const tagList = byTag.get(tag) || [];
      byTag.set(tag, [...tagList, memory.id]);
    }

    const recentMemories = [memory.id, ...currentBrain.index.recentMemories].slice(0, 100);
    const byImportance = [memory.id, ...currentBrain.index.byImportance].slice(0, 200);

    // Update graph
    const newGraph = [...currentBrain.index.graph];
    for (const linkId of links) {
      newGraph.push({
        from: memory.id,
        to: linkId,
        strength: 0.3 + Math.random() * 0.4,
        type: 'semantic',
      });
    }

    currentBrain = {
      ...currentBrain,
      memories: newMemories,
      index: {
        ...currentBrain.index,
        byType,
        byTag,
        recentMemories,
        byImportance,
        graph: newGraph.slice(-500),
      },
    };
  }

  return currentBrain;
}

export function seedInitialMemories(
  brain: ObsidianBrain,
  numMemories: number = 200
): ObsidianBrain {
  let currentBrain = brain;

  for (let tick = 0; tick < numMemories; tick++) {
    currentBrain = generateAutoMemories(currentBrain, tick * 10, 'citizen');
  }

  return currentBrain;
}
