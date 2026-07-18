'use client';

import React, { useMemo, useState, useRef, useEffect } from 'react';
import { ObsidianBrain, Memory, getGraphStats } from '@eden/ai';
import { CitizenMemory, downloadObsidianVault } from '../utils/obsidian-export';

interface KnowledgeGraphProps {
  brain: ObsidianBrain | null;
  citizenName: string;
  citizenColor: string;
  onClose?: () => void;
}

interface GraphNode {
  id: string;
  x: number;
  y: number;
  memory: Memory;
}

const TYPE_COLORS: Record<string, string> = {
  experience: '#3b82f6',
  knowledge: '#22c55e',
  relationship: '#ef4444',
  skill: '#f59e0b',
  emotion: '#a855f7',
  location: '#06b6d4',
};

const TYPE_LABELS: Record<string, string> = {
  experience: 'EXP',
  knowledge: 'KNW',
  relationship: 'REL',
  skill: 'SKL',
  emotion: 'EMO',
  location: 'LOC',
};

function convertToCitizenMemory(memory: Memory): CitizenMemory {
  return {
    id: memory.id,
    title: memory.title,
    type: memory.type as CitizenMemory['type'],
    content: memory.content,
    tags: memory.tags,
    linkedMemories: memory.links,
    importance: memory.importance,
    emotionalWeight: memory.emotionalWeight,
    tick: memory.tick,
    timestamp: memory.timestamp,
  };
}

