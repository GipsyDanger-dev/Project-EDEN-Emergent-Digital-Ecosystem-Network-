'use client';

import { useCallback, useMemo, useState } from 'react';
import type { RuntimeCitizenSnapshot } from '@eden/core';
import { CitizenPanel, NeuralNetwork, TimeDisplay, WorldScene } from '../components';
import { useEdenSimulation } from '../hooks/use-eden-simulation';
import { initSound, soundEngine } from '../utils/sound-engine';
import { toObsidianBrain } from '../utils/runtime-brain-adapter';

type CitizenView = RuntimeCitizenSnapshot & {
  thought?: string;
  explanation?: string;
  history: string[];
};

function eventText(data: Record<string, unknown>, key: string): string | undefined {
  return typeof data[key] === 'string' ? data[key] : undefined;
}

export default function Home() {
  const { snapshot, status, setRunning } = useEdenSimulation();
  const [selectedCitizen, setSelectedCitizen] = useState<string | null>(null);
  const [showNeuralNetwork, setShowNeuralNetwork] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const citizens = useMemo<CitizenView[]>(() => (snapshot?.citizens ?? []).map((citizen) => ({
    ...citizen,
    thought: citizen.brain.lastThought,
    explanation: citizen.brain.lastExplanation,
    history: (snapshot?.recentEvents ?? [])
      .filter((event) => event.citizenId === citizen.id && event.type === 'DecisionMade')
      .slice(-15)
      .reverse()
      .map((event) => `[${event.metadata.tick}] ${eventText(event.data, 'thought') ?? event.type}`),
  })), [snapshot]);

  const selectedCitizenData = citizens.find((citizen) => citizen.id === selectedCitizen) ?? null;
  const neuralCitizen = citizens.find((citizen) => citizen.id === showNeuralNetwork) ?? null;
  const neuralBrain = useMemo(() => neuralCitizen ? toObsidianBrain(neuralCitizen.brain) : null, [neuralCitizen]);
  const isConnected = status === 'connected';
  const isRunning = snapshot?.isRunning ?? false;

  const handleCitizenSelect = useCallback((citizenId: string) => {
    if (soundEnabled) {
      initSound();
      soundEngine.playSelect();
    }
    setSelectedCitizen(citizenId);
  }, [soundEnabled]);

  if (!snapshot) {
    return (
      <main className="eden-world-shell grid h-screen place-items-center bg-[#07100e] text-emerald-50">
        <div className="eden-panel rounded-2xl px-8 py-6 text-center">
          <p className="eden-label">EDEN WORLD LINK</p>
          <p className="mt-3 text-sm text-emerald-50/60">Connecting to the authoritative simulation server…</p>
          <p className="mt-2 font-mono text-[10px] uppercase text-amber-300/70">{status}</p>
        </div>
      </main>
    );
  }

  const wellbeing = citizens.length
    ? Math.round(citizens.reduce((sum, citizen) => sum + citizen.emotions.happiness, 0) / citizens.length)
    : 0;

  return (
    <main className="eden-world-shell relative h-screen w-full overflow-hidden bg-[#07100e] text-emerald-50">
      <WorldScene width={64} height={64} citizens={citizens} resources={snapshot.resources} onCitizenClick={handleCitizenSelect} />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,transparent_30%,rgba(3,10,8,0.34)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#04100d]/80 to-transparent" />

      <header className="pointer-events-none absolute inset-x-5 top-5 z-20 flex items-start justify-between gap-4">
        <div className="eden-panel pointer-events-auto flex h-14 items-center gap-4 rounded-2xl px-4">
          <div className="grid h-8 w-8 place-items-center border-2 border-emerald-300/30 bg-emerald-300/10 font-bold text-emerald-200">E</div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold tracking-[0.22em]">EDEN</h1>
              <span className="rounded-full border border-emerald-300/15 bg-emerald-300/10 px-2 py-0.5 font-mono text-[9px] text-emerald-200/80">SERVER AUTHORITY</span>
            </div>
            <p className="mt-0.5 text-[10px] tracking-[0.08em] text-emerald-100/40">LIVING WORLD OBSERVATORY</p>
          </div>
        </div>

        <div className="eden-panel pointer-events-auto flex h-14 items-center gap-2 rounded-2xl p-2">
          <div className="mr-2 hidden items-center gap-2 px-2 sm:flex">
            <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-300 shadow-[0_0_14px_rgba(110,231,183,0.8)]' : 'bg-amber-300 animate-pulse'}`} />
            <span className="eden-label">{isConnected ? (isRunning ? 'World live' : 'World paused') : status}</span>
          </div>
          {selectedCitizenData && (
            <button type="button" onClick={() => setShowNeuralNetwork(selectedCitizenData.id)} className="eden-button flex h-9 items-center gap-2 px-3 text-xs">
              <span className="text-emerald-300">◉</span><span className="hidden sm:inline">Neural map</span>
            </button>
          )}
          <button type="button" disabled={!isConnected} onClick={() => void setRunning(!isRunning)} className="eden-button grid h-9 min-w-9 place-items-center px-2 text-[9px] disabled:opacity-40" aria-label={isRunning ? 'Pause simulation' : 'Resume simulation'}>{isRunning ? 'II' : 'PLAY'}</button>
          <button type="button" onClick={() => { initSound(); setSoundEnabled((enabled) => !enabled); }} className="eden-button grid h-9 min-w-9 place-items-center px-2 text-[9px]" aria-label={soundEnabled ? 'Mute sound' : 'Enable sound'}>{soundEnabled ? 'SND' : 'MUT'}</button>
        </div>
      </header>

      <aside className="pointer-events-none absolute left-5 top-24 z-10 hidden w-60 space-y-3 lg:block">
        <TimeDisplay time={snapshot.time} stats={{ tick: snapshot.tick, citizenCount: citizens.length, isRunning }} onTogglePause={() => void setRunning(!isRunning)} />
        <div className="eden-panel pointer-events-auto rounded-2xl p-4">
          <div className="mb-3 flex items-center justify-between"><span className="eden-label">Ecosystem pulse</span><span className="font-mono text-[10px] text-emerald-300/60">T+{snapshot.tick.toString().padStart(5, '0')}</span></div>
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-emerald-100/10 bg-emerald-100/10">
            {[
              ['Citizens', citizens.length],
              ['Resources', snapshot.resources.length],
              ['Active', citizens.filter((citizen) => citizen.action !== 'idle').length],
              ['Wellbeing', `${wellbeing}%`],
            ].map(([label, value]) => <div key={label} className="bg-[#091714]/95 px-3 py-3"><div className="text-[10px] text-emerald-50/35">{label}</div><div className="mt-1 font-mono text-lg">{value}</div></div>)}
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between"><span className="eden-label">Canonical brains</span><span className="text-[10px] text-emerald-100/35">Server index</span></div>
            {citizens.map((citizen) => (
              <button type="button" key={citizen.id} onClick={() => handleCitizenSelect(citizen.id)} className="group flex w-full items-center gap-2 rounded-lg px-1 py-1 text-left hover:bg-emerald-100/5">
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: citizen.color }} /><span className="flex-1 text-[11px] text-emerald-50/60 group-hover:text-emerald-50">{citizen.name}</span><span className="font-mono text-[10px] text-emerald-100/35">{citizen.brain.memories.length}</span>
              </button>
            ))}
          </div>
        </div>
      </aside>

      <CitizenPanel citizen={selectedCitizenData} thoughts={selectedCitizenData?.history} onClose={() => setSelectedCitizen(null)} />

      <section className="eden-panel absolute inset-x-5 bottom-5 z-20 h-28 overflow-hidden rounded-2xl">
        <div className="flex h-full">
          <div className="flex w-44 shrink-0 flex-col justify-between border-r border-emerald-100/10 p-4"><div><div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /><span className="eden-label">Event stream</span></div><p className="mt-2 text-[10px] leading-4 text-emerald-50/35">Explainable cognition from canonical citizen brains.</p></div><span className="font-mono text-[9px] text-emerald-200/30">WORLD.EDEN / {status.toUpperCase()}</span></div>
          <div className="grid flex-1 grid-cols-1 gap-px overflow-y-auto bg-emerald-100/5 sm:grid-cols-2">
            {citizens.map((citizen) => citizen.thought && (
              <button type="button" key={citizen.id} onClick={() => handleCitizenSelect(citizen.id)} className="flex min-h-[54px] items-start gap-3 bg-[#081512]/90 px-4 py-3 text-left hover:bg-[#0d211c]">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: citizen.color }} /><span className="min-w-0"><span className="flex items-center gap-2"><span className="text-[11px] font-semibold text-emerald-50/80">{citizen.name}</span><span className="font-mono text-[9px] text-emerald-100/25">#{snapshot.tick.toString().padStart(5, '0')}</span></span><span className="mt-1 block truncate text-[11px] text-emerald-50/40">{citizen.thought}</span></span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="pointer-events-none absolute bottom-36 right-5 z-10 hidden text-right xl:block"><p className="eden-label">64 × 64 WORLD GRID</p><p className="mt-1 text-xs text-emerald-50/55">Drag: orbit · Right drag: pan · Wheel: zoom</p></div>
      {neuralCitizen && <NeuralNetwork brain={neuralBrain} citizenName={neuralCitizen.name} citizenColor={neuralCitizen.color} isThinking={isRunning && isConnected} lastThought={neuralCitizen.thought} onClose={() => setShowNeuralNetwork(null)} />}
    </main>
  );
}
