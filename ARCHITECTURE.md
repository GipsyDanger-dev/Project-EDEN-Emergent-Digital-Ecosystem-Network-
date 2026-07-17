1. System Overview

High level architecture.

Misalnya

Browser
    │
Next.js Frontend
    │
API Gateway
    │
──────────────────────────────────────
│ World Engine                       │
│ AI Engine                          │
│ Simulation Engine                  │
│ Memory Engine                      │
│ History Engine                     │
──────────────────────────────────────
    │
PostgreSQL
Redis
Neo4j
Qdrant

Jelaskan tugas masing-masing service.

2. Tech Stack

Frontend

Backend

Simulation

AI

Database

Infrastructure

Monitoring

Testing

Container

CI/CD

Semuanya.

3. Monorepo Structure
eden/

apps/

packages/

docs/

docker/

scripts/

configs/

.github/

Setiap folder dijelaskan.

4. Service Architecture

Misalnya

Frontend

Responsibility

Dependencies

Output

AI Service

Responsibility

Dependencies

Output

Simulation

Responsibility

Dependencies

Output

Semua service.

5. Data Flow ⭐⭐⭐⭐⭐

Ini penting.

Misalnya

Citizen

↓

Need changes

↓

Planner

↓

Decision

↓

Action

↓

History

↓

Database

↓

Frontend

Flow harus jelas.

6. Event Architecture

EDEN menurutku harus Event Driven.

Misalnya

CitizenHungry

↓

FindFood

↓

Trade

↓

Eat

↓

UpdateNeed

↓

HistoryEvent

Semua event dijelaskan.

7. Tick Lifecycle ⭐⭐⭐⭐⭐

Ini sangat penting.

Misalnya

Tick Start

↓

Weather

↓

Resources

↓

Citizen Update

↓

AI Thinking

↓

Movement

↓

Conversation

↓

Trade

↓

Conflict

↓

Construction

↓

History

↓

Save

↓

Tick End

Ini akan menjadi "jantung" simulasi.

8. AI Pipeline

Perception

↓

Attention

↓

Memory Retrieval

↓

Planning

↓

Decision

↓

Action

↓

Reflection

↓

Memory Update

Jangan terlalu detail (detail nanti di implementasi), tapi alurnya harus ada.

9. Database Architecture

Kenapa PostgreSQL.

Kenapa Redis.

Kenapa Neo4j.

Kenapa Qdrant.

Tanggung jawab masing-masing.

Jangan overlap.

10. Communication

REST

WebSocket

Internal Event Bus

Message Queue (future)

11. State Management

Frontend

Backend

Simulation

Bagaimana state berpindah.

12. Save System

Snapshot

Incremental Save

Replay

Recovery

13. Scaling Strategy

Kalau nanti

100 citizen

1000 citizen

10000 citizen

Apa yang berubah?

14. Security

API

Validation

Secrets

Environment

Docker

15. Performance Target

Misalnya

100 Citizen

Target TPS

Memory

CPU

Response

FPS

16. Observability ⭐⭐⭐⭐⭐

Ini sering dilupakan.

Masukkan

Logging

Tracing

Metrics

Health Check

Profiling

Dashboard

Karena nanti debugging simulasi akan sulit.

17. Future Architecture

Microservices

Cluster

Distributed Simulation

GPU

Cloud

Plugin

Menurutku ada section yang wajib ditambahkan
Architecture Decision Records (ADR)

Di bagian akhir.

Misalnya

ADR-001

Use PostgreSQL

Reason:

Reliable

Open Source

Strong ecosystem

Alternatives:

MySQL

SQLite

Rejected because...
ADR-002

Use ThreeJS

Reason:

Browser first

Rejected:

Unity

Godot
ADR-003

Use Rust Simulation Engine

Reason:

Performance

Memory Safety

Semua keputusan besar dicatat.

Kalau nanti developer baru masuk.

Mereka tahu

kenapa keputusan itu diambil.

Menurutku Architecture.md harus punya satu prinsip besar
Separation of Concerns

Aku ingin setiap service punya satu tanggung jawab utama.

Contohnya:

Frontend hanya bertanggung jawab menampilkan dunia dan menerima input pengguna.
Simulation Engine hanya mengelola state dunia dan tick simulasi.
AI Engine hanya menangani proses berpikir, perencanaan, dan pengambilan keputusan Citizen.
Memory Engine hanya mengelola penyimpanan, pencarian, dan pembaruan memori.
History Engine hanya mencatat seluruh peristiwa dan menyediakan mekanisme replay.
API Gateway hanya menjadi pintu masuk komunikasi eksternal.

Dengan batas tanggung jawab yang jelas, setiap komponen bisa dikembangkan, diuji, dan diskalakan secara independen tanpa membuat arsitektur menjadi saling bergantung secara berlebihan.