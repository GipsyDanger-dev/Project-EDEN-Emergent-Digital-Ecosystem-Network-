'use client';

import React, { useState, useEffect } from 'react';
import { WorldScene, CitizenPanel, TimeDisplay } from '../components';

const MOCK_CITIZENS = [
  {
    id: '1',
    name: 'Alice',
    position: [2, 0.5, 2] as [number, number, number],
    color: '#ef4444',
    age: 25,
    gender: 'female',
    needs: { hunger: 70, energy: 80, social: 50, safety: 60 },
    emotions: { happiness: 20, sadness: -10, anger: 0, fear: -5 },
  },
  {
    id: '2',
    name: 'Bob',
    position: [-3, 0.5, 4] as [number, number, number],
    color: '#3b82f6',
    age: 30,
    gender: 'male',
    needs: { hunger: 50, energy: 60, social: 70, safety: 80 },
    emotions: { happiness: 30, sadness: 0, anger: -10, fear: 0 },
  },
];

const MOCK_RESOURCES = [
  { id: 'r1', type: 'food', position: [5, 0.2, 3] as [number, number, number], amount: 100 },
  { id: 'r2', type: 'water', position: [-4, 0.2, -2] as [number, number, number], amount: 150 },
  { id: 'r3', type: 'wood', position: [3, 0.2, -4] as [number, number, number], amount: 80 },
];

export default function Home() {
  const [selectedCitizen, setSelectedCitizen] = useState<string | null>(null);
  const [time, setTime] = useState({
    timeOfDay: 600,
    day: 1,
    season: 'spring',
    year: 1,
  });
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTime((prev) => {
        let newTimeOfDay = prev.timeOfDay + 10;
        let newDay = prev.day;
        let newSeason = prev.season;
        let newYear = prev.year;

        if (newTimeOfDay >= 2400) {
          newTimeOfDay -= 2400;
          newDay += 1;

          if (newDay % 30 === 0) {
            const seasons = ['spring', 'summer', 'autumn', 'winter'];
            const currentIndex = seasons.indexOf(prev.season);
            newSeason = seasons[(currentIndex + 1) % 4];

            if (newSeason === 'spring') {
              newYear += 1;
            }
          }
        }

        return {
          timeOfDay: newTimeOfDay,
          day: newDay,
          season: newSeason,
          year: newYear,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  const selectedCitizenData = selectedCitizen
    ? MOCK_CITIZENS.find((c) => c.id === selectedCitizen) || null
    : null;

  return (
    <main className="relative w-full h-screen bg-gray-950">
      <WorldScene
        width={20}
        height={20}
        citizens={MOCK_CITIZENS}
        resources={MOCK_RESOURCES}
        onCitizenClick={setSelectedCitizen}
      />

      <TimeDisplay
        time={time}
        stats={{
          tick: time.day * 24,
          citizenCount: MOCK_CITIZENS.length,
          isRunning,
        }}
        onTogglePause={() => setIsRunning(!isRunning)}
      />

      <CitizenPanel
        citizen={selectedCitizenData}
        onClose={() => setSelectedCitizen(null)}
      />

      <div className="absolute bottom-4 left-4 bg-gray-900/95 rounded-lg shadow-xl p-4 text-white text-sm">
        <p className="text-gray-400">
          Click on a citizen to view their details
        </p>
        <p className="text-gray-400 mt-1">
          Drag to rotate, scroll to zoom
        </p>
      </div>
    </main>
  );
}
