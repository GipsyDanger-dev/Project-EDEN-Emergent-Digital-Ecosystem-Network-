'use client';

import React, { useState, useEffect } from 'react';
import { WorldScene, CitizenPanel, TimeDisplay } from '../components';

interface CitizenState {
  id: string;
  name: string;
  position: [number, number, number];
  color: string;
  age: number;
  gender: string;
  needs: {
    hunger: number;
    energy: number;
    social: number;
    safety: number;
  };
  emotions: {
    happiness: number;
    sadness: number;
    anger: number;
    fear: number;
  };
  thought?: string;
  explanation?: string;
}

const INITIAL_CITIZENS: CitizenState[] = [
  {
    id: '1',
    name: 'Alice',
    position: [2, 0.5, 2],
    color: '#ef4444',
    age: 25,
    gender: 'female',
    needs: { hunger: 70, energy: 80, social: 50, safety: 60 },
    emotions: { happiness: 20, sadness: -10, anger: 0, fear: -5 },
  },
  {
    id: '2',
    name: 'Bob',
    position: [-3, 0.5, 4],
    color: '#3b82f6',
    age: 30,
    gender: 'male',
    needs: { hunger: 50, energy: 60, social: 70, safety: 80 },
    emotions: { happiness: 30, sadness: 0, anger: -10, fear: 0 },
  },
  {
    id: '3',
    name: 'Charlie',
    position: [5, 0.5, -2],
    color: '#22c55e',
    age: 22,
    gender: 'male',
    needs: { hunger: 85, energy: 45, social: 30, safety: 70 },
    emotions: { happiness: 10, sadness: 5, anger: -5, fear: 10 },
  },
];

const MOCK_RESOURCES = [
  { id: 'r1', type: 'food', position: [5, 0.2, 3] as [number, number, number], amount: 100 },
  { id: 'r2', type: 'water', position: [-4, 0.2, -2] as [number, number, number], amount: 150 },
  { id: 'r3', type: 'wood', position: [3, 0.2, -4] as [number, number, number], amount: 80 },
];

// Local brain simulation
function simulateBrain(citizen: CitizenState, tick: number): { thought: string; explanation: string } {
  const needs = citizen.needs;
  const mostUrgent = Object.entries(needs)
    .sort(([, a], [, b]) => a - b)[0];

  const [needName, needValue] = mostUrgent;

  let thought = '';
  let action = 'idle';
  let reason = '';

  if (needValue < 30) {
    thought = `My ${needName} is critically low (${Math.round(needValue)}). I must address this immediately.`;
    action = `seek_${needName}`;
    reason = `${needName} is critical at ${Math.round(needValue)}%`;
  } else if (needValue < 60) {
    const feeling = needName === 'hunger' ? 'hungry' : needName === 'energy' ? 'tired' : needName === 'social' ? 'lonely' : 'unsafe';
    thought = `I'm starting to feel ${feeling}.`;
    action = `seek_${needName}`;
    reason = `${needName} is getting low at ${Math.round(needValue)}%`;
  } else {
    const thoughts = [
      'Everything seems fine. I wonder what I should do next.',
      'This is a nice day. Maybe I should explore.',
      'I feel good. Perhaps I should meet someone.',
      'The world is interesting. Let me look around.',
    ];
    thought = thoughts[tick % thoughts.length];
    action = 'look_around';
    reason = 'Exploring the environment';
  }

  const explanation = `As ${citizen.name}, I decided to ${action} because ${reason}. ` +
    `My needs are: hunger=${Math.round(needs.hunger)}, energy=${Math.round(needs.energy)}, ` +
    `social=${Math.round(needs.social)}, safety=${Math.round(needs.safety)}.`;

  return { thought, explanation };
}

function simulateNeedsUpdate(citizen: CitizenState): CitizenState {
  return {
    ...citizen,
    needs: {
      hunger: Math.max(0, citizen.needs.hunger - 0.5),
      energy: Math.max(0, citizen.needs.energy - 0.3),
      social: Math.max(0, citizen.needs.social - 0.2),
      safety: Math.max(0, citizen.needs.safety - 0.1),
    },
  };
}

function simulateMovement(citizen: CitizenState): CitizenState {
  // Simple random movement
  const newX = citizen.position[0] + (Math.random() - 0.5) * 0.5;
  const newZ = citizen.position[2] + (Math.random() - 0.5) * 0.5;

  // Keep within bounds
  const clampedX = Math.max(-9, Math.min(9, newX));
  const clampedZ = Math.max(-9, Math.min(9, newZ));

  return {
    ...citizen,
    position: [clampedX, 0.5, clampedZ],
  };
}

export default function Home() {
  const [selectedCitizen, setSelectedCitizen] = useState<string | null>(null);
  const [citizens, setCitizens] = useState<CitizenState[]>(INITIAL_CITIZENS);
  const [time, setTime] = useState({
    timeOfDay: 600,
    day: 1,
    season: 'spring',
    year: 1,
  });
  const [isRunning, setIsRunning] = useState(true);
  const [tick, setTick] = useState(0);

  // Simulation loop
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTick(prev => prev + 1);

      // Update time
      setTime(prev => {
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

      // Update citizens
      setCitizens(prev => prev.map(citizen => {
        // Update needs
        const updated = simulateNeedsUpdate(citizen);

        // Simulate brain every 5 ticks
        let thought = citizen.thought;
        let explanation = citizen.explanation;
        if (tick % 5 === 0) {
          const brain = simulateBrain(updated, tick);
          thought = brain.thought;
          explanation = brain.explanation;
        }

        // Move citizen
        const moved = simulateMovement(updated);

        return {
          ...moved,
          thought,
          explanation,
        };
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, tick]);

  const selectedCitizenData = selectedCitizen
    ? citizens.find((c) => c.id === selectedCitizen) || null
    : null;

  const selectedThought = selectedCitizenData?.thought;
  const selectedExplanation = selectedCitizenData?.explanation;

  return (
    <main className="relative w-full h-screen bg-gray-950">
      <WorldScene
        width={20}
        height={20}
        citizens={citizens}
        resources={MOCK_RESOURCES}
        onCitizenClick={setSelectedCitizen}
      />

      <TimeDisplay
        time={time}
        stats={{
          tick,
          citizenCount: citizens.length,
          isRunning,
        }}
        onTogglePause={() => setIsRunning(!isRunning)}
      />

      <CitizenPanel
        citizen={selectedCitizenData}
        thought={selectedThought}
        explanation={selectedExplanation}
        onClose={() => setSelectedCitizen(null)}
      />

      <div className="absolute bottom-4 left-4 bg-gray-900/95 rounded-lg shadow-xl p-4 text-white text-sm">
        <p className="text-gray-400">
          Click on a citizen to view their thoughts
        </p>
        <p className="text-gray-400 mt-1">
          Drag to rotate, scroll to zoom
        </p>
      </div>
    </main>
  );
}
