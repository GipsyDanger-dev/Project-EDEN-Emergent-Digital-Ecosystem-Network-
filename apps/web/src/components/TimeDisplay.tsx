'use client';

import React from 'react';

interface TimeDisplayProps {
  time: {
    timeOfDay: number;
    day: number;
    season: string;
    year: number;
  };
  stats?: {
    tick: number;
    citizenCount: number;
    isRunning: boolean;
  };
  onTogglePause?: () => void;
}

function formatTimeOfDay(timeOfDay: number): string {
  const hour = Math.floor(timeOfDay / 100);
  const minute = timeOfDay % 100;
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
}

function getSeasonEmoji(season: string): string {
  switch (season) {
    case 'spring': return '🌸';
    case 'summer': return '☀️';
    case 'autumn': return '🍂';
    case 'winter': return '❄️';
    default: return '🌍';
  }
}

export function TimeDisplay({ time, stats, onTogglePause }: TimeDisplayProps) {
  return (
    <div className="absolute top-4 left-4 bg-gray-900/95 rounded-lg shadow-xl p-4 text-white">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">{getSeasonEmoji(time.season)}</span>
        <div>
          <div className="text-lg font-bold">{formatTimeOfDay(time.timeOfDay)}</div>
          <div className="text-sm text-gray-400">
            Day {time.day}, Year {time.year}
          </div>
        </div>
      </div>

      {stats && (
        <div className="mt-3 pt-3 border-t border-gray-700 text-sm text-gray-400">
          <div className="flex justify-between">
            <span>Citizens:</span>
            <span className="text-white">{stats.citizenCount}</span>
          </div>
          <div className="flex justify-between">
            <span>Tick:</span>
            <span className="text-white">{stats.tick}</span>
          </div>
          <div className="mt-2">
            <button
              onClick={onTogglePause}
              className={`w-full py-1 px-3 rounded text-sm font-medium ${
                stats.isRunning
                  ? 'bg-yellow-600 hover:bg-yellow-700'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {stats.isRunning ? 'Pause' : 'Resume'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
