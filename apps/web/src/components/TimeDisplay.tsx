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

export function TimeDisplay({ time, stats, onTogglePause }: TimeDisplayProps) {
  const dayProgress = Math.round((time.timeOfDay / 2400) * 100);

  return (
    <div className="eden-panel pointer-events-auto overflow-hidden rounded-2xl p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="eden-label">Local world time</p>
          <p className="mt-2 font-mono text-2xl font-medium tracking-tight text-emerald-50">
            {formatTimeOfDay(time.timeOfDay)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] capitalize text-emerald-200/60">{time.season}</p>
          <p className="mt-1 font-mono text-[10px] text-emerald-50/35">Y{time.year} · D{time.day}</p>
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-1.5 flex justify-between font-mono text-[9px] text-emerald-50/30">
          <span>00:00</span>
          <span>{dayProgress}%</span>
          <span>24:00</span>
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-emerald-50/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-300/70 to-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.5)] transition-all duration-500"
            style={{ width: `${dayProgress}%` }}
          />
        </div>
      </div>

      {stats && (
        <button
          type="button"
          onClick={onTogglePause}
          className="mt-4 flex w-full items-center justify-between border-t border-emerald-50/10 pt-3 text-left"
        >
          <span className="text-[10px] text-emerald-50/40">Simulation clock</span>
          <span className={`font-mono text-[10px] ${stats.isRunning ? 'text-emerald-300' : 'text-amber-300'}`}>
            {stats.isRunning ? 'RUNNING' : 'PAUSED'}
          </span>
        </button>
      )}
    </div>
  );
}
