import { generateId } from '@eden/core';

export interface Identity {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  birthDate: number;
  personality: Personality;
}

export interface Personality {
  openness: number;      // 0-100
  conscientiousness: number;  // 0-100
  extraversion: number;  // 0-100
  agreeableness: number; // 0-100
  neuroticism: number;   // 0-100
}

export function createIdentity(
  name: string,
  age: number,
  gender: 'male' | 'female' | 'other',
  birthDate: number
): Identity {
  return {
    id: generateId(),
    name,
    age,
    gender,
    birthDate,
    personality: generatePersonality(),
  };
}

function generatePersonality(): Personality {
  return {
    openness: Math.random() * 100,
    conscientiousness: Math.random() * 100,
    extraversion: Math.random() * 100,
    agreeableness: Math.random() * 100,
    neuroticism: Math.random() * 100,
  };
}

export function getPersonalityTrait(identity: Identity, trait: keyof Personality): number {
  return identity.personality[trait];
}

export function modifyPersonality(
  identity: Identity,
  trait: keyof Personality,
  delta: number
): Identity {
  const newValue = Math.max(0, Math.min(100, identity.personality[trait] + delta));
  return {
    ...identity,
    personality: {
      ...identity.personality,
      [trait]: newValue,
    },
  };
}
