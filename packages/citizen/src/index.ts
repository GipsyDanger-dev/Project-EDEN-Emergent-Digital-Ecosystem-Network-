// @eden/citizen - Citizen system

export * from './identity';
export * from './citizen';
export * from './goals';
export {
  createInitialState,
  updateNeeds,
  satisfyNeed as satisfyStateNeed,
  updateEmotions,
  addSkill,
  addItem,
  removeItem,
  type CitizenState,
} from './state';
export {
  createDriveSystem,
  updateDrives,
  satisfyNeed as satisfyDriveNeed,
  getMostUrgentNeed,
  getNeedStatus,
  isAnyNeedCritical,
  getOverallWellbeing,
  adjustDecayRates,
  type DriveSystem,
  type DecayRates,
  type NeedThresholds,
} from './needs';
