'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { SimulationServerMessage, SimulationSnapshot } from '@eden/core';

export type SimulationConnectionStatus = 'connecting' | 'connected' | 'reconnecting' | 'offline';

function getEndpoints(): { api: string; ws: string } {
  const hostname = window.location.hostname || 'localhost';
  const api = process.env.NEXT_PUBLIC_EDEN_API_URL ?? `http://${hostname}:3000`;
  const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
  const ws = process.env.NEXT_PUBLIC_EDEN_WS_URL ?? `${wsProtocol}://${hostname}:3000/ws`;
  return { api: api.replace(/\/$/, ''), ws };
}

export function useEdenSimulation() {
  const [snapshot, setSnapshot] = useState<SimulationSnapshot | null>(null);
  const [status, setStatus] = useState<SimulationConnectionStatus>('connecting');
  const reconnectAttempt = useRef(0);

  useEffect(() => {
    let socket: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let disposed = false;
    const endpoints = getEndpoints();

    const fetchSnapshot = async () => {
      try {
        const response = await fetch(`${endpoints.api}/api/snapshot`);
        if (response.ok) setSnapshot(await response.json() as SimulationSnapshot);
      } catch {
        // The websocket reconnect loop remains the source of truth for connectivity.
      }
    };

    const connect = () => {
      if (disposed) return;
      setStatus(reconnectAttempt.current === 0 ? 'connecting' : 'reconnecting');
      socket = new WebSocket(endpoints.ws);
      socket.onopen = () => {
        reconnectAttempt.current = 0;
        setStatus('connected');
      };
      socket.onmessage = (event) => {
        const message = JSON.parse(event.data as string) as SimulationServerMessage;
        if (message.type === 'snapshot') setSnapshot(message.data);
      };
      socket.onerror = () => socket?.close();
      socket.onclose = () => {
        if (disposed) return;
        reconnectAttempt.current += 1;
        setStatus('reconnecting');
        const delay = Math.min(1_000 * 2 ** (reconnectAttempt.current - 1), 15_000);
        reconnectTimer = setTimeout(connect, delay);
      };
    };

    void fetchSnapshot();
    connect();
    return () => {
      disposed = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      socket?.close();
    };
  }, []);

  const setRunning = useCallback(async (shouldRun: boolean) => {
    const { api } = getEndpoints();
    try {
      const response = await fetch(`${api}/api/simulation/${shouldRun ? 'resume' : 'pause'}`, { method: 'POST' });
      if (!response.ok) throw new Error(`Server returned ${response.status}`);
      setSnapshot(await response.json() as SimulationSnapshot);
      return true;
    } catch {
      setStatus('offline');
      return false;
    }
  }, []);

  return { snapshot, status, setRunning };
}
