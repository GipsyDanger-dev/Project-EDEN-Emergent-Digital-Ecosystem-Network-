/**
 * Advanced Brain System for EDEN Citizens
 * Personality-driven decisions with memory influence
 */

export interface AdvancedBrainState {
  personality: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  mood: number;  // -100 to 100
  stress: number;  // 0 to 100
  curiosity: number;  // 0 to 100
  confidence: number;  // 0 to 100
  relationships: Map<string, Relationship>;
  skills: Map<string, Skill>;
  memories: MemoryEntry[];
  longTermGoals: string[];
  currentFocus: string | null;
}

export interface Relationship {
  citizenId: string;
  trust: number;  // -100 to 100
  affection: number;  // -100 to 100
  familiarity: number;  // 0 to 100
  lastInteraction: number;
  sharedMemories: string[];
}

export interface Skill {
  id: string;
  name: string;
  level: number;  // 0 to 100
  experience: number;
  lastUsed: number;
}

export interface MemoryEntry {
  id: string;
  type: 'experience' | 'observation' | 'interaction' | 'learning' | 'emotion' | 'decision';
  content: string;
  importance: number;
  emotionalWeight: number;
  timestamp: number;
  relatedCitizens: string[];
  tags: string[];
  consolidationLevel: number;  // 0-1, how well memory is consolidated
}

export interface BrainDecision {
  action: string;
  target?: string;
  thought: string;
  explanation: string;
  confidence: number;
  emotionalResponse: string;
  personalityInfluence: string;
}

export function createAdvancedBrain(): AdvancedBrainState {
  return {
    personality: {
      openness: 50 + (Math.random() - 0.5) * 40,
      conscientiousness: 50 + (Math.random() - 0.5) * 40,
      extraversion: 50 + (Math.random() - 0.5) * 40,
      agreeableness: 50 + (Math.random() - 0.5) * 40,
      neuroticism: 50 + (Math.random() - 0.5) * 40,
    },
    mood: 50,
    stress: 20,
    curiosity: 60,
    confidence: 50,
    relationships: new Map(),
    skills: new Map(),
    memories: [],
    longTermGoals: [],
    currentFocus: null,
  };
}

export function thinkAdvanced(
  brain: AdvancedBrainState,
  needs: { hunger: number; energy: number; social: number; safety: number },
  environment: {
    nearbyCitizens: { id: string; name: string; distance: number; action: string }[];
    nearbyResources: { type: string; amount: number }[];
    timeOfDay: string;
    season: string;
  },
  tick: number
): {
  decision: BrainDecision;
  updatedBrain: AdvancedBrainState;
} {
  const { personality } = brain;

  // Calculate internal state
  const overallNeed = (needs.hunger + needs.energy + needs.social + needs.safety) / 4;
  const stressFromNeeds = Math.max(0, 50 - overallNeed);

  // Personality-based mood influence
  const moodInfluence =
    (personality.neuroticism - 50) * -0.3 +
    (personality.extraversion - 50) * 0.2;

  const newMood = Math.max(-100, Math.min(100,
    brain.mood * 0.9 + moodInfluence * 0.1 + (overallNeed - 50) * 0.2
  ));

  const newStress = Math.max(0, Math.min(100,
    brain.stress * 0.8 + stressFromNeeds * 0.3 + (100 - needs.safety) * 0.1
  ));

  // Curiosity based on mood and personality
  const newCuriosity = Math.max(0, Math.min(100,
    brain.curiosity * 0.95 +
    (personality.openness - 50) * 0.3 +
    (newMood > 0 ? 5 : -5)
  ));

  // Decision making based on personality + needs + environment
  let decision: BrainDecision;

  if (needs.hunger < 30) {
    decision = makeHungerDecision(brain, needs);
  } else if (needs.energy < 25) {
    decision = makeEnergyDecision(brain, needs, environment);
  } else if (needs.social < 35) {
    decision = makeSocialDecision(brain, needs, environment);
  } else if (needs.safety < 40) {
    decision = makeSafetyDecision(brain, needs, environment);
  } else if (newCuriosity > 60 && environment.nearbyResources.length > 0) {
    decision = makeExplorationDecision(brain, environment);
  } else if (personality.extraversion > 60 && environment.nearbyCitizens.length > 0) {
    decision = makeSocialInteractionDecision(brain, environment);
  } else {
    decision = makeIdleDecision(brain, tick);
  }

  // Create memory of this decision
  const newMemory: MemoryEntry = {
    id: `mem_${tick}_${Math.random().toString(36).slice(2, 7)}`,
    type: 'decision',
    content: `Decided to ${decision.action}: ${decision.thought}`,
    importance: decision.confidence,
    emotionalWeight: decision.emotionalResponse.includes('positive') ? 0.5 : -0.3,
    timestamp: tick,
    relatedCitizens: decision.target ? [decision.target] : [],
    tags: [decision.action, 'decision'],
    consolidationLevel: 0,
  };

  // Update skills based on action
  const updatedSkills = updateSkills(brain.skills, decision.action, tick);

  // Update relationships
  const updatedRelationships = updateRelationships(
    brain.relationships,
    decision,
    environment.nearbyCitizens,
    tick
  );

  const updatedBrain: AdvancedBrainState = {
    ...brain,
    mood: newMood,
    stress: newStress,
    curiosity: newCuriosity,
    confidence: Math.max(0, Math.min(100,
      brain.confidence * 0.95 + decision.confidence * 5
    )),
    memories: [...brain.memories, newMemory].slice(-200),
    skills: updatedSkills,
    relationships: updatedRelationships,
  };

  return { decision, updatedBrain };
}

