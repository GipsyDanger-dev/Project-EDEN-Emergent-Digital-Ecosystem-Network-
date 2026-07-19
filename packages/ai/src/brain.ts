import type { Citizen } from '@eden/citizen';
import { MemorySystem, recallRecentMemory } from './memory';
import { LLMConfig, LLMMessage, callLLM } from './llm';

export interface BrainConfig {
  llm: LLMConfig;
  maxMemoriesToRecall: number;
}

export interface BrainInput {
  citizen: Citizen;
  perception: PerceptionInput;
  memories: MemorySystem;
  currentGoal: string | null;
}

export interface PerceptionInput {
  nearbyCitizens: { id: string; name: string; distance: number }[];
  nearbyResources: { id: string; type: string; amount: number }[];
  timeOfDay: string;
  season: string;
}

export interface BrainOutput {
  thought: string;
  decision: {
    action: string;
    target?: string;
    reason: string;
  };
  explanation: string;
  memories: string[];
}

export function createBrainConfig(apiKey: string, model: string = 'gpt-4'): BrainConfig {
  return {
    llm: {
      apiKey,
      model,
      temperature: 0.7,
      maxTokens: 500,
    },
    maxMemoriesToRecall: 5,
  };
}

export async function think(
  config: BrainConfig,
  input: BrainInput
): Promise<BrainOutput> {
  const { citizen, perception, memories, currentGoal } = input;

  // Recall recent memories
  const recentMemories = recallRecentMemory(memories, config.maxMemoriesToRecall);
  const memoryContext = recentMemories.map(m => `- ${m.content}`).join('\n');

  // Build perception context
  const perceptionContext = buildPerceptionContext(perception);

  // Build citizen state context
  const stateContext = buildStateContext(citizen);

  // Create system prompt (persona)
  const systemPrompt = createPersonaPrompt(citizen);

  // Create user prompt (situation)
  const userPrompt = createUserPrompt(
    citizen,
    stateContext,
    perceptionContext,
    memoryContext,
    currentGoal
  );

  // Call LLM
  const messages: LLMMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  const response = await callLLM(config.llm, messages);

  // Parse response
  const output = parseBrainResponse(response.content);

  return output;
}

function createPersonaPrompt(citizen: Citizen): string {
  const personality = citizen.identity.personality;

  return `You are ${citizen.identity.name}, a living being in a digital world.

PERSONALITY:
- Openness: ${Math.round(personality.openness)}/100 (${personality.openness > 50 ? 'curious, creative' : 'practical, conventional'})
- Conscientiousness: ${Math.round(personality.conscientiousness)}/100 (${personality.conscientiousness > 50 ? 'organized, responsible' : 'flexible, easygoing'})
- Extraversion: ${Math.round(personality.extraversion)}/100 (${personality.extraversion > 50 ? 'outgoing, social' : 'reserved, solitary'})
- Agreeableness: ${Math.round(personality.agreeableness)}/100 (${personality.agreeableness > 50 ? 'cooperative, trusting' : 'competitive, skeptical'})
- Neuroticism: ${Math.round(personality.neuroticism)}/100 (${personality.neuroticism > 50 ? 'sensitive, anxious' : 'confident, calm'})

RULES:
1. You must think before acting
2. You must explain your reasoning
3. Your decisions should align with your needs and personality
4. You can only do actions that are physically possible
5. Remember your past experiences and learn from them

RESPONSE FORMAT (JSON):
{
  "thought": "What you're thinking about right now",
  "decision": {
    "action": "what you want to do",
    "target": "optional target",
    "reason": "why you chose this action"
  },
  "explanation": "How you would explain this to someone else"
}`;
}

function buildStateContext(citizen: Citizen): string {
  const needs = citizen.state.needs;
  return `CURRENT STATE:
- Hunger: ${Math.round(needs.hunger)}/100 ${needs.hunger < 30 ? '(VERY HUNGRY)' : needs.hunger < 60 ? '(getting hungry)' : '(satisfied)'}
- Energy: ${Math.round(needs.energy)}/100 ${needs.energy < 30 ? '(VERY TIRED)' : needs.energy < 60 ? '(getting tired)' : '(rested)'}
- Social: ${Math.round(needs.social)}/100 ${needs.social < 30 ? '(VERY LONELY)' : needs.social < 60 ? '(wanting company)' : '(socially satisfied)'}
- Safety: ${Math.round(needs.safety)}/100 ${needs.safety < 30 ? '(FEELING UNSAFE)' : '(feeling safe)'}`;
}

function buildPerceptionContext(perception: PerceptionInput): string {
  const citizens = perception.nearbyCitizens.length > 0
    ? perception.nearbyCitizens.map(c => `  - ${c.name} (${c.distance.toFixed(1)}m away)`).join('\n')
    : '  - No one nearby';

  const resources = perception.nearbyResources.length > 0
    ? perception.nearbyResources.map(r => `  - ${r.type} (${r.amount} available)`).join('\n')
    : '  - No resources nearby';

  return `ENVIRONMENT:
- Time: ${perception.timeOfDay}
- Season: ${perception.season}

NEARBY CITIZENS:
${citizens}

NEARBY RESOURCES:
${resources}`;
}

function createUserPrompt(
  citizen: Citizen,
  stateContext: string,
  perceptionContext: string,
  memoryContext: string,
  currentGoal: string | null
): string {
  const goalSection = currentGoal
    ? `\nCURRENT GOAL: ${currentGoal}`
    : '\nNo specific goal right now.';

  const memorySection = memoryContext
    ? `\nRECENT MEMORIES:\n${memoryContext}`
    : '\nNo recent memories.';

  return `Based on your current state and environment, what should you do next?

${stateContext}
${perceptionContext}
${goalSection}
${memorySection}

Think about your needs, what's around you, and what you've experienced before.
Respond in the specified JSON format.`;
}

function parseBrainResponse(response: string): BrainOutput {
  try {
    // Try to parse JSON response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        thought: parsed.thought || 'Thinking...',
        decision: {
          action: parsed.decision?.action || 'wait',
          target: parsed.decision?.target,
          reason: parsed.decision?.reason || 'No reason provided',
        },
        explanation: parsed.explanation || response,
        memories: [],
      };
    }
  } catch {
    // If JSON parsing fails, use the response as-is
  }

  // Fallback: use response as explanation, default action
  return {
    thought: response.slice(0, 200),
    decision: {
      action: 'wait',
      reason: 'Unable to parse decision from response',
    },
    explanation: response,
    memories: [],
  };
}
