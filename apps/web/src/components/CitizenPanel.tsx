'use client';

import React from 'react';

interface CitizenPanelProps {
  citizen: CitizenData | null;
  thought?: string;
  explanation?: string;
  onClose?: () => void;
}

interface CitizenData {
  id: string;
  name: string;
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
}

function NeedBar({ label, value }: { label: string; value: number }) {
  const getColor = (v: number) => {
    if (v < 20) return 'bg-red-500';
    if (v < 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="mb-2">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-300">{label}</span>
        <span className="text-gray-400">{Math.round(value)}%</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${getColor(value)}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export function CitizenPanel({ citizen, thought, explanation, onClose }: CitizenPanelProps) {
  if (!citizen) return null;

  return (
    <div className="absolute top-4 right-4 w-80 bg-gray-900/95 rounded-lg shadow-xl p-4 text-white max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">{citizen.name}</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white"
        >
          ×
        </button>
      </div>

      <div className="mb-4 text-sm text-gray-400">
        <p>Age: {citizen.age} | Gender: {citizen.gender}</p>
      </div>

      {/* Brain Section */}
      {thought && (
        <div className="mb-4 p-3 bg-gray-800 rounded-lg">
          <h3 className="text-sm font-semibold mb-2 text-cyan-400 flex items-center gap-2">
            <span className="text-lg">🧠</span> Thought
          </h3>
          <p className="text-sm text-gray-300 italic">"{thought}"</p>
        </div>
      )}

      {explanation && (
        <div className="mb-4 p-3 bg-gray-800 rounded-lg">
          <h3 className="text-sm font-semibold mb-2 text-purple-400 flex items-center gap-2">
            <span className="text-lg">💬</span> Decision
          </h3>
          <p className="text-sm text-gray-300">{explanation}</p>
        </div>
      )}

      <div className="mb-4">
        <h3 className="text-sm font-semibold mb-2 text-gray-300">Needs</h3>
        <NeedBar label="Hunger" value={citizen.needs.hunger} />
        <NeedBar label="Energy" value={citizen.needs.energy} />
        <NeedBar label="Social" value={citizen.needs.social} />
        <NeedBar label="Safety" value={citizen.needs.safety} />
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2 text-gray-300">Emotions</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="text-gray-400">
            Happiness: <span className="text-yellow-400">{Math.round(citizen.emotions.happiness)}</span>
          </div>
          <div className="text-gray-400">
            Sadness: <span className="text-blue-400">{Math.round(citizen.emotions.sadness)}</span>
          </div>
          <div className="text-gray-400">
            Anger: <span className="text-red-400">{Math.round(citizen.emotions.anger)}</span>
          </div>
          <div className="text-gray-400">
            Fear: <span className="text-purple-400">{Math.round(citizen.emotions.fear)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