function makeHungerDecision(
  brain: AdvancedBrainState,
  needs: { hunger: number; energy: number; social: number; safety: number }
): BrainDecision {
  const { personality } = brain;

  const urgency = needs.hunger < 20 ? 'critical' : 'moderate';
  const confidence = urgency === 'critical' ? 0.9 : 0.7;

  // Personality affects how they seek food
  let thought = '';
  let action = 'find_food';

  if (personality.conscientiousness > 60) {
    thought = `My hunger is at ${Math.round(needs.hunger)}%. I should systematically search for food sources.`;
    action = 'search_food_systematic';
  } else if (personality.openness > 60) {
    thought = `Hungry! Maybe I can find something new to eat. Hunger at ${Math.round(needs.hunger)}%.`;
    action = 'explore_food';
  } else {
    thought = `Need food. Hunger at ${Math.round(needs.hunger)}%. ${urgency === 'critical' ? 'CRITICAL!' : 'Getting there.'}`;
  }

  const personalityInfluence = personality.conscientiousness > 60
    ? 'Conscientious nature drives systematic approach'
    : 'Practical response to immediate need';

  return {
    action,
    thought,
    explanation: `Hunger detected at ${Math.round(needs.hunger)}%. ${urgency === 'critical' ? 'Critical level requires immediate action.' : 'Should address soon.'}`,
    confidence,
    emotionalResponse: urgency === 'critical' ? 'anxious' : 'focused',
    personalityInfluence,
  };
}

function makeEnergyDecision(
  brain: AdvancedBrainState,
  needs: { hunger: number; energy: number; social: number; safety: number },
  environment: { nearbyCitizens: any[]; nearbyResources: any[]; timeOfDay: string; season: string }
): BrainDecision {
  const { personality } = brain;

  const isNight = environment.timeOfDay === 'night';
  const confidence = needs.energy < 20 ? 0.85 : 0.65;

  let thought = '';

  if (personality.conscientiousness > 50) {
    thought = `Energy at ${Math.round(needs.energy)}%. ${isNight ? 'Good time to rest.' : 'Should find a safe spot to recharge.'}`;
  } else {
    thought = `So tired... Energy at ${Math.round(needs.energy)}%. Need rest.`;
  }

  return {
    action: 'find_rest',
    thought,
    explanation: `Energy depleted to ${Math.round(needs.energy)}%. Rest required.`,
    confidence,
    emotionalResponse: needs.energy < 20 ? 'exhausted' : 'tired',
    personalityInfluence: personality.neuroticism > 60
      ? 'Anxiety about exhaustion increases urgency'
      : 'Physical need drives decision',
  };
}

