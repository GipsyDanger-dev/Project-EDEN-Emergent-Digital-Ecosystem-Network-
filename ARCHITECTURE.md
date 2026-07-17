# ARCHITECTURE.md

> Arsitektur teknis Project EDEN. Sumber kebenaran untuk semua keputusan teknis.

---

## 1. System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                              │
│                    Next.js Frontend                         │
│              (React + ThreeJS + UI)                         │
└─────────────────────────┬───────────────────────────────────┘
                          │ WebSocket / REST
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                     API Gateway                             │
│              (Auth, Rate Limit, Router)                     │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                   Core Engine                               │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │ World       │ │ Simulation  │ │ AI          │          │
│  │ Engine      │ │ Engine      │ │ Engine      │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │ Memory      │ │ History     │ │ Event       │          │
│  │ Engine      │ │ Engine      │ │ Bus         │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                    Data Layer                               │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │ PostgreSQL  │ │ Redis       │ │ Neo4j       │          │
│  │ (Primary)   │ │ (Cache)     │ │ (Graph)     │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
│  ┌─────────────┐                                           │
│  │ Qdrant      │                                           │
│  │ (Vector)    │                                           │
│  └─────────────┘                                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Tech Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| **Next.js 14** | React framework, SSR, routing |
| **React 18** | UI components |
| **ThreeJS** | 3D rendering (citizens, world) |
| **Zustand** | State management |
| **Tailwind CSS** | Styling |
| **TypeScript** | Type safety |

### Backend

| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime |
| **TypeScript** | Type safety |
| **Fastify** | HTTP server (高性能) |
| **Socket.IO** | WebSocket (real-time) |
| **Zod** | Schema validation |

### Simulation Engine

| Technology | Purpose |
|------------|---------|
| **TypeScript** | Core simulation logic |
| **BullMQ** | Job queue (tick processing) |

### AI Engine

| Technology | Purpose |
|------------|---------|
| **TypeScript** | AI pipeline logic |
| **LLM API** | Citizen thinking (OpenAI/local) |
| **Embeddings** | Memory similarity search |

### Database

| Database | Responsibility | Why |
|----------|----------------|-----|
| **PostgreSQL** | Primary data store | Reliable, ACID, strong ecosystem |
| **Redis** | Cache, tick state, sessions | Fast, in-memory, pub/sub |
| **Neo4j** | Social graph | Relationships, graph queries |
| **Qdrant** | Vector search | Memory retrieval, similarity |

### Infrastructure

| Technology | Purpose |
|------------|---------|
| **Docker** | Containerization |
| **Docker Compose** | Local development |
| **GitHub Actions** | CI/CD |
| **Turborepo** | Monorepo build |

### Monitoring

| Technology | Purpose |
|------------|---------|
| **Pino** | Structured logging |
| **Prometheus** | Metrics (future) |
| **Grafana** | Dashboards (future) |

### Testing

| Technology | Purpose |
|------------|---------|
| **Vitest** | Unit testing |
| **Playwright** | E2E testing |
| **Supertest** | API testing |

---

## 3. Monorepo Structure

