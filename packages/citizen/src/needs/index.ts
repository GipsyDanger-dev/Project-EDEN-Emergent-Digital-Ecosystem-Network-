import { Needs } from '@eden/core';

export interface DriveSystem {
  citizenId: string;
  needs: Needs;
  decayRates: DecayRates;
  thresholds: NeedThresholds;
}

export interface DecayRates {
  hunger: number;
  energy: number;
  social: number;
  safety: number;
}

export interface NeedThresholds {
  critical: number;    // Below this = critical state
  low: number;         // Below this = need attention
  comfortable: number; // Above this = satisfied
}

export function createDriveSystem(citizenId: string): DriveSystem {
  return {
    citizenId,
    needs: {
      hunger: 70,
      energy: 80,
      social: 50,
      safety: 60,
    },
    decayRates: {
      hunger: -0.5,
      energy: -0.3,
      social: -0.2,
      safety: -0.1,
    },
    thresholds: {
      critical: 20,
      low: 40,
      comfortable: 70,
    },
  };
}

export function updateDrives(driveSystem: DriveSystem): DriveSystem {
  const newNeeds: Needs = {
    hunger: Math.max(0, Math.min(100, driveSystem.needs.hunger + driveSystem.decayRates.hunger)),
    energy: Math.max(0, Math.min(100, driveSystem.needs.energy + driveSystem.decayRates.energy)),
    social: Math.max(0, Math.min(100, driveSystem.needs.social + driveSystem.decayRates.social)),
    safety: Math.max(0, Math.min(100, driveSystem.needs.safety + driveSystem.decayRates.safety)),
  };

  return {
    ...driveSystem,
    needs: newNeeds,
  };
}

export function satisfyNeed(
  driveSystem: DriveSystem,
  need: keyof Needs,
  amount: number
): DriveSystem {
  return {
    ...driveSystem,
    needs: {
      ...driveSystem.needs,
      [need]: Math.max(0, Math.min(100, driveSystem.needs[need] + amount)),
    },
  };
}

export function getMostUrgentNeed(driveSystem: DriveSystem): {
  need: keyof Needs;
  value: number;
  urgency: 'critical' | 'low' | 'normal';
} | null {
  const entries = Object.entries(driveSystem.needs) as [keyof Needs, number][];
  const sorted = entries.sort((a, b) => a[1] - b[1]);
  const [need, value] = sorted[0];

  if (value >= driveSystem.thresholds.comfortable) {
    return null;
  }

  let urgency: 'critical' | 'low' | 'normal' = 'normal';
  if (value < driveSystem.thresholds.critical) {
    urgency = 'critical';
  } else if (value < driveSystem.thresholds.low) {
    urgency = 'low';
  }

  return { need, value, urgency };
}

export function getNeedStatus(
  driveSystem: DriveSystem,
  need: keyof Needs
): 'critical' | 'low' | 'comfortable' | 'normal' {
  const value = driveSystem.needs[need];
  const { critical, low, comfortable } = driveSystem.thresholds;

  if (value < critical) return 'critical';
  if (value < low) return 'low';
  if (value >= comfortable) return 'comfortable';
  return 'normal';
}

export function isAnyNeedCritical(driveSystem: DriveSystem): boolean {
  return Object.values(driveSystem.needs).some(
    value => value < driveSystem.thresholds.critical
  );
}

export function getOverallWellbeing(driveSystem: DriveSystem): number {
  const values = Object.values(driveSystem.needs);
  const sum = values.reduce((a, b) => a + b, 0);
  return sum / values.length;
}

export function adjustDecayRates(
  driveSystem: DriveSystem,
  modifiers: Partial<DecayRates>
): DriveSystem {
  return {
    ...driveSystem,
    decayRates: {
      ...driveSystem.decayRates,
      ...modifiers,
    },
  };
}
