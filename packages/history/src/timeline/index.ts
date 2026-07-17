import { HistoryEvent, filterEvents, sortEventsByTick } from '../events';

export interface Timeline {
  id: string;
  name: string;
  events: HistoryEvent[];
  startTick: number;
  endTick: number;
}

export interface TimelineSegment {
  startTick: number;
  endTick: number;
  events: HistoryEvent[];
  summary: string;
}

export function createTimeline(name: string): Timeline {
  return {
    id: crypto.randomUUID(),
    name,
    events: [],
    startTick: 0,
    endTick: 0,
  };
}

export function addEventToTimeline(
  timeline: Timeline,
  event: HistoryEvent
): Timeline {
  const newEvents = [...timeline.events, event];
  return {
    ...timeline,
    events: newEvents,
    startTick: Math.min(timeline.startTick, event.tick),
    endTick: Math.max(timeline.endTick, event.tick),
  };
}

export function getTimelineEvents(
  timeline: Timeline,
  filter?: {
    type?: string;
    citizenId?: string;
    tickFrom?: number;
    tickTo?: number;
  }
): HistoryEvent[] {
  return filterEvents(timeline.events, filter || {});
}

export function getTimelineSegment(
  timeline: Timeline,
  startTick: number,
  endTick: number
): TimelineSegment {
  const events = filterEvents(timeline.events, { tickFrom: startTick, tickTo: endTick });

  return {
    startTick,
    endTick,
    events,
    summary: generateSegmentSummary(events),
  };
}

function generateSegmentSummary(events: HistoryEvent[]): string {
  if (events.length === 0) {
    return 'No events occurred';
  }

  const eventTypes = events.reduce((acc, event) => {
    acc[event.type] = (acc[event.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const parts = Object.entries(eventTypes)
    .map(([type, count]) => `${count} ${type}`)
    .join(', ');

  return `${events.length} events: ${parts}`;
}

export function getTimelineStats(timeline: Timeline) {
  const eventTypes = timeline.events.reduce((acc, event) => {
    acc[event.type] = (acc[event.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const citizenEvents = timeline.events.reduce((acc, event) => {
    if (event.citizenId) {
      acc[event.citizenId] = (acc[event.citizenId] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  return {
    totalEvents: timeline.events.length,
    eventTypes,
    citizenEvents,
    duration: timeline.endTick - timeline.startTick,
  };
}

export function getCitizenTimeline(
  timeline: Timeline,
  citizenId: string
): Timeline {
  const citizenEvents = timeline.events.filter(e => e.citizenId === citizenId);

  return {
    ...timeline,
    name: `${timeline.name} - Citizen ${citizenId}`,
    events: citizenEvents,
    startTick: citizenEvents.length > 0 ? citizenEvents[0].tick : 0,
    endTick: citizenEvents.length > 0 ? citizenEvents[citizenEvents.length - 1].tick : 0,
  };
}