```
eden/
├── apps/
│   ├── web/                    # Next.js frontend
│   │   ├── src/
│   │   │   ├── components/     # React components
│   │   │   ├── hooks/          # React hooks
│   │   │   ├── stores/         # Zustand stores
│   │   │   ├── pages/          # Next.js pages
│   │   │   └── utils/          # Utilities
│   │   ├── public/             # Static assets
│   │   └── package.json
│   │
│   └── server/                 # Backend API
│       ├── src/
│       │   ├── api/            # REST endpoints
│       │   ├── ws/             # WebSocket handlers
│       │   ├── middleware/     # Auth, validation
│       │   └── config/         # Configuration
│       └── package.json
│
├── packages/
│   ├── core/                   # Shared types, utils
│   │   ├── src/
│   │   │   ├── types/          # TypeScript types
│   │   │   ├── constants/      # Constants
│   │   │   └── utils/          # Shared utilities
│   │   └── package.json
│   │
│   ├── engine/                 # Simulation engine
│   │   ├── src/
│   │   │   ├── world/          # World system
│   │   │   ├── simulation/     # Tick lifecycle
│   │   │   ├── events/         # Event bus
│   │   │   └── time/           # Time management
│   │   └── package.json
│   │
│   ├── ai/                     # AI engine
│   │   ├── src/
│   │   │   ├── brain/          # AI pipeline
│   │   │   ├── memory/         # Memory system
│   │   │   ├── decision/       # Decision making
│   │   │   └── llm/            # LLM integration
│   │   └── package.json
│   │
│   ├── citizen/                # Citizen system
│   │   ├── src/
│   │   │   ├── identity/       # Citizen identity
│   │   │   ├── needs/          # Drive system
│   │   │   ├── goals/          # Goal system
│   │   │   ├── skills/         # Skill system
│   │   │   └── relationships/  # Social system
│   │   └── package.json
│   │
│   ├── history/                # History engine
│   │   ├── src/
│   │   │   ├── events/         # Event recording
│   │   │   ├── timeline/       # Timeline management
│   │   │   └── replay/         # Replay system
│   │   └── package.json
│   │
│   └── db/                     # Database layer
│       ├── src/
│       │   ├── postgres/       # PostgreSQL client
│       │   ├── redis/          # Redis client
│       │   ├── neo4j/          # Neo4j client
│       │   ├── qdrant/         # Qdrant client
│       │   └── migrations/     # DB migrations
│       └── package.json
│
├── docker/
│   ├── docker-compose.yml      # Local development
│   ├── docker-compose.prod.yml # Production
│   └── Dockerfile              # App container
│
├── docs/                       # Documentation
│   ├── PROJECT.md
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   └── DEVELOPMENT.md
│
├── scripts/                    # Build/deploy scripts
│   ├── setup.sh
│   └── seed.sh
│
├── configs/                    # Configuration files
│   ├── tsconfig.base.json
│   └── eslint/
│
├── .github/
│   └── workflows/              # CI/CD
│       ├── ci.yml
│       └── deploy.yml
│
├── package.json                # Root package.json
├── turbo.json                  # Turborepo config
├── tsconfig.json               # Root TypeScript config
└── .env.example                # Environment template
```

---

## 4. Service Architecture

### Frontend (apps/web)

| Aspect | Description |
|--------|-------------|
| **Responsibility** | Menampilkan dunia, menerima input pengguna |
| **Dependencies** | ThreeJS, React, Socket.IO client |
| **Output** | 3D rendering, UI components |

### API Gateway (apps/server)

| Aspect | Description |
|--------|-------------|
| **Responsibility** | Auth, rate limiting, routing, validation |
| **Dependencies** | Fastify, Socket.IO |
| **Output** | REST API, WebSocket events |

### World Engine (packages/engine/world)

| Aspect | Description |
|--------|-------------|
| **Responsibility** | Mengelola state dunia (map, lokasi, resources) |
| **Dependencies** | PostgreSQL, Redis |
| **Output** | World state updates |

### Simulation Engine (packages/engine/simulation)

| Aspect | Description |
|--------|-------------|
| **Responsibility** | Mengelola tick lifecycle, orchestrasi semua sistem |
| **Dependencies** | Semua engine lain |
| **Output** | Tick events, state transitions |

### AI Engine (packages/ai)

| Aspect | Description |
|--------|-------------|
| **Responsibility** | Proses berpikir citizen (perception → decision) |
| **Dependencies** | LLM API, Memory system |
| **Output** | Citizen decisions, explanations |

### Memory Engine (packages/ai/memory)

| Aspect | Description |
|--------|-------------|
| **Responsibility** | Menyimpan, mencari, memperbarui memori citizen |
| **Dependencies** | PostgreSQL, Qdrant |
| **Output** | Memory retrieval, memory updates |

### History Engine (packages/history)

| Aspect | Description |
|--------|-------------|
| **Responsibility** | Mencatat semua peristiwa, menyediakan replay |
| **Dependencies** | PostgreSQL |
| **Output** | Event logs, timeline |

### Event Bus (packages/engine/events)

| Aspect | Description |
|--------|-------------|
| **Responsibility** | Komunikasi antar sistem secara async |
| **Dependencies** | Redis Pub/Sub |
| **Output** | Event distribution |

---

## 5. Data Flow

### Citizen Action Flow