function makeSocialDecision(
  brain: AdvancedBrainState,
  needs: { hunger: number; energy: number; social: number; safety: number },
  environment: { nearbyCitizens: any[]; nearbyResources: any[]; timeOfDay: string; season: string }
): BrainDecision {
  const { personality } = brain;

  const hasNearbyCitizens = environment.nearbyCitizens.length > 0;
  const confidence = hasNearbyCitizens ? 0.75 : 0.5;

  let thought = '';
  let action = 'find_companion';

  if (hasNearbyCitizens) {
    const target = environment.nearbyCitizens[0];

    // Check if we know this person
    const relationship = brain.relationships.get(target.id);
    const familiarity = relationship?.familiarity || 0;

    if (personality.extraversion > 60) {
      thought = `I see ${target.name}! ${familiarity > 50 ? 'An old friend!' : 'Someone new to meet!'} Social need at ${Math.round(needs.social)}%.`;
      action = 'approach_citizen';
    } else if (personality.agreeableness > 60) {
      thought = `${target.name} is nearby. ${familiarity > 50 ? 'We have history together.' : 'Maybe I should be friendly.'} Social need at ${Math.round(needs.social)}%.`;
      action = 'socialize';
    } else {
      thought = `${target.name} is around. Social need at ${Math.round(needs.social)}%. ${personality.extraversion < 40 ? 'Not really in the mood...' : 'Could be nice.'}`;
      action = Math.random() > 0.5 ? 'approach_citizen' : 'observe_citizen';
    }
  } else {
    thought = `Feeling lonely. Social need at ${Math.round(needs.social)}%. No one around...`;
    action = 'wander';
  }

  return {
    action,
    target: hasNearbyCitizens ? environment.nearbyCitizens[0].id : undefined,
    thought,
    explanation: `Social need at ${Math.round(needs.social)}%. ${hasNearbyCitizens ? 'Opportunity for interaction.' : 'Seeking company.'}`,
    confidence,
    emotionalResponse: needs.social < 20 ? 'lonely' : 'social',
    personalityInfluence: personality.extraversion > 60
      ? 'Extraversion drives social seeking'
      : personality.agreeableness > 60
        ? 'Agreeableness makes socializing appealing'
        : 'Mixed feelings about social interaction',
  };
}

function makeSafetyDecision(
  brain: AdvancedBrainState,
  needs: { hunger: number; energy: number; social: number; safety: number },
  environment: { nearbyCitizens: any[]; nearbyResources: any[]; timeOfDay: string; season: string }
): BrainDecision {
  const { personality } = brain;

  const confidence = needs.safety < 25 ? 0.9 : 0.7;
  const isNight = environment.timeOfDay === 'night';

  let thought = '';

  if (personality.neuroticism > 60) {
    thought = `Something feels wrong. Safety at ${Math.round(needs.safety)}%. ${isNight ? 'Night is dangerous.' : 'Need to find shelter.'}`;
  } else {
    thought = `Safety concerns at ${Math.round(needs.safety)}%. Should find a safer spot.`;
  }

  return {
    action: 'find_shelter',
    thought,
    explanation: `Safety at ${Math.round(needs.safety)}%. Seeking secure location.`,
    confidence,
    emotionalResponse: needs.safety < 25 ? 'fearful' : 'cautious',
    personalityInfluence: personality.neuroticism > 60
      ? 'High neuroticism amplifies safety concerns'
      : 'Practical assessment of risk',
  };
}

function makeExplorationDecision(
  brain: AdvancedBrainState,
  environment: { nearbyCitizens: any[]; nearbyResources: any[]; timeOfDay: string; season: string }
): BrainDecision {
  const { personality } = brain;

  const resource = environment.nearbyResources[0];
  const confidence = 0.6;

  let thought = '';

  if (personality.openness > 70) {
    thought = `Interesting! I see some ${resource.type} nearby. My curiosity is piqued! Let me investigate.`;
  } else {
    thought = `Noticed some ${resource.type} over there. Might be useful.`;
  }

  return {
    action: 'explore',
    thought,
    explanation: `Curiosity at ${Math.round(brain.curiosity)}%. Resource detected.`,
    confidence,
    emotionalResponse: 'curious',
    personalityInfluence: personality.openness > 60
      ? 'High openness drives exploration'
      : 'Practical assessment of opportunity',
  };
}

