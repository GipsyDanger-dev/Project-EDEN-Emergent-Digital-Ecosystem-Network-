import { Event } from '@eden/core';

export type EventHandler = (event: Event) => void;

export interface EventBus {
  handlers: Map<string, EventHandler[]>;
  eventHistory: Event[];
  maxHistorySize: number;
}

export function createEventBus(maxHistorySize: number = 1000): EventBus {
  return {
    handlers: new Map(),
    eventHistory: [],
    maxHistorySize,
  };
}

export function onEvent(
  bus: EventBus,
  eventType: string,
  handler: EventHandler
): EventBus {
  const handlers = bus.handlers.get(eventType) || [];
  return {
    ...bus,
    handlers: bus.handlers.set(eventType, [...handlers, handler]),
  };
}

export function offEvent(
  bus: EventBus,
  eventType: string,
  handler: EventHandler
): EventBus {
  const handlers = bus.handlers.get(eventType) || [];
  const filtered = handlers.filter(h => h !== handler);
  return {
    ...bus,
    handlers: bus.handlers.set(eventType, filtered),
  };
}

export function emitEvent(bus: EventBus, event: Event): void {
  // Store in history
  bus.eventHistory.push(event);
  if (bus.eventHistory.length > bus.maxHistorySize) {
    bus.eventHistory.shift();
  }

  // Call specific handlers
  const specificHandlers = bus.handlers.get(event.type) || [];
  for (const handler of specificHandlers) {
    handler(event);
  }

  // Call wildcard handlers
  const wildcardHandlers = bus.handlers.get('*') || [];
  for (const handler of wildcardHandlers) {
    handler(event);
  }
}

export function getEventHistory(
  bus: EventBus,
  filter?: { type?: string; citizenId?: string; limit?: number }
): Event[] {
  let history = bus.eventHistory;

  if (filter?.type) {
    history = history.filter(e => e.type === filter.type);
  }

  if (filter?.citizenId) {
    history = history.filter(e => e.citizenId === filter.citizenId);
  }

  if (filter?.limit) {
    history = history.slice(-filter.limit);
  }

  return history;
}

export function clearEventHistory(bus: EventBus): EventBus {
  return {
    ...bus,
    eventHistory: [],
  };
}

export function getEventStats(bus: EventBus): {
  totalEvents: number;
  eventsByType: Record<string, number>;
} {
  const eventsByType: Record<string, number> = {};

  for (const event of bus.eventHistory) {
    eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
  }

  return {
    totalEvents: bus.eventHistory.length,
    eventsByType,
  };
}
