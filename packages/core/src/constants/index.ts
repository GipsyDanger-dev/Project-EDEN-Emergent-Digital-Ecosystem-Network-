// Core constants for EDEN

export const TICK_RATE = 1000; // ms per tick

export const NEED_DECAY_RATES = {
  hunger: -0.5,
  energy: -0.3,
  social: -0.2,
  safety: -0.1,
};

export const MAX_NEED_VALUE = 100;
export const MIN_NEED_VALUE = 0;

export const EMOTION_THRESHOLDS = {
  happy: 50,
  sad: -50,
  angry: 50,
  fearful: 50,
};

export const EVENT_TYPES = {
  CITIZEN_CREATED: 'CitizenCreated',
  CITIZEN_MOVED: 'CitizenMoved',
  CITIZEN_ACTED: 'CitizenActed',
  CITIZEN_DIED: 'CitizenDied',
  NEED_CHANGED: 'NeedChanged',
  GOAL_CREATED: 'GoalCreated',
  GOAL_ACHIEVED: 'GoalAchieved',
  CONVERSATION_STARTED: 'ConversationStarted',
  TRADE_COMPLETED: 'TradeCompleted',
  HISTORY_RECORDED: 'HistoryRecorded',
} as const;
