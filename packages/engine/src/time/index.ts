export interface TimeSystem {
  currentTick: number;
  totalTicks: number;
  tickRate: number;  // ms per tick
  timeOfDay: number; // 0-2400 (24 hours * 100)
  day: number;
  season: Season;
  year: number;
  isPaused: boolean;
}

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export function createTimeSystem(tickRate: number = 1000): TimeSystem {
  return {
    currentTick: 0,
    totalTicks: 0,
    tickRate,
    timeOfDay: 600,  // Start at 6:00 AM
    day: 1,
    season: 'spring',
    year: 1,
    isPaused: false,
  };
}

export function advanceTime(time: TimeSystem): TimeSystem {
  if (time.isPaused) return time;

  const newTimeOfDay = time.timeOfDay + 10;  // Each tick = 10 minutes of game time

  let newDay = time.day;
  let newSeason = time.season;
  let newYear = time.year;

  // New day
  if (newTimeOfDay >= 2400) {
    newDay += 1;

    // New season every 30 days
    if (newDay % 30 === 0) {
      const seasons: Season[] = ['spring', 'summer', 'autumn', 'winter'];
      const currentIndex = seasons.indexOf(time.season);
      newSeason = seasons[(currentIndex + 1) % 4];

      // New year every 120 days (4 seasons)
      if (newSeason === 'spring') {
        newYear += 1;
      }
    }
  }

  return {
    ...time,
    currentTick: time.currentTick + 1,
    totalTicks: time.totalTicks + 1,
    timeOfDay: newTimeOfDay >= 2400 ? newTimeOfDay - 2400 : newTimeOfDay,
    day: newDay,
    season: newSeason,
    year: newYear,
  };
}

export function getTimeOfDayName(timeOfDay: number): string {
  if (timeOfDay < 600) return 'night';
  if (timeOfDay < 900) return 'morning';
  if (timeOfDay < 1200) return 'midday';
  if (timeOfDay < 1500) return 'afternoon';
  if (timeOfDay < 1800) return 'evening';
  if (timeOfDay < 2100) return 'night';
  return 'night';
}

export function getHour(timeOfDay: number): number {
  return Math.floor(timeOfDay / 100);
}

export function getMinute(timeOfDay: number): number {
  return timeOfDay % 100;
}

export function formatTime(time: TimeSystem): string {
  const hour = getHour(time.timeOfDay);
  const minute = getMinute(time.timeOfDay);
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;

  return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
}

export function formatDate(time: TimeSystem): string {
  return `Day ${time.day}, Year ${time.year}`;
}

export function getSeasonModifiers(season: Season): {
  temperature: number;
  resourceMultiplier: number;
  energyDecay: number;
} {
  switch (season) {
    case 'spring':
      return { temperature: 20, resourceMultiplier: 1.2, energyDecay: 1.0 };
    case 'summer':
      return { temperature: 30, resourceMultiplier: 1.0, energyDecay: 1.2 };
    case 'autumn':
      return { temperature: 15, resourceMultiplier: 0.8, energyDecay: 1.0 };
    case 'winter':
      return { temperature: 5, resourceMultiplier: 0.5, energyDecay: 1.5 };
  }
}

export function isDaytime(timeOfDay: number): boolean {
  return timeOfDay >= 600 && timeOfDay < 1800;
}

export function isNighttime(timeOfDay: number): boolean {
  return !isDaytime(timeOfDay);
}

export function pauseTime(time: TimeSystem): TimeSystem {
  return { ...time, isPaused: true };
}

export function resumeTime(time: TimeSystem): TimeSystem {
  return { ...time, isPaused: false };
}