```
Citizen State
    │
    ▼
Need Changes (hunger, energy, social)
    │
    ▼
AI Brain
    │
    ├── Perception (lihat sekitar)
    ├── Attention (fokus ke yang penting)
    ├── Memory Retrieval (ingat pengalaman)
    ├── Goal Evaluation (evaluasi goal)
    ├── Planning (buat rencana)
    ├── Reasoning (pertimbangkan opsi)
    └── Decision (ambil keputusan)
    │
    ▼
Action Execution (bergerak, makan, bicara)
    │
    ▼
State Update (update citizen state)
    │
    ▼
Event Recorded (cetak ke history)
    │
    ▼
Database Updated (simpan ke PostgreSQL)
    │
    ▼
Frontend Updated (WebSocket → React)
```

### Tick Data Flow

```
Tick Start
    │
    ▼
┌─────────────────────────────────────┐
│ World Update                        │
│ - Weather                           │
│ - Resources                         │
│ - Time                              │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ Citizen Update (parallel)           │
│ - For each citizen:                 │
│   - Update needs                    │
│   - AI thinking                     │
│   - Execute action                  │
│   - Record event                    │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ Conflict Resolution                 │
│ - Resource conflicts                │
│ - Location conflicts                │
│ - Social conflicts                  │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ State Persist                       │
│ - Save to PostgreSQL                │
│ - Update Redis cache                │
│ - Broadcast to frontend             │
└─────────────────────────────────────┘
    │
    ▼
Tick End
```

---

## 6. Event Architecture

EDEN menggunakan **event-driven architecture**. Semua interaksi terjadi melalui events.

### Event Types

| Category | Events |
|----------|--------|
| **Citizen** | `CitizenCreated`, `CitizenMoved`, `CitizenActed`, `CitizenDied` |
| **Need** | `NeedChanged`, `NeedCritical`, `NeedSatisfied` |
| **Goal** | `GoalCreated`, `GoalAchieved`, `GoalFailed` |
| **Social** | `ConversationStarted`, `RelationshipChanged`, `TrustChanged` |
| **World** | `WeatherChanged`, `ResourceDepleted`, `BuildingCreated` |
| **Economy** | `TradeCompleted`, `PriceChanged`, `JobCreated` |
| **History** | `EventRecorded`, `TimelineUpdated` |

### Event Structure

```typescript
interface Event {
  id: string;
  type: string;
  timestamp: number;
  citizenId?: string;
  data: Record<string, any>;
  metadata: {
    tick: number;
    cause: string;  // Apa yang menyebabkan event ini
  };
}
```

### Event Flow Example

```
CitizenHungry (event)
    │
    ▼
FindFood (goal created)
    │
    ▼
MoveToFoodSource (action)
    │
    ▼
EatFood (action)
    │
    ▼
HungerSatisfied (need updated)
    │
    ▼
HistoryEvent (recorded)
```

---

## 7. Tick Lifecycle

> **Ini adalah "jantung" simulasi.**

```
┌─────────────────────────────────────────────────────────────┐
│                      TICK START                             │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ Phase 1: World Update                                       │
│ - Update time (advance clock)                               │
│ - Update weather                                            │
│ - Update resources (regenerate/consume)                     │
│ - Update buildings                                          │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ Phase 2: Citizen Update (parallel per citizen)              │
│ - Update needs (hunger, energy, social)                     │
│ - AI thinking (perception → decision)                       │
│ - Execute action                                            │
│ - Record event                                              │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ Phase 3: Interaction Resolution                             │
│ - Resolve conversations                                     │
│ - Resolve trades                                            │
│ - Resolve conflicts                                         │
│ - Update relationships                                      │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ Phase 4: State Persist                                      │
│ - Save world state to PostgreSQL                            │
│ - Update Redis cache                                        │
│ - Record history events                                     │
│ - Broadcast state to frontend                               │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                       TICK END                              │
└─────────────────────────────────────────────────────────────┘
```

### Tick Timing

| Version | Target Tick Rate | Citizens |
|---------|------------------|----------|
| v0.1 | 1 tick/detik | 1 |
| v0.2 | 1 tick/detik | 5-10 |
| v0.5 | 1 tick/2 detik | 50-100 |
| v1 | 1 tick/5 detik | 500-1000 |