export function KnowledgeGraph({ brain, citizenName, citizenColor, onClose }: KnowledgeGraphProps) {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });

  const { nodes, edges } = useMemo(() => {
    if (!brain) return { nodes: [], edges: [] };

    const memories = Array.from(brain.memories.values());
    const graphEdges = brain.index.graph;

    if (memories.length === 0) return { nodes: [], edges: [] };

    const nodeMap = new Map<string, GraphNode>();
    const centerX = 300;
    const centerY = 250;

    memories.forEach((memory, i) => {
      const angle = (i / memories.length) * Math.PI * 2;
      const radius = Math.min(150, 50 + memories.length * 5);
      nodeMap.set(memory.id, {
        id: memory.id,
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        memory,
      });
    });

    // Force simulation
    for (let iter = 0; iter < 50; iter++) {
      const nodes = Array.from(nodeMap.values());

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x;
          const dy = nodes[j].y - nodes[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = 1000 / (dist * dist);

          nodes[i].x -= (dx / dist) * force;
          nodes[i].y -= (dy / dist) * force;
          nodes[j].x += (dx / dist) * force;
          nodes[j].y += (dy / dist) * force;
        }
      }

      for (const edge of graphEdges) {
        const from = nodeMap.get(edge.from);
        const to = nodeMap.get(edge.to);
        if (!from || !to) continue;

        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = (dist - 80) * 0.01;

        from.x += (dx / dist) * force;
        from.y += (dy / dist) * force;
        to.x -= (dx / dist) * force;
        to.y -= (dy / dist) * force;
      }

      for (const node of nodes) {
        node.x += (centerX - node.x) * 0.01;
        node.y += (centerY - node.y) * 0.01;
        node.x = Math.max(30, Math.min(570, node.x));
        node.y = Math.max(30, Math.min(470, node.y));
      }
    }

    return {
      nodes: Array.from(nodeMap.values()),
      edges: graphEdges.filter(e => nodeMap.has(e.from) && nodeMap.has(e.to)),
    };
  }, [brain]);

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
    const memories = Array.from(brain.memories.values()).map(convertToCitizenMemory);
    downloadObsidianVault(citizenName, memories);
  };

  if (!brain) {
    return (
      <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="w-96 bg-gray-900 rounded-xl shadow-2xl p-6 text-white text-center">
          <div className="text-4xl mb-4">🧠</div>
          <h2 className="text-lg font-bold mb-2">No Brain Data</h2>
          <p className="text-gray-400 text-sm mb-4">This citizen hasn't formed any memories yet.</p>
          <button onClick={onClose} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm">
            Close
          </button>
        </div>
      </div>
    );
  }

  const stats = getGraphStats(brain);

  return (
    <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="relative w-[700px] h-[600px] bg-gray-900 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-gray-900 to-transparent z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: citizenColor + '30', color: citizenColor }}>
                {citizenName[0]}
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">{citizenName}'s Knowledge Graph</h2>
                <p className="text-xs text-gray-400">{stats.totalMemories} memories • {stats.totalEdges} connections</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleExport}
                className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white text-xs font-medium flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export for Obsidian
              </button>
              <button onClick={onClose} className="text-gray-400 hover:text-white p-2 hover:bg-gray-700/50 rounded-lg">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Graph */}
        <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown} onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} onWheel={handleWheel}>
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>
          <g transform={`translate(${offset.x}, ${offset.y}) scale(${zoom})`}>
            {edges.map((edge, i) => {
              const from = nodes.find(n => n.id === edge.from);
              const to = nodes.find(n => n.id === edge.to);
              if (!from || !to) return null;
              const highlighted = hoveredNode === edge.from || hoveredNode === edge.to;
              return (
                <line key={i} x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                  stroke={highlighted ? '#60a5fa' : '#374151'}
                  strokeWidth={highlighted ? 2 : 1} strokeOpacity={highlighted ? 0.8 : 0.3} />
              );
            })}
            {nodes.map((node) => {
              const color = TYPE_COLORS[node.memory.type] || '#6b7280';
              const isHovered = hoveredNode === node.id;
              const isSelected = selectedNode?.id === node.id;
              const size = 12 + node.memory.importance * 10;
              return (
                <g key={node.id} transform={`translate(${node.x}, ${node.y})`}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={() => setSelectedNode(isSelected ? null : node)}
                  className="cursor-pointer">
                  {isHovered && <circle r={size + 8} fill={color} opacity={0.3} filter="url(#glow)" />}
                  <circle r={size} fill={color} stroke={isSelected ? 'white' : 'transparent'} strokeWidth={2} opacity={0.9} />
                  <circle r={size * 0.6} fill="rgba(255,255,255,0.2)" />
                  <text textAnchor="middle" dy="0.35em" fill="white" fontSize={8} fontWeight="bold">
                    {TYPE_LABELS[node.memory.type]}
                  </text>
                  {isHovered && (
                    <text textAnchor="middle" dy={size + 14} fill="white" fontSize={10} className="pointer-events-none">
                      {node.memory.title.slice(0, 20)}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-gray-800/90 rounded-lg p-3 text-xs">
          <div className="text-gray-400 mb-2 font-medium">Memory Types</div>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(TYPE_COLORS).map(([type, color]) => (
              <div key={type} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-gray-300 capitalize">{type}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="absolute bottom-4 right-4 bg-gray-800/90 rounded-lg p-3 text-xs">
          <div className="text-gray-400 mb-2 font-medium">Stats</div>
          <div className="space-y-1">
            <div className="flex justify-between gap-4">
              <span className="text-gray-400">Density:</span>
              <span className="text-white">{(stats.graphDensity * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-400">Avg. Importance:</span>
              <span className="text-white">{(stats.avgImportance * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>

        {/* Selected Node Details */}
        {selectedNode && (
          <div className="absolute top-20 right-4 w-64 bg-gray-800/95 rounded-lg shadow-xl p-4 text-white text-sm">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-xs font-medium px-2 py-0.5 rounded mb-1"
                  style={{ backgroundColor: TYPE_COLORS[selectedNode.memory.type] + '30', color: TYPE_COLORS[selectedNode.memory.type] }}>
                  {selectedNode.memory.type.toUpperCase()}
                </div>
                <h3 className="font-bold">{selectedNode.memory.title}</h3>
              </div>
              <button onClick={() => setSelectedNode(null)} className="text-gray-400 hover:text-white">×</button>
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
            </div>
            {selectedNode.memory.tags.length > 0 && (
              <div className="mt-3">
                <div className="text-gray-400 mb-1">Tags</div>
                <div className="flex flex-wrap gap-1">
                  {selectedNode.memory.tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 bg-gray-700 rounded text-gray-300">#{tag}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="absolute top-20 left-4 text-xs text-gray-500 space-y-1">
          <p>Click node to see details</p>
          <p>Drag to pan • Scroll to zoom</p>
          <p className="text-cyan-400">Export to open in Obsidian!</p>
        </div>
      </div>
    </div>
  );
}
