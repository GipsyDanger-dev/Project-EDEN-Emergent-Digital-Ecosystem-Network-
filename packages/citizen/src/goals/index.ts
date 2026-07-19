import { Needs } from '@eden/core';
import { DriveSystem, getMostUrgentNeed } from '../needs';

export interface Goal {
  id: string;
  citizenId: string;
  type: GoalType;
  description: string;
  priority: number;  // 0-100
  status: GoalStatus;
  targetNeed: keyof Needs;
  targetValue: number;
  createdAt: number;
  completedAt?: number;
  deadline?: number;
}

export type GoalType = 'survival' | 'social' | 'comfort' | 'achievement';
export type GoalStatus = 'active' | 'completed' | 'failed' | 'abandoned';

export interface GoalSystem {
  citizenId: string;
  activeGoals: Goal[];
  completedGoals: Goal[];
  maxActiveGoals: number;
}

export function createGoalSystem(citizenId: string): GoalSystem {
  return {
    citizenId,
    activeGoals: [],
    completedGoals: [],
    maxActiveGoals: 5,
  };
}

export function generateGoals(
  goalSystem: GoalSystem,
  driveSystem: DriveSystem
): GoalSystem {
  const urgentNeed = getMostUrgentNeed(driveSystem);

  if (!urgentNeed) {
    return goalSystem;
  }

  // Check if we already have a goal for this need
  const existingGoal = goalSystem.activeGoals.find(
    g => g.targetNeed === urgentNeed.need && g.status === 'active'
  );

  if (existingGoal) {
    // Update priority based on urgency
    const updatedGoals = goalSystem.activeGoals.map(g =>
      g.id === existingGoal.id
        ? { ...g, priority: calculatePriority(urgentNeed.value, urgentNeed.urgency) }
        : g
    );
    return { ...goalSystem, activeGoals: updatedGoals };
  }

  // Create new goal if we have space
  if (goalSystem.activeGoals.length >= goalSystem.maxActiveGoals) {
    return goalSystem;
  }

  const newGoal = createGoalFromNeed(
    goalSystem.citizenId,
    urgentNeed.need,
    urgentNeed.value,
    urgentNeed.urgency
  );

  return {
    ...goalSystem,
    activeGoals: [...goalSystem.activeGoals, newGoal],
  };
}

function createGoalFromNeed(
  citizenId: string,
  need: keyof Needs,
  currentValue: number,
  urgency: 'critical' | 'low' | 'normal'
): Goal {
  const goalTemplates: Record<keyof Needs, { type: GoalType; description: string; targetValue: number }> = {
    hunger: {
      type: 'survival',
      description: 'Find food to satisfy hunger',
      targetValue: 70,
    },
    energy: {
      type: 'survival',
      description: 'Find rest to restore energy',
      targetValue: 70,
    },
    social: {
      type: 'social',
      description: 'Find social interaction',
      targetValue: 60,
    },
    safety: {
      type: 'survival',
      description: 'Find safe location',
      targetValue: 60,
    },
  };

  const template = goalTemplates[need];

  return {
    id: crypto.randomUUID(),
    citizenId,
    type: template.type,
    description: template.description,
    priority: calculatePriority(currentValue, urgency),
    status: 'active',
    targetNeed: need,
    targetValue: template.targetValue,
    createdAt: Date.now(),
  };
}

function calculatePriority(
  currentValue: number,
  urgency: 'critical' | 'low' | 'normal'
): number {
  let basePriority = 100 - currentValue;

  if (urgency === 'critical') basePriority += 50;
  else if (urgency === 'low') basePriority += 20;

  return Math.min(100, Math.max(0, basePriority));
}

export function prioritizeGoals(goalSystem: GoalSystem): GoalSystem {
  const sortedGoals = [...goalSystem.activeGoals].sort(
    (a, b) => b.priority - a.priority
  );

  return {
    ...goalSystem,
    activeGoals: sortedGoals,
  };
}

export function getHighestPriorityGoal(goalSystem: GoalSystem): Goal | null {
  const activeGoals = goalSystem.activeGoals.filter(g => g.status === 'active');
  if (activeGoals.length === 0) return null;

  return activeGoals.reduce((highest, current) =>
    current.priority > highest.priority ? current : highest
  );
}

export function completeGoal(
  goalSystem: GoalSystem,
  goalId: string
): GoalSystem {
  const goal = goalSystem.activeGoals.find(g => g.id === goalId);
  if (!goal) return goalSystem;

  const completedGoal: Goal = {
    ...goal,
    status: 'completed',
    completedAt: Date.now(),
  };

  return {
    ...goalSystem,
    activeGoals: goalSystem.activeGoals.filter(g => g.id !== goalId),
    completedGoals: [...goalSystem.completedGoals, completedGoal],
  };
}

export function failGoal(
  goalSystem: GoalSystem,
  goalId: string
): GoalSystem {
  const goal = goalSystem.activeGoals.find(g => g.id === goalId);
  if (!goal) return goalSystem;

  const failedGoal: Goal = {
    ...goal,
    status: 'failed',
    completedAt: Date.now(),
  };

  return {
    ...goalSystem,
    activeGoals: goalSystem.activeGoals.filter(g => g.id !== goalId),
    completedGoals: [...goalSystem.completedGoals, failedGoal],
  };
}

export function abandonGoal(
  goalSystem: GoalSystem,
  goalId: string
): GoalSystem {
  const goal = goalSystem.activeGoals.find(g => g.id === goalId);
  if (!goal) return goalSystem;

  const abandonedGoal: Goal = {
    ...goal,
    status: 'abandoned',
    completedAt: Date.now(),
  };

  return {
    ...goalSystem,
    activeGoals: goalSystem.activeGoals.filter(g => g.id !== goalId),
    completedGoals: [...goalSystem.completedGoals, abandonedGoal],
  };
}

export function getGoalProgress(
  goal: Goal,
  currentNeeds: Needs
): number {
  const currentValue = currentNeeds[goal.targetNeed];
  if (currentValue >= goal.targetValue) {
    return 1;
  }

  return currentValue / goal.targetValue;
}
