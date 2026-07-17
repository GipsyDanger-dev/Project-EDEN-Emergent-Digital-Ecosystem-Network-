import { Event } from '@eden/core';

export interface HistoryEvent extends Event {
  tick: number;
  metadata: {
    tick: number;
    cause: string;
    duration?: number;
  };
}

export interface EventFilter {
  type?: string;
  citizenId?: string;
  tickFrom?: number;
  tickTo?: number;
  limit?: number;
}

export function createHistoryEvent(
  event: Event,
  tick: number
): HistoryEvent {
  return {
    ...event,
    tick,
    metadata: {
      ...event.metadata,
      tick,
    },
  };
}

export function filterEvents(
  events: HistoryEvent[],
  filter: EventFilter
): HistoryEvent[] {
  let filtered = events;

  if (filter.type) {
    filtered = filtered.filter(e => e.type === filter.type);
  }

  if (filter.citizenId) {
    filtered = filtered.filter(e => e.citizenId === filter.citizenId);
  }

  if (filter.tickFrom !== undefined) {
    filtered = filtered.filter(e => e.tick >= filter.tickFrom!);
  }

  if (filter.tickTo !== undefined) {
    filtered = filtered.filter(e => e.tick <= filter.tickTo!);
  }

  if (filter.limit) {
    filtered = filtered.slice(-filter.limit);
  }

  return filtered;
}

export function sortEventsByTick(events: HistoryEvent[]): HistoryEvent[] {
  return [...events].sort((a, b) => a.tick - b.tick);
}

export function getEventsByCitizen(
  events: HistoryEvent[],
  citizenId: string
): HistoryEvent[] {
  return events.filter(e => e.citizenId === citizenId);
}

export function getEventsByType(
  events: HistoryEvent[],
  type: string
): HistoryEvent[] {
  return events.filter(e => e.type === type);
}

export function getRecentEvents(
  events: HistoryEvent[],
  count: number
): HistoryEvent[] {
  return events.slice(-count);
}