---

## 8. AI Pipeline

> **Proses berpikir citizen.**

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Perception                                               │
│    - Apa yang bisa dilihat citizen?                         │
│    - Apa yang terjadi di sekitar?                           │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Attention                                                │
│    - Apa yang penting?                                      │
│    - Apa yang perlu difokuskan?                             │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Memory Retrieval                                         │
│    - Apa yang pernah terjadi sebelumnya?                    │
│    - Pengalaman serupa?                                     │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Goal Evaluation                                          │
│    - Goal mana yang paling penting?                         │
│    - Goal mana yang bisa dicapai?                           │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Planning                                                 │
│    - Bagaimana mencapai goal?                               │
│    - Langkah-langkah apa saja?                              │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Reasoning                                                │
│    - Opsi mana yang terbaik?                                │
│    - Apa konsekuensinya?                                    │
│    - Apa yang dikatakan memory?                             │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. Decision                                                 │
│    - Pilih satu aksi                                        │
│    - Generate explanation                                   │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ 8. Action Execution                                         │
│    - Eksekusi aksi yang dipilih                             │
│    - Update state                                           │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ 9. Reflection                                               │
│    - Apa yang terjadi?                                      │
│    - Apa yang dipelajari?                                   │
│    - Apa yang harus diingat?                                │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ 10. Memory Update                                           │
│     - Simpan pengalaman baru                                │
│     - Update pengetahuan                                    │
│     - Update relationships                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 9. Database Architecture

### PostgreSQL (Primary Store)

**Tanggung jawab:**
- Citizen data (identity, state, skills)
- World state (locations, resources)
- History events
- Economy data
- Configuration

**Why PostgreSQL:**
- ACID compliance
- Strong relational queries
- JSON support (flexible schema)
- Mature ecosystem
- Good performance

### Redis (Cache & State)

**Tanggung jawab:**
- Tick state (current state)
- Session data
- Pub/Sub (event distribution)
- Rate limiting
- Temporary data

**Why Redis:**
- In-memory performance
- Pub/Sub for events
- Simple data structures
- Easy to use

### Neo4j (Graph Database)

**Tanggung jawab:**
- Social relationships
- Trust networks
- Influence graphs
- Family trees

**Why Neo4j:**
- Graph queries are natural
- Relationship traversal
- Pattern matching
- Social network analysis

### Qdrant (Vector Database)

**Tanggung jawab:**
- Memory embeddings
- Similarity search
- Context retrieval
- Semantic search

**Why Qdrant:**
- Fast vector search
- Good scalability
- Easy to use
- Open source

---

## 10. Communication

### REST API

**Untuk:**
- CRUD operations
- Query data
- Authentication
- Configuration

### WebSocket (Socket.IO)

**Untuk:**
- Real-time updates
- Tick notifications
- State changes
- Live events

### Internal Event Bus (Redis Pub/Sub)

**Untuk:**
- Inter-service communication
- Async operations
- Event distribution
- Decoupling

### Message Queue (Future - BullMQ)

**Untuk:**
- Heavy processing
- Background jobs
- Retry logic
- Priority queues

---

## 11. State Management

### Frontend State

```
┌─────────────────────────────────────┐
│ Zustand Store                       │
│ - World state                       │
│ - Selected citizen                  │
│ - UI state                          │
│ - Camera state                      │
└─────────────────────────────────────┘
```

### Backend State

```
┌─────────────────────────────────────┐
│ In-Memory State                     │
│ - Current tick                      │
│ - Active citizens                   │
│ - Pending events                    │
└─────────────────────────────────────┘
```

### Simulation State

```
┌─────────────────────────────────────┐
│ Redis State                         │
│ - Current world state               │
│ - Citizen positions                 │
│ - Resource amounts                  │
│ - Weather state                     │
└─────────────────────────────────────┘
```

---

## 12. Save System

### Snapshot Save

- Full state capture
- Point-in-time recovery
- Used for: manual saves, milestones

### Incremental Save

- Delta from last save
- Efficient storage
- Used for: autosave

### Replay Save

- Event log only
- Can reconstruct state
- Used for: replay, analysis

### Recovery

- Load from snapshot
- Apply incremental saves
- Validate state consistency

