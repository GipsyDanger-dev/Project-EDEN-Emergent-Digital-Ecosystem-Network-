import { createPostgresPool } from '@eden/db';
import type { SerializedRuntimeState } from '@eden/engine';

export interface SimulationStore {
  load(worldId: string): Promise<SerializedRuntimeState | null>;
  save(state: SerializedRuntimeState): Promise<void>;
  close(): Promise<void>;
}

export class MemorySimulationStore implements SimulationStore {
  private readonly states = new Map<string, SerializedRuntimeState>();

  async load(worldId: string): Promise<SerializedRuntimeState | null> {
    return this.states.get(worldId) ?? null;
  }

  async save(state: SerializedRuntimeState): Promise<void> {
    this.states.set(state.worldId, structuredClone(state));
  }

  async close(): Promise<void> {}
}

export class PostgresSimulationStore implements SimulationStore {
  private readonly pool;
  private initialized = false;

  constructor(connectionString: string) {
    this.pool = createPostgresPool({ connectionString, max: 5 });
  }

  async load(worldId: string): Promise<SerializedRuntimeState | null> {
    await this.ensureSchema();
    const result = await this.pool.query<{ state: SerializedRuntimeState }>(
      'SELECT state FROM eden_runtime_state WHERE world_id = $1',
      [worldId]
    );
    return result.rows[0]?.state ?? null;
  }

  async save(state: SerializedRuntimeState): Promise<void> {
    await this.ensureSchema();
    await this.pool.query(
      `INSERT INTO eden_runtime_state (world_id, state, updated_at)
       VALUES ($1, $2::jsonb, NOW())
       ON CONFLICT (world_id)
       DO UPDATE SET state = EXCLUDED.state, updated_at = NOW()`,
      [state.worldId, JSON.stringify(state)]
    );
  }

  async close(): Promise<void> {
    await this.pool.end();
  }

  private async ensureSchema(): Promise<void> {
    if (this.initialized) return;
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS eden_runtime_state (
        world_id TEXT PRIMARY KEY,
        state JSONB NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    this.initialized = true;
  }
}

export function createSimulationStore(databaseUrl?: string): SimulationStore {
  return databaseUrl
    ? new PostgresSimulationStore(databaseUrl)
    : new MemorySimulationStore();
}
