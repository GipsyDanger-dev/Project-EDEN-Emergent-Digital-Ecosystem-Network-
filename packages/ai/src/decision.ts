import { Citizen, Decision, Event } from '@eden/core';
import { Perception } from './perception';
import { AttentionFocus } from './attention';
import { Plan, getCurrentStep } from './planning';
import { MemorySystem, addMemory } from './memory';

export interface DecisionContext {
  citizen: Citizen;
  perception: Perception;
  attention: AttentionFocus;
  plan: Plan;
  memory: MemorySystem;
  tick: number;
}

export function makeDecision(context: DecisionContext): {
  decision: Decision;
  events: Event[];
} {
  const { citizen, perception, attention, plan, memory, tick } = context;
  const currentStep = getCurrentStep(plan);

  if (!currentStep) {
    return createIdleDecision(citizen, tick);
  }

  const decision = evaluateOptions(citizen, currentStep.action, perception, attention);

  const events: Event[] = [
    {
      id: crypto.randomUUID(),
      type: 'DecisionMade',
      timestamp: Date.now(),
      citizenId: citizen.identity.id,
      data: {
        action: decision.action,
        target: decision.target,
        explanation: decision.explanation,
      },
      metadata: {
        tick,
        cause: 'ai_brain',
      },
    },
  ];

  return { decision, events };
}

function evaluateOptions(
  citizen: Citizen,
  intendedAction: string,
  perception: Perception,
  attention: AttentionFocus
): Decision {
  const options = generateOptions(citizen, intendedAction, perception);

  if (options.length === 0) {
    return {
      action: 'wait',
      explanation: 'No viable options available',
      confidence: 0.3,
    };
  }

  // Score each option
  const scoredOptions = options.map(option => ({
    ...option,
    score: scoreOption(option, citizen, attention),
  }));

  // Sort by score
  scoredOptions.sort((a, b) => b.score - a.score);

  const best = scoredOptions[0];

  return {
    action: best.action,
    target: best.target,
    explanation: best.explanation,
    confidence: best.score,
  };
}

interface Option {
  action: string;
  target?: string;
  explanation: string;
}

function generateOptions(
  citizen: Citizen,
  intendedAction: string,
  perception: Perception
): Option[] {
  const options: Option[] = [];

  switch (intendedAction) {
    case 'find_food':
      const foodSources = perception.visibleEntities.filter(
        e => e.type === 'resource' && e.details.type === 'food'
      );
      foodSources.forEach(food => {
        options.push({
          action: 'move_to_food',
          target: food.id,
          explanation: `Move to food source at distance ${food.distance.toFixed(1)}`,
        });
      });
      if (foodSources.length === 0) {
        options.push({
          action: 'wander',
          explanation: 'No food visible, searching area',
        });
      }
      break;

    case 'eat':
      options.push({
        action: 'eat',
        explanation: 'Consume food to satisfy hunger',
      });
      break;

    case 'find_citizen':
      const citizens = perception.visibleEntities.filter(e => e.type === 'citizen');
      citizens.forEach(c => {
        options.push({
          action: 'approach',
          target: c.id,
          explanation: `Approach citizen at distance ${c.distance.toFixed(1)}`,
        });
      });
      break;

    case 'socialize':
      options.push({
        action: 'socialize',
        explanation: 'Engage in conversation',
      });
      break;

    default:
      options.push({
        action: intendedAction,
        explanation: `Execute: ${intendedAction}`,
      });
  }

  return options;
}

function scoreOption(
  option: Option,
  citizen: Citizen,
  attention: AttentionFocus
): number {
  let score = 0.5;

  // Increase score if action addresses urgent need
  if (attention.urgency === 'high') {
    score += 0.2;
  }

  // Increase score if target is focus of attention
  if (attention.primaryFocus?.entityId === option.target) {
    score += 0.3;
  }

  // Personality modifiers
  const personality = citizen.identity.personality;
  if (option.action === 'socialize') {
    score += (personality.extraversion / 100) * 0.2;
  }

  return Math.min(1, Math.max(0, score));
}

function createIdleDecision(citizen: Citizen, tick: number): {
  decision: Decision;
  events: Event[];
} {
  return {
    decision: {
      action: 'idle',
      explanation: 'No urgent needs, observing environment',
      confidence: 0.5,
    },
    events: [
      {
        id: crypto.randomUUID(),
        type: 'CitizenIdle',
        timestamp: Date.now(),
        citizenId: citizen.identity.id,
        data: {},
        metadata: {
          tick,
          cause: 'no_urgent_needs',
        },
      },
    ],
  };
}

export function executeDecision(
  citizen: Citizen,
  decision: Decision
): Citizen {
  // This will be expanded with actual action execution
  return citizen;
}