---

## 13. Scaling Strategy

### v0.1 (1 Citizen)

- Single process
- In-memory state
- Simple PostgreSQL

### v0.2 (5-10 Citizens)

- Single process
- Redis for state
- Connection pooling

### v0.5 (50-100 Citizens)

- Multiple workers
- Redis cluster
- Read replicas

### v1 (500-1000 Citizens)

- Microservices
- Sharded database
- Load balancing

### v2+ (1000+ Citizens)

- Distributed simulation
- Geographic sharding
- GPU acceleration

---

## 14. Security

### API Security

- JWT authentication
- Rate limiting
- Input validation (Zod)
- CORS configuration

### Data Security

- Environment variables for secrets
- Encrypted sensitive data
- Database access control
- Backup encryption

### Docker Security

- Non-root user
- Minimal base image
- No unnecessary ports
- Health checks

---

## 15. Performance Target

### v0.1

| Metric | Target |
|--------|--------|
| Tick rate | 1 tick/detik |
| Memory | < 256 MB |
| CPU | < 50% |
| Response time | < 100ms |
| FPS | >= 30 |

### v0.5

| Metric | Target |
|--------|--------|
| Tick rate | 1 tick/2 detik |
| Memory | < 2 GB |
| CPU | < 80% |
| Response time | < 200ms |
| FPS | >= 30 |

### v1

| Metric | Target |
|--------|--------|
| Tick rate | 1 tick/5 detik |
| Memory | < 16 GB |
| CPU | < 90% |
| Response time | < 500ms |
| FPS | >= 30 |

---

## 16. Observability

### Logging

- Structured logging (Pino)
- Log levels: debug, info, warn, error
- Context: service, module, citizen
- Trace ID for request tracking

### Tracing

- Request tracing
- Tick tracing
- AI pipeline tracing
- Performance profiling

### Metrics

- Tick rate
- Memory usage
- CPU usage
- Response time
- Error rate
- Citizen count

### Health Check

- `/health` endpoint
- Database connectivity
- Redis connectivity
- Memory usage

---

## 17. Future Architecture

### Microservices

- Separate services per domain
- Independent deployment
- Service mesh (Istio)

### Cluster

- Multiple nodes
- Load balancing
- Failover

### Distributed Simulation

- Geographic distribution
- Eventual consistency
- Conflict resolution

### GPU Acceleration

- AI inference
- Vector search
- Physics simulation

### Cloud

- Kubernetes deployment
- Auto-scaling
- Managed databases

---

## 18. Architecture Decision Records

### ADR-001: Use PostgreSQL

**Status:** Accepted

**Reason:**
- ACID compliance
- Strong relational queries
- JSON support
- Mature ecosystem
- Good performance

**Alternatives:**
- MySQL — Less features
- SQLite — Not scalable
- MongoDB — Less consistent

**Decision:** PostgreSQL

---

### ADR-002: Use ThreeJS

**Status:** Accepted

**Reason:**
- Browser first
- Good performance
- Large community
- Easy to use

**Alternatives:**
- Unity — Not browser-first
- Godot — Not browser-first
- Babylon.js — Smaller community

**Decision:** ThreeJS

---

### ADR-003: Use TypeScript Everywhere

**Status:** Accepted

**Reason:**
- Type safety
- Code sharing (monorepo)
- Better DX
- Easier maintenance

**Alternatives:**
- JavaScript — Less safe
- Rust — Steeper learning curve
- Go — Less ecosystem

**Decision:** TypeScript

---

### ADR-004: Event-Driven Architecture

**Status:** Accepted

**Reason:**
- Loose coupling
- Scalability
- Async processing
- Easy to extend

**Alternatives:**
- Request-Response — Tight coupling
- Shared State — Race conditions

**Decision:** Event-Driven

---

### ADR-005: Monorepo with Turborepo

**Status:** Accepted

**Reason:**
- Code sharing
- Atomic commits
- Simplified dependencies
- Better DX

**Alternatives:**
- Multi-repo — Complex dependencies
- Lerna — Less maintained

**Decision:** Turborepo monorepo

---

## Changelog

| Date | Version | Change |
|------|---------|--------|
| 2026-07-17 | 0.1.0 | Initial architecture finalization |