function makeSocialInteractionDecision(
  brain: AdvancedBrainState,
  environment: { nearbyCitizens: any[]; nearbyResources: any[]; timeOfDay: string; season: string }
): BrainDecision {
  const { personality } = brain;

  const target = environment.nearbyCitizens[0];
  const confidence = 0.65;

  let thought = '';

  if (personality.extraversion > 70) {
    thought = `${target.name} looks interesting! I want to learn about them.`;
  } else if (personality.agreeableness > 70) {
    thought = `${target.name} might need some company. I'll say hello.`;
  } else {
    thought = `${target.name} is nearby. Maybe a quick chat.`;
  }

  return {
    action: 'socialize',
    target: target.id,
    thought,
    explanation: `Social opportunity with ${target.name}.`,
    confidence,
    emotionalResponse: 'social',
    personalityInfluence: personality.extraversion > 60
      ? 'Extrovert energy seeks connection'
      : 'Agreeable nature prompts kindness',
  };
}

function makeIdleDecision(
  brain: AdvancedBrainState,
  tick: number
): BrainDecision {
  const { personality } = brain;

  const idleThoughts = [
    'Taking a moment to observe my surroundings.',
    'Everything seems peaceful right now.',
    'I wonder what the future holds.',
    'Just enjoying the moment.',
    'Thinking about life...',
    'The world is full of possibilities.',
  ];

  const thought = idleThoughts[tick % idleThoughts.length];

  return {
    action: 'idle',
    thought,
    explanation: 'All needs satisfied. Enjoying peaceful moment.',
    confidence: 0.5,
    emotionalResponse: 'content',
    personalityInfluence: personality.openness > 60
      ? 'Open mind observes wonders'
      : 'Peaceful existence',
  };
}

function updateSkills(
  skills: Map<string, Skill>,
  action: string,
  tick: number
): Map<string, Skill> {
  const newSkills = new Map(skills);

  const skillMap: Record<string, string> = {
    'find_food': 'foraging',
    'search_food': 'foraging',
    'explore': 'exploration',
    'socialize': 'communication',
    'approach_citizen': 'communication',
    'find_rest': 'survival',
    'find_shelter': 'survival',
  };

  const skillName = skillMap[action];
  if (skillName) {
    const existing = newSkills.get(skillName);
    if (existing) {
      newSkills.set(skillName, {
        ...existing,
        experience: existing.experience + 1,
        level: Math.min(100, existing.level + 0.5),
        lastUsed: tick,
      });
    } else {
      newSkills.set(skillName, {
        id: skillName,
        name: skillName,
        level: 5,
        experience: 1,
        lastUsed: tick,
      });
    }
  }

  return newSkills;
}

function updateRelationships(
  relationships: Map<string, Relationship>,
  decision: BrainDecision,
  nearbyCitizens: { id: string; name: string; distance: number }[],
  tick: number
): Map<string, Relationship> {
  const newRelationships = new Map(relationships);

  if (decision.action === 'socialize' && decision.target) {
    const existing = newRelationships.get(decision.target);
    if (existing) {
      newRelationships.set(decision.target, {
        ...existing,
        trust: Math.min(100, existing.trust + 2),
        affection: Math.min(100, existing.affection + 1),
        familiarity: Math.min(100, existing.familiarity + 5),
        lastInteraction: tick,
      });
    } else {
      newRelationships.set(decision.target, {
        citizenId: decision.target,
        trust: 10,
        affection: 5,
        familiarity: 10,
        lastInteraction: tick,
        sharedMemories: [],
      });
    }
  }

  return newRelationships;
}

export function getPersonalityDescription(personality: AdvancedBrainState['personality']): string {
  const traits: string[] = [];

  if (personality.openness > 60) traits.push('curious');
  else if (personality.openness < 40) traits.push('practical');

  if (personality.conscientiousness > 60) traits.push('organized');
  else if (personality.conscientiousness < 40) traits.push('spontaneous');

  if (personality.extraversion > 60) traits.push('outgoing');
  else if (personality.extraversion < 40) traits.push('reserved');

  if (personality.agreeableness > 60) traits.push('friendly');
  else if (personality.agreeableness < 40) traits.push('independent');

  if (personality.neuroticism > 60) traits.push('sensitive');
  else if (personality.neuroticism < 40) traits.push('calm');

  return traits.join(', ');
}
