import { Location, Event } from '@eden/core';
import { Identity, createIdentity } from './identity';
import { CitizenState, createInitialState, updateNeeds, satisfyNeed } from './state';

export interface Citizen {
  identity: Identity;
  location: Location;
  state: CitizenState;
  tickCount: number;
  isAlive: boolean;
}

export function createCitizen(
  name: string,
  age: number,
  gender: 'male' | 'female' | 'other',
  location: Location,
  birthDate: number
): Citizen {
  return {
    identity: createIdentity(name, age, gender, birthDate),
    location,
    state: createInitialState(),
    tickCount: 0,
    isAlive: true,
  };
}

export function updateCitizen(citizen: Citizen, tick: number): Citizen {
  if (!citizen.isAlive) {
    return citizen;
  }

  const decayRates = {
    hunger: -0.5,
    energy: -0.3,
    social: -0.2,
    safety: -0.1,
  };

  const newState = updateNeeds(citizen.state, decayRates);

  // Check for death conditions
  const isDead =
    newState.needs.hunger <= 0 ||
    newState.needs.energy <= 0;

  return {
    ...citizen,
    state: newState,
    tickCount: tick,
    isAlive: !isDead,
  };
}

export function moveCitizen(citizen: Citizen, newLocation: Location): Citizen {
  return {
    ...citizen,
    location: newLocation,
  };
}

export function eat(citizen: Citizen, hungerSatisfaction: number): Citizen {
  return {
    ...citizen,
    state: satisfyNeed(citizen.state, 'hunger', hungerSatisfaction),
  };
}

export function sleep(citizen: Citizen, energyRestoration: number): Citizen {
  return {
    ...citizen,
    state: satisfyNeed(citizen.state, 'energy', energyRestoration),
  };
}

export function socialize(citizen: Citizen, socialSatisfaction: number): Citizen {
  return {
    ...citizen,
    state: satisfyNeed(citizen.state, 'social', socialSatisfaction),
  };
}

export function getCitizenStatus(citizen: Citizen): string {
  if (!citizen.isAlive) return 'dead';
  if (citizen.state.needs.hunger < 20) return 'starving';
  if (citizen.state.needs.energy < 20) return 'exhausted';
  if (citizen.state.needs.social < 20) return 'lonely';
  if (citizen.state.needs.safety < 20) return 'fearful';
  return 'normal';
}

export function generateCitizenEvent(
  citizen: Citizen,
  eventType: string,
  data: Record<string, unknown>,
  tick: number
): Event {
  return {
    id: crypto.randomUUID(),
    type: eventType,
    timestamp: Date.now(),
    citizenId: citizen.identity.id,
    data,
    metadata: {
      tick,
      cause: 'citizen_action',
    },
  };
}
