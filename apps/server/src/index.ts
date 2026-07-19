import { buildApp } from './app';

async function start(): Promise<void> {
  const app = await buildApp({
    databaseUrl: process.env.DATABASE_URL,
    seed: Number(process.env.EDEN_SEED ?? 7331),
    citizenCount: Number(process.env.EDEN_CITIZENS ?? 4),
    tickRate: Number(process.env.EDEN_TICK_RATE ?? 1000),
  });

  try {
    const port = Number(process.env.PORT ?? 3000);
    await app.listen({ port, host: '0.0.0.0' });
    app.log.info({ port }, 'EDEN simulation server running');
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

void start();
