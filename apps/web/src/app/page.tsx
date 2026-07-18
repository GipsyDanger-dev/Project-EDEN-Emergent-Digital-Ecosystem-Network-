'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { WorldScene, CitizenPanel, TimeDisplay, NeuralNetwork } from '../components';
import { soundEngine, initSound } from '../utils/sound-engine';
import {
  createObsidianBrain,
  addMemory,
  ObsidianBrain,
  Memory,
  getGraphStats,
} from '@eden/ai';
import {
  createAdvancedBrain,
  thinkAdvanced,
  AdvancedBrainState,
  BrainDecision,
  getPersonalityDescription,
} from '../utils/advanced-brain';

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
  action?: string;
  explanation?: string;
  emotionalResponse?: string;
  personalityInfluence?: string;
  confidence?: number;
  lastDecision?: string;
  history: string[];
  brain?: ObsidianBrain;
  advancedBrain?: AdvancedBrainState;
  personalityDescription?: string;
}

const INITIAL_CITIZENS: CitizenState[] = [
  {
    id: '1',
    name: 'Aria',
    position: [2, 0.5, 2],
    color: '#ef4444',
    age: 28,
    gender: 'female',
    needs: { hunger: 72, energy: 85, social: 45, safety: 68 },
    emotions: { happiness: 25, sadness: -8, anger: 3, fear: -2 },
    history: [],
  },
  {
    id: '2',
    name: 'Marcus',
    position: [-3, 0.5, 4],
    color: '#3b82f6',
    age: 34,
    gender: 'male',
    needs: { hunger: 55, energy: 62, social: 78, safety: 82 },
    emotions: { happiness: 35, sadness: -5, anger: -8, fear: 0 },
    history: [],
  },
  {
    id: '3',
    name: 'Luna',
    position: [5, 0.5, -2],
    color: '#22c55e',
    age: 24,
    gender: 'female',
    needs: { hunger: 88, energy: 42, social: 28, safety: 71 },
    emotions: { happiness: 12, sadness: 8, anger: -3, fear: 15 },
    history: [],
  },
  {
    id: '4',
    name: 'Orion',
    position: [-5, 0.5, -3],
    color: '#f59e0b',
    age: 31,
    gender: 'male',
    needs: { hunger: 65, energy: 78, social: 55, safety: 90 },
    emotions: { happiness: 40, sadness: -12, anger: -5, fear: -8 },
    history: [],
  },
];

const MOCK_RESOURCES = [
  { id: 'r1', type: 'food', position: [5, 0.2, 3] as [number, number, number], amount: 100 },
  { id: 'r2', type: 'water', position: [-4, 0.2, -2] as [number, number, number], amount: 150 },
  { id: 'r3', type: 'wood', position: [3, 0.2, -4] as [number, number, number], amount: 80 },
  { id: 'r4', type: 'stone', position: [-6, 0.2, 5] as [number, number, number], amount: 120 },
  { id: 'r5', type: 'food', position: [7, 0.2, -5] as [number, number, number], amount: 90 },
];

