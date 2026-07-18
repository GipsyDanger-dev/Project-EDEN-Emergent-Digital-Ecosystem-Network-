'use client';

import React, { useMemo, useState, useRef, useEffect } from 'react';
import { ObsidianBrain, Memory, getGraphStats } from '@eden/ai';
import { CitizenMemory, downloadObsidianVault } from '../utils/obsidian-export';

interface NeuralNetworkProps {
  brain: ObsidianBrain | null;
  citizenName: string;
  citizenColor: string;
  isThinking: boolean;
  lastThought?: string;
  onClose?: () => void;
}

interface GraphNode {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  memory: Memory;
  isNew: boolean;
  pulsePhase: number;
}

interface GraphEdge {
  from: string;
  to: string;
  strength: number;
  isNew: boolean;
}

const TYPE_COLORS: Record<string, string> = {
  experience: '#3b82f6',
  knowledge: '#22c55e',
  relationship: '#ef4444',
  skill: '#f59e0b',
  emotion: '#a855f7',
  location: '#06b6d4',
};

export function NeuralNetwork({
  brain,
  citizenName,
  citizenColor,
  isThinking,
  lastThought,
  onClose,
}: NeuralNetworkProps) {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [animationFrame, setAnimationFrame] = useState(0);
  const svgRef = useRef<SVGSVGElement>(null);
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const prevMemoryCount = useRef(0);

  // Animation loop
  useEffect(() => {
    let frame: number;
    const animate = () => {
      setAnimationFrame(prev => prev + 1);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  // Detect new memories
  const newMemoryDetected = useMemo(() => {
    if (!brain) return false;
    const currentCount = brain.memories.size;
    if (currentCount > prevMemoryCount.current) {
      prevMemoryCount.current = currentCount;
      return true;
    }
    return false;
  }, [brain?.memories.size]);

  // Force-directed layout with physics
  const { nodes, edges } = useMemo(() => {
    if (!brain) return { nodes: [], edges: [] };

    const memories = Array.from(brain.memories.values());
    const graphEdges = brain.index.graph;

    if (memories.length === 0) return { nodes: [], edges: [] };

    const nodeMap = new Map<string, GraphNode>();
    const centerX = 350;
    const centerY = 280;

    // Initialize nodes with spiral layout for density
    memories.forEach((memory, i) => {
      const existing = nodeMap.get(memory.id);
      if (existing) {
        existing.memory = memory;
        return;
      }

      // Spiral layout for organic look
      const goldenAngle = Math.PI * (3 - Math.sqrt(5));
      const angle = i * goldenAngle;
      const radius = Math.sqrt(i) * 8;

      nodeMap.set(memory.id, {
        id: memory.id,
        x: centerX + Math.cos(angle) * radius + (Math.random() - 0.5) * 10,
        y: centerY + Math.sin(angle) * radius + (Math.random() - 0.5) * 10,
        vx: 0,
        vy: 0,
        memory,
        isNew: Date.now() - memory.timestamp < 5000,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    });

    // Physics simulation
    const nodes = Array.from(nodeMap.values());

    // Fewer iterations for performance with many nodes
    const iterations = nodes.length > 100 ? 15 : 30;

    for (let iter = 0; iter < iterations; iter++) {
      // Repulsion (skip some pairs for performance)
      const skip = nodes.length > 150 ? 3 : 1;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + skip; j < nodes.length; j += skip) {
          const dx = nodes[j].x - nodes[i].x;
          const dy = nodes[j].y - nodes[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = 500 / (dist * dist);

          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;

          nodes[i].vx -= fx;
          nodes[i].vy -= fy;
          nodes[j].vx += fx;
          nodes[j].vy += fy;
        }
      }

      // Attraction along edges
      for (const edge of graphEdges.slice(0, 500)) {
        const from = nodeMap.get(edge.from);
        const to = nodeMap.get(edge.to);
        if (!from || !to) continue;

        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = (dist - 40) * 0.01;

        from.vx += (dx / dist) * force;
        from.vy += (dy / dist) * force;
        to.vx -= (dx / dist) * force;
        to.vy -= (dy / dist) * force;
      }

      // Center gravity + apply velocity
      for (const node of nodes) {
        node.vx += (centerX - node.x) * 0.008;
        node.vy += (centerY - node.y) * 0.008;

        // Damping
        node.vx *= 0.8;
        node.vy *= 0.8;

        // Apply velocity
        node.x += node.vx;
        node.y += node.vy;

        // Bounds
        node.x = Math.max(40, Math.min(660, node.x));
        node.y = Math.max(40, Math.min(520, node.y));
      }
    }

    const validEdges = graphEdges
      .filter(e => nodeMap.has(e.from) && nodeMap.has(e.to))
      .map(e => ({
        ...e,
        isNew: false,
      }));

    return { nodes, edges: validEdges };
  }, [brain, animationFrame]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === svgRef.current) {
      isDragging.current = true;
      lastMouse.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging.current) {
      setOffset(prev => ({
        x: prev.x + (e.clientX - lastMouse.current.x),
        y: prev.y + (e.clientY - lastMouse.current.y),
      }));
      lastMouse.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(prev => Math.max(0.3, Math.min(3, prev * (e.deltaY > 0 ? 0.9 : 1.1))));
  };

  const handleExport = () => {
    if (!brain) return;
    const memories = Array.from(brain.memories.values()).map(m => ({
      id: m.id,
      title: m.title,
      type: m.type as CitizenMemory['type'],
      content: m.content,
      tags: m.tags,
      linkedMemories: m.links,
      importance: m.importance,
      emotionalWeight: m.emotionalWeight,
      tick: m.tick,
      timestamp: m.timestamp,
    }));
    downloadObsidianVault(citizenName, memories);
  };

  if (!brain) {
    return (
      <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="w-96 bg-gray-900 rounded-xl shadow-2xl p-6 text-white text-center">
          <div className="text-4xl mb-4">🧠</div>
          <h2 className="text-lg font-bold mb-2">Neural Network Empty</h2>
          <p className="text-gray-400 text-sm mb-4">Waiting for memories to form...</p>
          <button onClick={onClose} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm">
            Close
          </button>
        </div>
      </div>
    );
  }

  const stats = getGraphStats(brain);

  return (
    <div className="absolute inset-0 bg-black/85 flex items-center justify-center z-50">
      <div className="relative w-[750px] h-[620px] bg-gray-900 rounded-xl shadow-2xl overflow-hidden border border-gray-700">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-gray-900 via-gray-900/95 to-transparent z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                  style={{ backgroundColor: citizenColor + '30', color: citizenColor }}>
                  {citizenName[0]}
                </div>
                {isThinking && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-500 rounded-full animate-ping" />
                )}
              </div>
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  {citizenName}'s Neural Network
                  {isThinking && (
                    <span className="text-xs px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded-full animate-pulse">
                      THINKING
                    </span>
                  )}
                </h2>
                <p className="text-xs text-gray-400">
                  {stats.totalMemories} neurons • {stats.totalEdges} synapses
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleExport}
                className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white text-xs font-medium flex items-center gap-1 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export
              </button>
              <button onClick={onClose} className="text-gray-400 hover:text-white p-2 hover:bg-gray-700/50 rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Last thought */}
          {lastThought && (
            <div className="mt-3 px-3 py-2 bg-gray-800/80 rounded-lg border border-gray-700/50">
              <div className="flex items-center gap-2">
                <span className="text-xs text-cyan-400 font-medium">LATEST THOUGHT:</span>
              </div>
              <p className="text-xs text-gray-300 mt-1 italic">"{lastThought}"</p>
            </div>
          )}
        </div>

        {/* Neural Network Visualization */}
        <svg ref={svgRef} className="w-full h-full"
          style={{ background: 'radial-gradient(circle at center, #1a1a2e 0%, #0f0f1a 100%)' }}
          onMouseDown={handleMouseDown} onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} onWheel={handleWheel}>
          <defs>
            <filter id="neuralGlow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <filter id="pulseGlow">
              <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <radialGradient id="nodeGradient">
              <stop offset="0%" stopColor="white" stopOpacity="0.4"/>
              <stop offset="100%" stopColor="white" stopOpacity="0"/>
            </radialGradient>
          </defs>

          <g transform={`translate(${offset.x}, ${offset.y}) scale(${zoom})`}>
            {/* Edges (synapses) */}
            {edges.map((edge, i) => {
              const from = nodes.find(n => n.id === edge.from);
              const to = nodes.find(n => n.id === edge.to);
              if (!from || !to) return null;

              const isHighlighted = hoveredNode === edge.from || hoveredNode === edge.to;
              const pulse = Math.sin((animationFrame + i * 10) * 0.05) * 0.2 + 0.5;

              return (
                <g key={`edge-${i}`}>
                  {/* Glow line */}
                  {isHighlighted && (
                    <line x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                      stroke="#60a5fa" strokeWidth={4} strokeOpacity={0.3} filter="url(#neuralGlow)" />
                  )}
                  {/* Main line */}
                  <line x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                    stroke={isHighlighted ? '#60a5fa' : '#4b5563'}
                    strokeWidth={isHighlighted ? 2 : 1}
                    strokeOpacity={isHighlighted ? 0.9 : pulse * 0.4} />
                  {/* Signal pulse animation */}
                  {isThinking && (
                    <circle r={2} fill="#22d3ee" opacity={0.8}>
                      <animateMotion dur="2s" repeatCount="indefinite"
                        path={`M${from.x},${from.y} L${to.x},${to.y}`} />
                    </circle>
                  )}
                </g>
              );
            })}

            {/* Nodes (neurons) */}
            {nodes.map((node) => {
              const color = TYPE_COLORS[node.memory.type] || '#6b7280';
              const isHovered = hoveredNode === node.id;
              const isSelected = selectedNode?.id === node.id;
              // Smaller nodes when many
              const baseSize = nodes.length > 100 ? 6 : nodes.length > 50 ? 8 : 14;
              const size = baseSize + node.memory.importance * 4;
              const pulse = Math.sin((animationFrame + node.pulsePhase * 100) * 0.03) * 0.1 + 1;
              const breathe = isThinking ? Math.sin(animationFrame * 0.1 + node.pulsePhase) * 1 : 0;

              return (
                <g key={node.id} transform={`translate(${node.x}, ${node.y})`}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={() => setSelectedNode(isSelected ? null : node)}
                  className="cursor-pointer">

                  {/* Outer glow */}
                  {isHovered && (
                    <circle r={size + 12} fill={color} opacity={0.2} filter="url(#pulseGlow)" />
                  )}

                  {/* Pulse ring for new memories */}
                  {node.isNew && (
                    <circle r={size + 6} fill="none" stroke={color} strokeWidth={2} opacity={0.5}>
                      <animate attributeName="r" from={size} to={size + 20} dur="1.5s" repeatCount="indefinite" />
                      <animate attributeName="opacity" from="0.6" to="0" dur="1.5s" repeatCount="indefinite" />
                    </circle>
                  )}

                  {/* Main neuron body */}
                  <circle r={size * pulse + breathe} fill={color}
                    stroke={isSelected ? 'white' : isHovered ? color : 'transparent'}
                    strokeWidth={isSelected ? 3 : 2}
                    opacity={0.85}
                    filter={isHovered ? 'url(#neuralGlow)' : undefined} />

                  {/* Inner highlight */}
                  <circle r={size * 0.5} fill="url(#nodeGradient)" />

                  {/* Type label */}
                  <text textAnchor="middle" dy="0.35em" fill="white" fontSize={9} fontWeight="bold"
                    style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                    {node.memory.type.slice(0, 3).toUpperCase()}
                  </text>

                  {/* Title on hover */}
                  {isHovered && (
                    <g>
                      <rect x={-60} y={size + 8} width={120} height={24} rx={4}
                        fill="rgba(0,0,0,0.8)" stroke={color} strokeWidth={1} />
                      <text textAnchor="middle" y={size + 24} fill="white" fontSize={10} fontWeight="medium">
                        {node.memory.title.slice(0, 18)}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* Thinking indicator */}
            {isThinking && (
              <g transform="translate(350, 280)">
                <circle r={30} fill="none" stroke="#22d3ee" strokeWidth={2} strokeDasharray="10 5" opacity={0.5}>
                  <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="3s" repeatCount="indefinite" />
                </circle>
                <circle r={50} fill="none" stroke="#22d3ee" strokeWidth={1} strokeDasharray="5 10" opacity={0.3}>
                  <animateTransform attributeName="transform" type="rotate" from="360" to="0" dur="4s" repeatCount="indefinite" />
                </circle>
              </g>
            )}
          </g>
        </svg>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-gray-800/95 rounded-lg p-3 text-xs border border-gray-700">
          <div className="text-gray-400 mb-2 font-medium">Neuron Types</div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {Object.entries(TYPE_COLORS).map(([type, color]) => (
              <div key={type} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-gray-300 capitalize">{type}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="absolute bottom-4 right-4 bg-gray-800/95 rounded-lg p-3 text-xs border border-gray-700">
          <div className="text-gray-400 mb-2 font-medium">Network Stats</div>
          <div className="space-y-1">
            <div className="flex justify-between gap-4">
              <span className="text-gray-400">Neurons:</span>
              <span className="text-cyan-400 font-mono">{stats.totalMemories}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-400">Synapses:</span>
              <span className="text-cyan-400 font-mono">{stats.totalEdges}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-400">Density:</span>
              <span className="text-cyan-400 font-mono">{(stats.graphDensity * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Selected Node Details */}
        {selectedNode && (
          <div className="absolute top-24 right-4 w-72 bg-gray-800/98 rounded-xl shadow-2xl p-4 text-white text-sm border border-gray-700">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-xs font-medium px-2 py-0.5 rounded mb-1 inline-block"
                  style={{ backgroundColor: TYPE_COLORS[selectedNode.memory.type] + '30', color: TYPE_COLORS[selectedNode.memory.type] }}>
                  {selectedNode.memory.type.toUpperCase()}
                </div>
                <h3 className="font-bold text-base">{selectedNode.memory.title}</h3>
              </div>
              <button onClick={() => setSelectedNode(null)} className="text-gray-400 hover:text-white p-1">×</button>
            </div>
            <p className="text-gray-300 text-xs mb-3 leading-relaxed">{selectedNode.memory.content}</p>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Importance</span>
                <span className="text-white">{(selectedNode.memory.importance * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Emotional Weight</span>
                <span className={selectedNode.memory.emotionalWeight >= 0 ? 'text-green-400' : 'text-red-400'}>
                  {selectedNode.memory.emotionalWeight >= 0 ? '+' : ''}{(selectedNode.memory.emotionalWeight * 100).toFixed(0)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Connections</span>
                <span className="text-white">{selectedNode.memory.links.length}</span>
              </div>
            </div>
            {selectedNode.memory.tags.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-700">
                <div className="text-gray-400 mb-1">Tags</div>
                <div className="flex flex-wrap gap-1">
                  {selectedNode.memory.tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 bg-gray-700 rounded text-gray-300 text-xs">#{tag}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="absolute top-24 left-4 text-xs text-gray-500 space-y-1">
          <p>Click neuron to inspect</p>
          <p>Drag to pan • Scroll to zoom</p>
          {isThinking && <p className="text-cyan-400 animate-pulse">⚡ Signals propagating...</p>}
        </div>
      </div>
    </div>
  );
}
