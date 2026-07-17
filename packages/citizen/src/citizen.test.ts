import { describe, it, expect } from 'vitest';
import {
  createCitizen,
  updateCitizen,
  moveCitizen,
  eat,
  sleep,
  socialize,
  getCitizenStatus,
} from './citizen';
import { createIdentity } from './identity';
import { createInitialState, updateNeeds, satisfyNeed } from './state';

describe('Citizen', () => {
  const mockLocation = { x: 5, y: 10, z: 0 };

  it('should create a citizen with correct properties', () => {
    const citizen = createCitizen('Alice', 25, 'female', mockLocation, Date.now());

    expect(citizen.identity.name).toBe('Alice');
    expect(citizen.identity.age).toBe(25);
    expect(citizen.identity.gender).toBe('female');
    expect(citizen.location).toEqual(mockLocation);
    expect(citizen.isAlive).toBe(true);
    expect(citizen.state.needs.hunger).toBeGreaterThan(0);
    expect(citizen.state.needs.energy).toBeGreaterThan(0);
  });

  it('should update citizen needs on tick', () => {
    const citizen = createCitizen('Bob', 30, 'male', mockLocation, Date.now());
    const initialHunger = citizen.state.needs.hunger;

    const updated = updateCitizen(citizen, 1);

    expect(updated.state.needs.hunger).toBeLessThan(initialHunger);
    expect(updated.tickCount).toBe(1);
  });

  it('should move citizen to new location', () => {
    const citizen = createCitizen('Charlie', 20, 'other', mockLocation, Date.now());
    const newLocation = { x: 15, y: 20, z: 0 };

    const moved = moveCitizen(citizen, newLocation);

    expect(moved.location).toEqual(newLocation);
  });

  it('should satisfy hunger when eating', () => {
    const citizen = createCitizen('Dave', 28, 'male', mockLocation, Date.now());
    const initialHunger = citizen.state.needs.hunger;

    const fed = eat(citizen, 30);

    expect(fed.state.needs.hunger).toBe(initialHunger + 30);
  });

  it('should restore energy when sleeping', () => {
    const citizen = createCitizen('Eve', 22, 'female', mockLocation, Date.now());
    const initialEnergy = citizen.state.needs.energy;

    const rested = sleep(citizen, 40);

    // Energy is capped at 100
    expect(rested.state.needs.energy).toBe(Math.min(100, initialEnergy + 40));
  });

  it('should increase social need when socializing', () => {
    const citizen = createCitizen('Frank', 35, 'male', mockLocation, Date.now());
    const initialSocial = citizen.state.needs.social;

    const socialized = socialize(citizen, 25);

    expect(socialized.state.needs.social).toBe(initialSocial + 25);
  });

  it('should return correct status based on needs', () => {
    const citizen = createCitizen('Grace', 27, 'female', mockLocation, Date.now());

    expect(getCitizenStatus(citizen)).toBe('normal');

    const starving = {
      ...citizen,
      state: { ...citizen.state, needs: { ...citizen.state.needs, hunger: 15 } },
    };
    expect(getCitizenStatus(starving)).toBe('starving');

    const exhausted = {
      ...citizen,
      state: { ...citizen.state, needs: { ...citizen.state.needs, energy: 10 } },
    };
    expect(getCitizenStatus(exhausted)).toBe('exhausted');
  });
});

describe('Identity', () => {
  it('should create identity with unique id', () => {
    const id1 = createIdentity('Alice', 25, 'female', Date.now());
    const id2 = createIdentity('Bob', 30, 'male', Date.now());

    expect(id1.id).not.toBe(id2.id);
    expect(id1.name).toBe('Alice');
    expect(id2.name).toBe('Bob');
  });

  it('should generate random personality traits', () => {
    const identity = createIdentity('Test', 20, 'other', Date.now());

    expect(identity.personality.openness).toBeGreaterThanOrEqual(0);
    expect(identity.personality.openness).toBeLessThanOrEqual(100);
    expect(identity.personality.extraversion).toBeGreaterThanOrEqual(0);
    expect(identity.personality.extraversion).toBeLessThanOrEqual(100);
  });
});

describe('State', () => {
  it('should create initial state with default values', () => {
    const state = createInitialState();

    expect(state.needs.hunger).toBe(70);
    expect(state.needs.energy).toBe(80);
    expect(state.needs.social).toBe(50);
    expect(state.needs.safety).toBe(60);
    expect(state.skills).toHaveLength(0);
    expect(state.inventory).toHaveLength(0);
  });

  it('should update needs with decay rates', () => {
    const state = createInitialState();
    const decayRates = { hunger: -5, energy: -3, social: -2, safety: -1 };

    const updated = updateNeeds(state, decayRates);

    expect(updated.needs.hunger).toBe(65);
    expect(updated.needs.energy).toBe(77);
    expect(updated.needs.social).toBe(48);
    expect(updated.needs.safety).toBe(59);
  });

  it('should not let needs go below 0', () => {
    const state = createInitialState();
    const decayRates = { hunger: -200, energy: -200, social: -200, safety: -200 };

    const updated = updateNeeds(state, decayRates);

    expect(updated.needs.hunger).toBe(0);
    expect(updated.needs.energy).toBe(0);
    expect(updated.needs.social).toBe(0);
    expect(updated.needs.safety).toBe(0);
  });

  it('should not let needs go above 100', () => {
    const state = createInitialState();

    const updated = satisfyNeed(state, 'hunger', 200);

    expect(updated.needs.hunger).toBe(100);
  });
});