// Advanced local brain simulation with Obsidian brain integration
function simulateBrain(
  citizen: CitizenState,
  tick: number,
  allCitizens: CitizenState[]
): {
  thought: string;
  action: string;
  explanation: string;
  brain: ObsidianBrain;
} {
  // Initialize brain if not exists
  let brain = citizen.brain || createObsidianBrain(citizen.id);

  const needs = citizen.needs;
  const mostUrgent = Object.entries(needs)
    .sort(([, a], [, b]) => a - b)[0];

  const [needName, needValue] = mostUrgent;

  // Find nearby citizens
  const nearbyCitizens = allCitizens
    .filter(c => c.id !== citizen.id)
    .map(c => ({
      ...c,
      distance: Math.sqrt(
        Math.pow(c.position[0] - citizen.position[0], 2) +
        Math.pow(c.position[2] - citizen.position[2], 2)
      ),
    }))
    .filter(c => c.distance < 10)
    .sort((a, b) => a.distance - b.distance);

  let thought = '';
  let action = 'idle';
  let explanation = '';

  // Complex decision making
  if (needValue < 25) {
    // Critical need
    const actions: Record<string, string> = {
      hunger: 'find_food',
      energy: 'find_rest',
      social: 'find_companion',
      safety: 'find_shelter',
    };

    const thoughts: Record<string, string> = {
      hunger: `I'm starving! My hunger is at ${Math.round(needValue)}%. I need to find food immediately or I'll collapse.`,
      energy: `I can barely keep my eyes open. Energy at ${Math.round(needValue)}%. I must rest now.`,
      social: `I feel so alone... Social need at ${Math.round(needValue)}%. I need to talk to someone.`,
      safety: `Something feels wrong. Safety at ${Math.round(needValue)}%. I need to find shelter.`,
    };

    thought = thoughts[needName];
    action = actions[needName];
    explanation = `Critical ${needName} detected (${Math.round(needValue)}%). Taking immediate action: ${action}.`;

    // Create memory of critical state
    brain = addMemory(brain, {
      type: 'emotion',
      title: `Critical ${needName}`,
      content: `Experience critical ${needName} at ${Math.round(needValue)}%. This was painful and I must avoid this in the future.`,
      tags: [needName, 'critical', 'survival'],
      links: [],
      importance: 0.9,
      emotionalWeight: -0.8,
      tick,
      source: 'need_monitor',
    });
  } else if (needValue < 50) {
    // Moderate need - consider context
    if (nearbyCitizens.length > 0 && needName === 'social') {
      const target = nearbyCitizens[0];
      thought = `I see ${target.name} nearby (${target.distance.toFixed(1)}m away). Maybe I should talk to them.`;
      action = 'approach_citizen';
      explanation = `Social need at ${Math.round(needValue)}%. ${target.name} is nearby. Initiating social contact.`;

      // Create memory of seeing citizen
      brain = addMemory(brain, {
        type: 'relationship',
        title: `Saw ${target.name}`,
        content: `Spotted ${target.name} at distance ${target.distance.toFixed(1)}m. They seem to be ${target.action || 'idle'}.`,
        tags: [target.name, 'social', 'observation'],
        links: [],
        importance: 0.5,
        emotionalWeight: 0.3,
        tick,
        source: 'perception',
      });
    } else if (needName === 'hunger') {
      thought = `Getting hungry. Hunger at ${Math.round(needValue)}%. I should look for food sources.`;
      action = 'search_food';
      explanation = `Hunger rising to ${Math.round(needValue)}%. Scanning environment for food.`;
    } else {
      thought = `My ${needName} is declining (${Math.round(needValue)}%). I should address this soon.`;
      action = `monitor_${needName}`;
      explanation = `${needName} at ${Math.round(needValue)}%. Monitoring situation.`;
    }
  } else {
    // All needs satisfied - explore or socialize
    if (nearbyCitizens.length > 0 && Math.random() > 0.5) {
      const target = nearbyCitizens[0];
      const socialThoughts = [
        `${target.name} looks interesting. Maybe I should introduce myself.`,
        `I wonder what ${target.name} is thinking about.`,
        `It would be nice to have a conversation with ${target.name}.`,
      ];
      thought = socialThoughts[tick % socialThoughts.length];
      action = 'socialize';
      explanation = `All needs stable. Social opportunity detected with ${target.name}.`;
    } else {
      const exploreThoughts = [
        `Everything looks peaceful. I wonder what's beyond that hill.`,
        `The weather is nice today. Perfect for exploring.`,
        `I feel content. Maybe I'll take a walk.`,
        `This is a good time to gather my thoughts.`,
      ];
      thought = exploreThoughts[tick % exploreThoughts.length];
      action = 'explore';
      explanation = `All needs satisfied. Engaging in exploration.`;

      // Create exploration memory
      brain = addMemory(brain, {
        type: 'experience',
        title: 'Exploration',
        content: `Explored the area while feeling content. Weather was nice.`,
        tags: ['exploration', 'positive', 'environment'],
        links: [],
        importance: 0.3,
        emotionalWeight: 0.4,
        tick,
        source: 'exploration',
      });
    }
  }

  return { thought, action, explanation, brain };
}

