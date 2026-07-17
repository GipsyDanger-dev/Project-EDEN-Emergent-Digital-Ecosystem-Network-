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

function getSeasonColor(season: string): string {
  switch (season) {
    case 'spring': return 'text-green-400';
    case 'summer': return 'text-yellow-400';
    case 'autumn': return 'text-orange-400';
    case 'winter': return 'text-blue-400';
    default: return 'text-gray-400';
  }
}

function getTimeIcon(timeOfDay: number): string {
  if (timeOfDay >= 600 && timeOfDay < 900) return '🌅';
  if (timeOfDay >= 900 && timeOfDay < 1700) return '☀️';
  if (timeOfDay >= 1700 && timeOfDay < 2000) return '🌇';
  return '🌙';
}

export function TimeDisplay({ time, stats, onTogglePause }: TimeDisplayProps) {
  return (
    <div className="absolute top-4 left-4 w-64 bg-gray-900/98 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-800/50 text-white overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 p-4 border-b border-gray-800/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{getTimeIcon(time.timeOfDay)}</div>
            <div>
              <div className="text-2xl font-bold font-mono tracking-tight">
                {formatTimeOfDay(time.timeOfDay)}
              </div>
              <div className="text-xs text-gray-400 mt-0.5">
                Day {time.day}, Year {time.year}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl">{getSeasonEmoji(time.season)}</div>
            <div className={`text-xs font-medium capitalize ${getSeasonColor(time.season)}`}>
              {time.season}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="p-4 space-y-3">
          {/* Status Indicator */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${stats.isRunning ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></div>
              <span className="text-xs font-medium text-gray-400">
                {stats.isRunning ? 'Simulation Running' : 'Paused'}
              </span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-800/50 rounded-lg p-2.5 border border-gray-700/30">
              <div className="text-xs text-gray-500 mb-1">Citizens</div>
              <div className="text-lg font-bold text-white">{stats.citizenCount}</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-2.5 border border-gray-700/30">
              <div className="text-xs text-gray-500 mb-1">Tick</div>
              <div className="text-lg font-bold text-white font-mono">{stats.tick}</div>
            </div>
          </div>

          {/* Time Progress */}
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1.5">
              <span>Day Progress</span>
              <span>{Math.round((time.timeOfDay / 2400) * 100)}%</span>
            </div>
            <div className="h-1.5 bg-gray-700/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${(time.timeOfDay / 2400) * 100}%` }}
              />
            </div>
          </div>

          {/* Season Progress */}
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1.5">
              <span>Season Progress</span>
              <span>{Math.round(((time.day % 30) / 30) * 100)}%</span>
            </div>
            <div className="h-1.5 bg-gray-700/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${((time.day % 30) / 30) * 100}%` }}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={onTogglePause}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all duration-200 ${
                stats.isRunning
                  ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border border-yellow-500/30'
                  : 'bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30'
              }`}
            >
              {stats.isRunning ? (
                <span className="flex items-center justify-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                  Pause
                </span>
              ) : (
                <span className="flex items-center justify-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Resume
                </span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
