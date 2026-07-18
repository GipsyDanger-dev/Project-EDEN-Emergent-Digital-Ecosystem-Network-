'use client';

import React, { useEffect } from 'react';
import { soundEngine, initSound } from '../utils/sound-engine';

interface CitizenPanelProps {
  citizen: CitizenData | null;
  thoughts?: string[];
  onClose?: () => void;
}

interface CitizenData {
  id: string;
  name: string;
  age: number;
  gender: string;
  action?: string;
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

function NeedBar({ label, value, icon }: { label: string; value: number; icon: string }) {
  const getColor = (v: number) => {
    if (v < 20) return 'from-red-500 to-red-600';
    if (v < 40) return 'from-orange-500 to-yellow-500';
    if (v < 60) return 'from-yellow-500 to-yellow-400';
    return 'from-green-500 to-emerald-500';
  };

  const getTextColor = (v: number) => {
    if (v < 20) return 'text-red-400';
    if (v < 40) return 'text-orange-400';
    if (v < 60) return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs font-medium text-gray-300 flex items-center gap-1.5">
          <span className="text-sm">{icon}</span>
          {label}
        </span>
        <span className={`text-xs font-mono ${getTextColor(value)}`}>
          {Math.round(value)}%
        </span>
      </div>
      <div className="h-1.5 bg-gray-700/50 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${getColor(value)} transition-all duration-500`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function EmotionIndicator({ label, value, color }: { label: string; value: number; color: string }) {
  const normalizedValue = Math.round(value);
  const isPositive = normalizedValue >= 0;

  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-xs text-gray-400">{label}</span>
      <div className="flex items-center gap-2">
        <div className="w-16 h-1 bg-gray-700/50 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.abs(normalizedValue)}%`,
              backgroundColor: color,
              marginLeft: isPositive ? '50%' : undefined,
              marginRight: !isPositive ? '50%' : undefined,
            }}
          />
        </div>
        <span className="text-xs font-mono" style={{ color }}>
          {isPositive ? '+' : ''}{normalizedValue}
        </span>
      </div>
    </div>
  );
}

export function CitizenPanel({ citizen, thoughts, onClose }: CitizenPanelProps) {
  // Play sound when citizen is selected
  useEffect(() => {
    if (citizen) {
      initSound();
      soundEngine.playSelect();
    }
  }, [citizen?.id]);

  if (!citizen) return null;

  const getStatusColor = (action?: string) => {
    switch (action) {
      case 'find_food':
      case 'search_food':
        return 'text-orange-400 bg-orange-400/10';
      case 'find_rest':
        return 'text-blue-400 bg-blue-400/10';
      case 'approach_citizen':
      case 'socialize':
        return 'text-purple-400 bg-purple-400/10';
      case 'explore':
        return 'text-cyan-400 bg-cyan-400/10';
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getActionLabel = (action?: string) => {
    switch (action) {
      case 'find_food':
      case 'search_food':
        return 'Searching for food';
      case 'find_rest':
        return 'Looking for rest';
      case 'approach_citizen':
        return 'Approaching citizen';
      case 'socialize':
        return 'Socializing';
      case 'explore':
        return 'Exploring';
      case 'find_companion':
        return 'Finding companion';
      case 'find_shelter':
        return 'Finding shelter';
      default:
        return 'Idle';
    }
  };

  const handleClose = () => {
    soundEngine.playDeselect();
    onClose?.();
  };

  return (
    <div className="absolute top-4 right-4 w-96 bg-gray-900/98 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-800/50 text-white max-h-[calc(100vh-2rem)] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-800/50 bg-gradient-to-r from-gray-900 to-gray-800/50">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg"
              style={{ backgroundColor: citizen.color + '20', color: citizen.color }}
            >
              {citizen.name[0]}
            </div>
            <div>
              <h2 className="text-lg font-bold">{citizen.name}</h2>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>{citizen.age} years</span>
                <span>•</span>
                <span className="capitalize">{citizen.gender}</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-gray-700/50 rounded"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Current Action */}
        {citizen.action && (
          <div className={`mt-3 px-3 py-1.5 rounded-lg text-xs font-medium ${getStatusColor(citizen.action)}`}>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></div>
              {getActionLabel(citizen.action)}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Thought Bubble */}
        {citizen.thought && (
          <div className="relative">
            <div className="absolute -left-2 top-2 w-4 h-4 bg-gray-800 transform rotate-45"></div>
            <div className="relative bg-gradient-to-br from-gray-800/80 to-gray-800/40 rounded-xl p-4 border border-gray-700/50">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🧠</span>
                <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Inner Thought</span>
              </div>
              <p className="text-sm text-gray-200 italic leading-relaxed">
                &ldquo;{citizen.thought}&rdquo;
              </p>
            </div>
          </div>
        )}

        {/* Decision Explanation */}
        {citizen.explanation && (
          <div className="bg-gradient-to-br from-purple-900/30 to-purple-900/10 rounded-xl p-4 border border-purple-500/20">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">💬</span>
              <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Decision</span>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
              {citizen.explanation}
            </p>
          </div>
        )}

        {/* Needs */}
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Vital Needs
          </h3>
          <NeedBar label="Hunger" value={citizen.needs.hunger} icon="🍖" />
          <NeedBar label="Energy" value={citizen.needs.energy} icon="⚡" />
          <NeedBar label="Social" value={citizen.needs.social} icon="👥" />
          <NeedBar label="Safety" value={citizen.needs.safety} icon="🛡️" />
        </div>

        {/* Emotions */}
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Emotional State
          </h3>
          <EmotionIndicator label="Happiness" value={citizen.emotions.happiness} color="#fbbf24" />
          <EmotionIndicator label="Sadness" value={citizen.emotions.sadness} color="#60a5fa" />
          <EmotionIndicator label="Anger" value={citizen.emotions.anger} color="#f87171" />
          <EmotionIndicator label="Fear" value={citizen.emotions.fear} color="#a78bfa" />
        </div>

        {/* Thought History */}
        {thoughts && thoughts.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Thought History
            </h3>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {thoughts.map((thought, index) => (
                <div
                  key={index}
                  className="text-xs text-gray-400 bg-gray-800/50 rounded-lg p-2 border border-gray-700/30"
                >
                  {thought}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-800/50 bg-gray-900/50">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>ID: {citizen.id.slice(0, 8)}...</span>
          <span className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
            Active
          </span>
        </div>
      </div>
    </div>
  );
}