function simulateNeedsUpdate(citizen: CitizenState): CitizenState {
  // Non-linear decay based on personality
  const decayModifiers = {
    hunger: citizen.needs.hunger < 30 ? 0.8 : 1.2,
    energy: citizen.needs.energy < 30 ? 0.7 : 1.1,
    social: citizen.needs.social < 30 ? 0.6 : 1.0,
    safety: citizen.needs.safety < 30 ? 0.5 : 1.0,
  };

  return {
    ...citizen,
    needs: {
      hunger: Math.max(0, citizen.needs.hunger - 0.4 * decayModifiers.hunger),
      energy: Math.max(0, citizen.needs.energy - 0.25 * decayModifiers.energy),
      social: Math.max(0, citizen.needs.social - 0.15 * decayModifiers.social),
      safety: Math.max(0, citizen.needs.safety - 0.1 * decayModifiers.safety),
    },
  };
}

function simulateMovement(citizen: CitizenState, action: string): CitizenState {
  let speed = 0.3;
  let targetX = citizen.position[0];
  let targetZ = citizen.position[2];

  switch (action) {
    case 'find_food':
    case 'search_food':
      // Move towards food resources
      const foodResources = MOCK_RESOURCES.filter(r => r.type === 'food');
      if (foodResources.length > 0) {
        const closest = foodResources[0];
        targetX = closest.position[0];
        targetZ = closest.position[2];
        speed = 0.5;
      }
      break;
    case 'approach_citizen':
    case 'socialize':
      // Random movement towards center
      targetX = citizen.position[0] + (Math.random() - 0.5) * 2;
      targetZ = citizen.position[2] + (Math.random() - 0.5) * 2;
      speed = 0.4;
      break;
    case 'explore':
      // Random exploration
      targetX = citizen.position[0] + (Math.random() - 0.5) * 3;
      targetZ = citizen.position[2] + (Math.random() - 0.5) * 3;
      speed = 0.2;
      break;
    default:
      // Slight random movement
      targetX = citizen.position[0] + (Math.random() - 0.5) * 0.5;
      targetZ = citizen.position[2] + (Math.random() - 0.5) * 0.5;
      speed = 0.1;
  }

  // Move towards target
  const dx = targetX - citizen.position[0];
  const dz = targetZ - citizen.position[2];
  const dist = Math.sqrt(dx * dx + dz * dz);

  let newX = citizen.position[0];
  let newZ = citizen.position[2];

  if (dist > 0.1) {
    newX = citizen.position[0] + (dx / dist) * speed;
    newZ = citizen.position[2] + (dz / dist) * speed;
  }

  // Keep within bounds
  newX = Math.max(-9, Math.min(9, newX));
  newZ = Math.max(-9, Math.min(9, newZ));

  return {
    ...citizen,
    position: [newX, 0.5, newZ],
  };
}

