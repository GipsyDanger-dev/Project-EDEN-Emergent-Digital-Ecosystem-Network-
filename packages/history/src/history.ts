import { Event } from '@eden/core';
import { HistoryEvent, createHistoryEvent, EventFilter, filterEvents } from './events';
import { Timeline, createTimeline, addEventToTimeline, getTimelineStats } from './timeline';

export interface HistorySystem {
  id: string;
  events: HistoryEvent[];
  timeline: Timeline;
  maxEvents: number;
}

export function createHistorySystem(name: string): HistorySystem {
  return {
    id: crypto.randomUUID(),
    events: [],
    timeline: createTimeline(name),
    maxEvents: 10000,
  };
}

export function recordEvent(
  history: HistorySystem,
  event: Event,
  tick: number
): HistorySystem {
  const historyEvent = createHistoryEvent(event, tick);

  const newEvents = [...history.events, historyEvent];
  const trimmedEvents = newEvents.length > history.maxEvents
    ? newEvents.slice(-history.maxEvents)
    : newEvents;

  const newTimeline = addEventToTimeline(history.timeline, historyEvent);

  return {
    ...history,
    events: trimmedEvents,
    timeline: newTimeline,
  };
}

export function recordEvents(
  history: HistorySystem,
  events: Event[],
  tick: number
): HistorySystem {
  let current = history;
  for (const event of events) {
    current = recordEvent(current, event, tick);
  }
  return current;
}

export function queryEvents(
  history: HistorySystem,
  filter: EventFilter
): HistoryEvent[] {
  return filterEvents(history.events, filter);
}

export function getCitizenHistory(
  history: HistorySystem,
  citizenId: string
): HistoryEvent[] {
  return history.events.filter(e => e.citizenId === citizenId);
}

export function getRecentHistory(
  history: HistorySystem,
  count: number
): HistoryEvent[] {
  return history.events.slice(-count);
}

export function getHistoryStats(history: HistorySystem) {
  const timelineStats = getTimelineStats(history.timeline);

  return {
    ...timelineStats,
  };
}

export function clearHistory(history: HistorySystem): HistorySystem {
  return {
    ...history,
    events: [],
    timeline: createTimeline(history.timeline.name),
  };
}
