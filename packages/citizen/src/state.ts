import { Needs, Emotions, Skill, Item } from '@eden/core';

export interface CitizenState {
  needs: Needs;
  emotions: Emotions;
  skills: Skill[];
  inventory: Item[];
  energy: number;  // Current energy level 0-100
}

export function createInitialState(): CitizenState {
  return {
    needs: {
      hunger: 70,
      energy: 80,
      social: 50,
      safety: 60,
    },
    emotions: {
      happiness: 0,
      sadness: 0,
      anger: 0,
      fear: 0,
    },
    skills: [],
    inventory: [],
    energy: 100,
  };
}

export function updateNeeds(state: CitizenState, decayRates: Record<string, number>): CitizenState {
  return {
    ...state,
    needs: {
      hunger: Math.max(0, state.needs.hunger + (decayRates.hunger || 0)),
      energy: Math.max(0, state.needs.energy + (decayRates.energy || 0)),
      social: Math.max(0, state.needs.social + (decayRates.social || 0)),
      safety: Math.max(0, state.needs.safety + (decayRates.safety || 0)),
    },
  };
}

export function satisfyNeed(
  state: CitizenState,
  need: keyof Needs,
  amount: number
): CitizenState {
  return {
    ...state,
    needs: {
      ...state.needs,
      [need]: Math.min(100, Math.max(0, state.needs[need] + amount)),
    },
  };
}

export function updateEmotions(
  state: CitizenState,
  emotions: Partial<Emotions>
): CitizenState {
  return {
    ...state,
    emotions: {
      happiness: Math.max(-100, Math.min(100, emotions.happiness ?? state.emotions.happiness)),
      sadness: Math.max(-100, Math.min(100, emotions.sadness ?? state.emotions.sadness)),
      anger: Math.max(-100, Math.min(100, emotions.anger ?? state.emotions.anger)),
      fear: Math.max(-100, Math.min(100, emotions.fear ?? state.emotions.fear)),
    },
  };
}

export function addSkill(state: CitizenState, skill: Skill): CitizenState {
  const existing = state.skills.find(s => s.id === skill.id);
  if (existing) {
    return {
      ...state,
      skills: state.skills.map(s =>
        s.id === skill.id
          ? { ...s, experience: s.experience + 1, level: Math.floor((s.experience + 1) / 10) }
          : s
      ),
    };
  }
  return {
    ...state,
    skills: [...state.skills, skill],
  };
}

export function addItem(state: CitizenState, item: Item): CitizenState {
  const existing = state.inventory.find(i => i.id === item.id);
  if (existing) {
    return {
      ...state,
      inventory: state.inventory.map(i =>
        i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
      ),
    };
  }
  return {
    ...state,
    inventory: [...state.inventory, item],
  };
}

export function removeItem(state: CitizenState, itemId: string, quantity: number): CitizenState {
  const item = state.inventory.find(i => i.id === itemId);
  if (!item || item.quantity < quantity) {
    return state;
  }
  if (item.quantity === quantity) {
    return {
      ...state,
      inventory: state.inventory.filter(i => i.id !== itemId),
    };
  }
  return {
    ...state,
    inventory: state.inventory.map(i =>
      i.id === itemId ? { ...i, quantity: i.quantity - quantity } : i
    ),
  };
}