function simulateEmotions(citizen: CitizenState): CitizenState {
  const { needs } = citizen;

  // Calculate emotions based on needs
  const happiness = ((needs.hunger + needs.energy + needs.social + needs.safety) / 4 - 50) * 0.8;
  const sadness = (50 - (needs.hunger + needs.energy + needs.social + needs.safety) / 4) * 0.5;
  const anger = needs.safety < 30 ? 20 : needs.social < 20 ? 10 : 0;
  const fear = needs.safety < 25 ? 30 : needs.safety < 40 ? 10 : -5;

  return {
    ...citizen,
    emotions: {
      happiness: Math.max(-100, Math.min(100, happiness)),
      sadness: Math.max(-100, Math.min(100, sadness)),
      anger: Math.max(-100, Math.min(100, anger)),
      fear: Math.max(-100, Math.min(100, fear)),
    },
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
  const [selectedCitizenThoughts, setSelectedCitizenThoughts] = useState<string[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showNeuralNetwork, setShowNeuralNetwork] = useState<string | null>(null);
  const [isCitizenThinking, setIsCitizenThinking] = useState(false);

  // Initialize sound on first interaction
  const handleFirstInteraction = useCallback(() => {
    initSound();
    document.removeEventListener('click', handleFirstInteraction);
  }, []);

  useEffect(() => {
    document.addEventListener('click', handleFirstInteraction);
    return () => document.removeEventListener('click', handleFirstInteraction);
  }, [handleFirstInteraction]);

  // Play sound when citizen is selected
  const handleCitizenSelect = useCallback((citizenId: string) => {
    if (soundEnabled) {
      initSound();
      soundEngine.playSelect();
    }
    setSelectedCitizen(citizenId);
  }, [soundEnabled]);

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
      setCitizens(prev => {
        // Set thinking state
        if (tick % 2 === 0) {
          setIsCitizenThinking(true);
          setTimeout(() => setIsCitizenThinking(false), 500);
        }

        const updated = prev.map(citizen => {
          // Update needs
          let updatedCitizen = simulateNeedsUpdate(citizen);

          // Initialize advanced brain if not exists
          let advancedBrain = citizen.advancedBrain || createAdvancedBrain();
          let thought = citizen.thought;
          let action = citizen.action || 'idle';
          let explanation = citizen.explanation;
          let brain = citizen.brain;
          let emotionalResponse = citizen.emotionalResponse;
          let personalityInfluence = citizen.personalityInfluence;
          let confidence = citizen.confidence;

          // Simulate brain every 2 ticks
          if (tick % 2 === 0) {
            // Build environment for advanced brain
            const nearbyCitizens = prev
              .filter(c => c.id !== citizen.id)
              .map(c => ({
                id: c.id,
                name: c.name,
                distance: Math.sqrt(
                  Math.pow(c.position[0] - citizen.position[0], 2) +
                  Math.pow(c.position[2] - citizen.position[2], 2)
                ),
                action: c.action || 'idle',
              }))
              .filter(c => c.distance < 10)
              .sort((a, b) => a.distance - b.distance);

            const nearbyResources = MOCK_RESOURCES
              .map(r => ({
                type: r.type,
                amount: r.amount,
                distance: Math.sqrt(
                  Math.pow(r.position[0] - citizen.position[0], 2) +
                  Math.pow(r.position[2] - citizen.position[2], 2)
                ),
              }))
              .filter(r => r.distance < 10);

            // Use advanced brain
            const brainResult = thinkAdvanced(
              advancedBrain,
              updatedCitizen.needs,
              {
                nearbyCitizens,
                nearbyResources,
                timeOfDay: getTimeOfDayName(time.timeOfDay),
                season: time.season,
              },
              tick
            );

            thought = brainResult.decision.thought;
            action = brainResult.decision.action;
            explanation = brainResult.decision.explanation;
            emotionalResponse = brainResult.decision.emotionalResponse;
            personalityInfluence = brainResult.decision.personalityInfluence;
            confidence = brainResult.decision.confidence;
            advancedBrain = brainResult.updatedBrain;

            // Also update obsidian brain
            const brainResult2 = simulateBrain(updatedCitizen, tick, prev);
            brain = brainResult2.brain;

            // Play sound based on action
            if (soundEnabled && action !== citizen.action) {
              switch (action) {
                case 'socialize':
                case 'approach_citizen':
                  soundEngine.playCitizenTalk();
                  break;
                case 'find_food':
                case 'search_food':
                case 'search_food_systematic':
                case 'explore_food':
                  soundEngine.playEat();
                  break;
                case 'find_rest':
                  soundEngine.playSleep();
                  break;
                case 'explore':
                  soundEngine.playCitizenMove();
                  break;
                case 'find_shelter':
                  soundEngine.playAlert();
                  break;
              }
            }

            // Update history
            const history = [...citizen.history];
            if (thought) {
              history.unshift(`[${tick}] ${thought}`);
              if (history.length > 15) history.pop();
            }

            updatedCitizen = {
              ...updatedCitizen,
              thought,
              action,
              explanation,
              emotionalResponse,
              personalityInfluence,
              confidence,
              history,
              brain,
              advancedBrain,
              personalityDescription: getPersonalityDescription(advancedBrain.personality),
            };
          }

          // Move citizen
          const moved = simulateMovement(updatedCitizen, action);

          // Update emotions
          const withEmotions = simulateEmotions(moved);

          return withEmotions;
        });

        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, tick]);

  // Update selected citizen thoughts
  useEffect(() => {
    if (selectedCitizen) {
      const citizen = citizens.find(c => c.id === selectedCitizen);
      if (citizen) {
        setSelectedCitizenThoughts(citizen.history);
      }
    }
  }, [selectedCitizen, citizens]);

  const selectedCitizenData = selectedCitizen
    ? citizens.find((c) => c.id === selectedCitizen) || null
    : null;

  return (
    <main className="relative w-full h-screen bg-gray-950 overflow-hidden">
      {/* 3D World */}
      <WorldScene
        width={20}
        height={20}
        citizens={citizens}
        resources={MOCK_RESOURCES}
        onCitizenClick={handleCitizenSelect}
      />

      {/* Time Display - Top Left */}
      <TimeDisplay
        time={time}
        stats={{
          tick,
          citizenCount: citizens.length,
          isRunning,
        }}
        onTogglePause={() => setIsRunning(!isRunning)}
      />

      {/* Citizen Panel - Right Side */}
      <CitizenPanel
        citizen={selectedCitizenData}
        thoughts={selectedCitizenThoughts}
        onClose={() => setSelectedCitizen(null)}
      />

      {/* Bottom Bar - Events Log */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gray-900/95 border-t border-gray-800 overflow-hidden">
        <div className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">Event Stream</span>
          </div>
          <div className="h-20 overflow-y-auto font-mono text-xs space-y-1">
            {citizens.map(citizen => (
              citizen.thought && (
                <div key={citizen.id} className="flex items-start gap-2">
                  <span className="text-gray-500">[{tick}]</span>
                  <span style={{ color: citizen.color }} className="font-semibold">{citizen.name}:</span>
                  <span className="text-gray-300">{citizen.thought}</span>
                </div>
              )
            ))}
          </div>
        </div>
      </div>

      {/* Side Panel - World Stats */}
      <div className="absolute left-4 bottom-36 w-48 bg-gray-900/95 rounded-lg shadow-xl p-3 text-white">
        <h3 className="text-xs font-mono text-gray-400 uppercase tracking-wider mb-2">World Stats</h3>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-400">Citizens</span>
            <span className="text-white">{citizens.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Resources</span>
            <span className="text-white">{MOCK_RESOURCES.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Active Goals</span>
            <span className="text-white">{citizens.filter(c => c.action && c.action !== 'idle').length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Avg. Happiness</span>
            <span className="text-white">
              {Math.round(citizens.reduce((sum, c) => sum + c.emotions.happiness, 0) / citizens.length)}
            </span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-700">
          <h3 className="text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2">🧠 Knowledge Graph</h3>
          <div className="space-y-1 text-xs">
            {citizens.map(c => {
              const memCount = c.brain?.memories.size || 0;
              return (
                <div key={c.id} className="flex justify-between">
                  <span style={{ color: c.color }}>{c.name}</span>
                  <span className="text-gray-400">{memCount} memories</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute right-4 bottom-36 bg-gray-900/95 rounded-lg shadow-xl p-3 text-white">
        <div className="flex gap-2">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`px-3 py-1.5 rounded text-xs font-medium ${
              isRunning
                ? 'bg-yellow-600 hover:bg-yellow-700'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isRunning ? 'Pause' : 'Resume'}
          </button>
          <button
            onClick={() => {
              initSound();
              setSoundEnabled(!soundEnabled);
              if (!soundEnabled) {
                soundEngine.playSuccess();
              }
            }}
            className={`px-3 py-1.5 rounded text-xs font-medium ${
              soundEnabled
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-600 hover:bg-gray-500'
            }`}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>
          <button
            onClick={() => {
              setTick(0);
              setTime({ timeOfDay: 600, day: 1, season: 'spring', year: 1 });
              setCitizens(INITIAL_CITIZENS);
            }}
            className="px-3 py-1.5 rounded text-xs font-medium bg-gray-700 hover:bg-gray-600"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Keyboard Hints */}
      <div className="absolute top-4 right-4 text-xs text-gray-500 space-y-1">
        <p>Click citizen to view thoughts</p>
        <p>Drag to rotate • Scroll to zoom</p>
      </div>

      {/* Neural Network Button */}
      {selectedCitizen && selectedCitizenData?.brain && (
        <button
          onClick={() => setShowNeuralNetwork(selectedCitizen)}
          className="absolute left-4 top-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white text-sm font-medium flex items-center gap-2 shadow-lg"
        >
          <span>🧠</span>
          Neural Network
        </button>
      )}

      {/* Neural Network Modal */}
      {showNeuralNetwork && (
        <NeuralNetwork
          brain={citizens.find(c => c.id === showNeuralNetwork)?.brain || null}
          citizenName={citizens.find(c => c.id === showNeuralNetwork)?.name || ''}
          citizenColor={citizens.find(c => c.id === showNeuralNetwork)?.color || '#6b7280'}
          isThinking={isCitizenThinking}
          lastThought={citizens.find(c => c.id === showNeuralNetwork)?.thought}
          onClose={() => setShowNeuralNetwork(null)}
        />
      )}
    </main>
  );
}
