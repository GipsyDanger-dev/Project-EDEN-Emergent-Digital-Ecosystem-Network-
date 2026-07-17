import { describe, it, expect } from 'vitest';
import {
  createTimeSystem,
  advanceTime,
  getTimeOfDayName,
  getHour,
  getMinute,
  formatTime,
  formatDate,
  isDaytime,
  isNighttime,
  pauseTime,
  resumeTime,
} from './index';

describe('TimeSystem', () => {
  it('should create time system with default values', () => {
    const time = createTimeSystem();

    expect(time.currentTick).toBe(0);
    expect(time.totalTicks).toBe(0);
    expect(time.timeOfDay).toBe(600); // 6:00 AM
    expect(time.day).toBe(1);
    expect(time.season).toBe('spring');
    expect(time.year).toBe(1);
    expect(time.isPaused).toBe(false);
  });

  it('should advance time correctly', () => {
    const time = createTimeSystem();

    const advanced = advanceTime(time);

    expect(advanced.currentTick).toBe(1);
    expect(advanced.totalTicks).toBe(1);
    expect(advanced.timeOfDay).toBe(610); // +10 minutes
  });

  it('should advance to next day when time exceeds 2400', () => {
    const time = {
      ...createTimeSystem(),
      timeOfDay: 2390,
      day: 1,
    };

    const advanced = advanceTime(time);

    expect(advanced.timeOfDay).toBe(0);
    expect(advanced.day).toBe(2);
  });

  it('should not advance when paused', () => {
    const time = pauseTime(createTimeSystem());

    const advanced = advanceTime(time);

    expect(advanced.currentTick).toBe(0);
    expect(advanced.timeOfDay).toBe(600);
  });

  it('should resume after pause', () => {
    let time = pauseTime(createTimeSystem());
    time = resumeTime(time);

    expect(time.isPaused).toBe(false);

    const advanced = advanceTime(time);
    expect(advanced.currentTick).toBe(1);
  });

  it('should get correct time of day name', () => {
    expect(getTimeOfDayName(300)).toBe('night');
    expect(getTimeOfDayName(700)).toBe('morning');
    expect(getTimeOfDayName(1100)).toBe('midday');
    expect(getTimeOfDayName(1400)).toBe('afternoon');
    expect(getTimeOfDayName(1600)).toBe('evening');
    expect(getTimeOfDayName(1900)).toBe('night');
  });

  it('should extract hour and minute correctly', () => {
    expect(getHour(1430)).toBe(14);
    expect(getMinute(1430)).toBe(30);
    expect(getHour(600)).toBe(6);
    expect(getMinute(600)).toBe(0);
  });

  it('should format time correctly', () => {
    const time = { ...createTimeSystem(), timeOfDay: 1430 };

    const formatted = formatTime(time);

    expect(formatted).toBe('2:30 PM');
  });

  it('should format date correctly', () => {
    const time = { ...createTimeSystem(), day: 15, year: 2 };

    const formatted = formatDate(time);

    expect(formatted).toBe('Day 15, Year 2');
  });

  it('should detect daytime correctly', () => {
    expect(isDaytime(600)).toBe(true);
    expect(isDaytime(1200)).toBe(true);
    expect(isDaytime(1700)).toBe(true);
    expect(isDaytime(1800)).toBe(false);
    expect(isDaytime(300)).toBe(false);
  });

  it('should detect nighttime correctly', () => {
    expect(isNighttime(2000)).toBe(true);
    expect(isNighttime(300)).toBe(true);
    expect(isNighttime(1200)).toBe(false);
  });
});
