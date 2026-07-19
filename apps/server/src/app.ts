import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import websocket from '@fastify/websocket';
import type { SimulationServerMessage } from '@eden/core';
import { createSimulationStore, type SimulationStore } from './simulation-store';
import { SimulationService } from './simulation-service';

export interface BuildAppOptions {
  logger?: boolean;
  autoStart?: boolean;
  seed?: number;
  citizenCount?: number;
  tickRate?: number;
  store?: SimulationStore;
  databaseUrl?: string;
}

export interface EdenApp extends FastifyInstance {
  simulation: SimulationService;
}

export async function buildApp(options: BuildAppOptions = {}): Promise<EdenApp> {
  const app = Fastify({ logger: options.logger ?? true }) as unknown as EdenApp;
  const store = options.store ?? createSimulationStore(options.databaseUrl);
  const simulation = new SimulationService(store, {
    seed: options.seed,
    citizenCount: options.citizenCount,
    tickRate: options.tickRate,
  });
  await simulation.initialize();
  app.simulation = simulation;

  await app.register(cors, { origin: true });
  await app.register(websocket);

  app.get('/health', async () => ({
    status: 'ok',
    timestamp: Date.now(),
    tick: simulation.getSnapshot().tick,
  }));

  app.get('/api/snapshot', async () => simulation.getSnapshot());

  app.post('/api/simulation/pause', async () => {
    simulation.pause();
    return simulation.getSnapshot();
  });

  app.post('/api/simulation/resume', async () => {
    simulation.start();
    return simulation.getSnapshot();
  });

  app.get('/ws', { websocket: true }, (connection) => {
    const sendSnapshot = (snapshot: ReturnType<SimulationService['getSnapshot']>) => {
      if (connection.socket.readyState !== connection.socket.OPEN) return;
      const message: SimulationServerMessage = { type: 'snapshot', data: snapshot };
      connection.socket.send(JSON.stringify(message));
    };
    const unsubscribe = simulation.subscribe(sendSnapshot);
    connection.socket.on('close', unsubscribe);
  });

  app.addHook('onClose', async () => {
    await simulation.close();
  });

  if (options.autoStart ?? true) simulation.start();
  return app;
}
