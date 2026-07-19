import { BrainInput, BrainOutput } from './brain';
import { recallRecentMemory } from './memory';

/**
 * Local brain - decision making without LLM
 * Used when no API key is available
 */
export function thinkLocal(input: BrainInput): BrainOutput {
  const { citizen, perception, memories } = input;

  // Analyze state
  const needs = citizen.state.needs;
  const mostUrgent = Object.entries(needs)
    .sort(([, a], [, b]) => a - b)[0];

  const [needName, needValue] = mostUrgent;

  // Recall relevant memories
  const recentMemories = recallRecentMemory(memories, 3);
  // Generate thought based on state
  let thought = '';
  let action = 'idle';
  let target: string | undefined;
  let reason = '';

  if (needValue < 30) {
    // Critical need
    thought = `My ${needName} is critically low (${Math.round(needValue)}). I must address this immediately.`;
    action = `seek_${needName}`;
    reason = `${needName} is critical at ${Math.round(needValue)}%`;
  } else if (needValue < 60) {
    // Moderate need
    thought = `I'm starting to feel ${needName === 'hunger' ? 'hungry' : needName === 'energy' ? 'tired' : needName === 'social' ? 'lonely' : 'unsafe'}.`;
    action = `seek_${needName}`;
    reason = `${needName} is getting low at ${Math.round(needValue)}%`;
  } else if (perception.nearbyCitizens.length > 0 && needs.social < 70) {
    // Social opportunity
    const nearby = perception.nearbyCitizens[0];
    thought = `I see ${nearby.name} nearby. Maybe I should say hello.`;
    action = 'socialize';
    target = nearby.id;
    reason = 'Want to socialize with nearby citizen';
  } else if (perception.nearbyResources.length > 0) {
    // Resource opportunity
    const resource = perception.nearbyResources[0];
    thought = `I notice some ${resource.type} nearby. Could be useful.`;
    action = 'observe';
    target = resource.id;
    reason = 'Noticing available resources';
  } else {
    // Idle - explore
    thought = 'Everything seems fine. I wonder what I should do next.';
    action = 'look_around';
    reason = 'Exploring the environment';
  }

  // Build explanation
  const explanation = `As ${citizen.identity.name}, I decided to ${action} because ${reason}. ` +
    `My needs are: hunger=${Math.round(needs.hunger)}, energy=${Math.round(needs.energy)}, ` +
    `social=${Math.round(needs.social)}, safety=${Math.round(needs.safety)}.`;

  return {
    thought,
    decision: { action, target, reason },
    explanation,
    memories: recentMemories.map(m => m.content),
  };
}
