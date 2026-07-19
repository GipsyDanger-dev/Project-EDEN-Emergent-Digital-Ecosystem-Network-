1. Development Workflow ⭐⭐⭐⭐⭐

## Local authoritative runtime

Requirements: Node.js 20+ and pnpm 8.15.

```bash
pnpm install
pnpm build
pnpm --filter @eden/server start
pnpm --filter @eden/web start
```

The server listens on `http://localhost:3000`. Run the web app on another port when both production apps run locally, for example `pnpm --filter @eden/web start -- -p 3100`. Copy `.env.example` to `.env` only when overriding defaults or enabling PostgreSQL persistence.

Repository quality gate:

```bash
pnpm run ci
```

This runs lint, TypeScript project-reference checking, tests, and production builds. Pull requests and pushes to `main` run the same gate in GitHub Actions.

## Sprint 5 baseline

- Server owns the only simulation clock and random stream.
- Every citizen owns an isolated canonical brain and memory stream.
- Runtime state can serialize, persist, restore, and continue deterministically.
- The frontend consumes REST/WebSocket snapshots and automatically reconnects.
- UI controls request pause/resume from the server; they do not mutate world state locally.

## Visual assets

Internet-sourced assets must be stored locally, have a production-safe license, and include provenance in `apps/web/public/assets/ATTRIBUTION.md`. The current citizen sprites come from the CC0 Puny Characters pack.


Flow wajib.

Issue

↓

Planning

↓

Approval

↓

Implementation

↓

Testing

↓

Documentation

↓

Commit

↓

Push

↓

Review

↓

Merge

Tidak boleh lompat.

2. Development Lifecycle

Setiap fitur wajib melewati:

Plan

↓

Build

↓

Test

↓

Document

↓

Review

↓

Ship
3. Git Workflow

Branch

main

develop

feature/*

fix/*

refactor/*

docs/*

Merge Flow

feature

↓

develop

↓

main
4. Branch Naming
feature/citizen-memory

feature/world-engine

feature/economy

feature/history

fix/pathfinding

docs/prd-update

refactor/ai-engine
5. Commit Convention
feat:

fix:

refactor:

docs:

test:

perf:

build:

ci:

chore:

Contoh

feat: implement citizen inventory

fix: resolve memory retrieval bug

docs: update world system

refactor: simplify ai planner
6. Pull Request Rules

PR harus menjelaskan

Tujuan
Perubahan
Dampak
Screenshot (jika UI)
Breaking Change
Testing
7. Definition of Ready

Sebelum coding.

Harus ada

✅ Requirement jelas

✅ Tidak ambigu

✅ Scope kecil

✅ Dependency jelas

8. Definition of Done ⭐⭐⭐⭐⭐

Feature selesai jika

✓ Build berhasil

✓ Test lulus

✓ Lint lulus

✓ Documentation update

✓ PR dibuat

✓ Review selesai

✓ Merge berhasil

Kalau satu gagal.

Feature belum selesai.

9. Documentation Policy

Semua perubahan behavior

↓

Update docs.

Tidak boleh

Code

≠

Documentation

10. Testing Strategy

Setiap fitur

Minimal

Unit Test

Kalau perlu

Integration Test

Simulation Test

Performance Test

11. Code Review Checklist

Reviewer harus cek

Architecture

Naming

Complexity

Duplicate

Security

Performance

Documentation

Testing

12. Refactoring Policy

Refactor hanya kalau

mengurangi kompleksitas
meningkatkan scalability
mengurangi duplicate

Bukan karena "lebih suka gaya ini".

13. Error Handling

Semua service wajib

Structured Error

Logging

Recovery

No silent error.

14. Logging Standard

Semua log punya

Timestamp

Service

Module

Level

Message

Context

TraceID
15. Configuration

Tidak boleh

Hardcode.

Semua

.env

config/

environment
16. Dependency Rules

Kalau install package

Harus

masih aktif
banyak dipakai
maintenance bagus
license compatible

Jangan install package karena viral.

17. Performance Rules

Sebelum optimasi

Harus

Measure

↓

Identify Bottleneck

↓

Optimize

Jangan optimasi berdasarkan asumsi.

18. Technical Debt

Kalau ada

Harus dicatat.

Tidak boleh disembunyikan.

Harus ada

Reason

Impact

Future Plan

19. Release Workflow
Development

↓

Testing

↓

Documentation

↓

Tag

↓

Release

↓

Hotfix jika perlu
20. Versioning

Gunakan

Semantic Versioning

Major.Minor.Patch

Misalnya

0.1.0

0.2.0

0.2.1

1.0.0
21. Sprint Rules

Setiap sprint

Harus punya

Goal

Deliverable

Acceptance Criteria

Retrospective

22. AI Development Workflow ⭐⭐⭐⭐⭐

Ini menurutku pembeda EDEN.

Flow AI Agent

Read PROJECT.md

↓

Read AGENT.md

↓

Read PRD

↓

Read Architecture

↓

Plan

↓

Implement

↓

Test

↓

Update Documentation

↓

Commit

↓

Push

Kalau tidak mengikuti urutan ini.

Stop.

23. Progress Tracking

Setiap selesai task.

Update

Progress

Files Changed

Risk

Next Task

Blocker
24. Repository Rules

Repository harus selalu

✅ Buildable

✅ Clean

✅ Organized

Tidak boleh

Temporary File

Debug Code

Unused Code

Commented Code

25. Emergency Rules

Kalau build gagal

↓

Perbaiki dulu

↓

Baru fitur baru.

Tidak boleh

Menumpuk bug.

Yang menurutku WAJIB ditambahkan
Incremental Development Policy ⭐⭐⭐⭐⭐

Karena EDEN besar.

Aku ingin ada aturan.

Jangan pernah membangun sistem besar sekaligus.

Bangun sistem terkecil yang berfungsi.

Validasi.

Dokumentasikan.

Commit.

Push.

Baru lanjut.

Contoh

❌ Salah

AI

Memory

Economy

Politics

UI

dibangun bersamaan

✅ Benar

Citizen

↓

Memory

↓

Planner

↓

Conversation

↓

Village

↓

Economy
Dan ini menurutku aturan terbaik untuk seluruh proyek
No Broken Main

Branch main dan develop harus selalu berada dalam kondisi yang dapat dijalankan.

Artinya:

Tidak boleh merge kode yang gagal build.
Tidak boleh merge fitur yang belum selesai.
Tidak boleh merge dokumentasi yang bertentangan dengan implementasi.
Hotfix lebih diprioritaskan daripada fitur baru jika stabilitas proyek terganggu.

---

## 26. Sprint Progress

### Sprint 0 — Project Setup ✅

| Task | Status | Detail |
|------|--------|--------|
| Documentation Finalization | ✅ | PROJECT.md, PRD.md, ARCHITECTURE.md |
| Monorepo Scaffolding | ✅ | Turborepo, packages, apps |
| CI/CD Basics | ✅ | GitHub Actions workflow |
| Docker Setup | ✅ | docker-compose.yml |

### Sprint 1 — v0.1 Core ✅

| Task | Status | Detail |
|------|--------|--------|
| Citizen Agent | ✅ | Identity, state, location, basic actions |
| AI Brain | ✅ | Perception, attention, planning, decision |
| Memory System | ✅ | Short-term, long-term, working memory |
| Drive System | ✅ | Basic needs, decay, thresholds |
| Goal System | ✅ | Goal generation, prioritization |

### Sprint 2 — v0.1 World ✅

| Task | Status | Detail |
|------|--------|--------|
| World Engine | ✅ | Map generation, time system, resource management |
| Tick Lifecycle | ✅ | Simulation loop, phase orchestration |
| Event Bus | ✅ | Event-driven architecture, pub/sub |
| Rendering | ✅ | ThreeJS world scene, citizen panel, time display |

### Sprint 3 — v0.1 Polish ✅

| Task | Status | Detail |
|------|--------|--------|
| History System | ✅ | Event recording, timeline, query |
| Testing | ✅ | 39 unit tests (citizen: 13, engine: 19, ai: 7) |
| Integration | ✅ | Connect citizen, AI, world, engine systems |
| Vitest Config | ✅ | Vitest config for all packages |
| AI Brain Integration | ✅ | Brain integrated into tick loop |
| Local Brain | ✅ | Decision making without LLM |
| Thought Display | ✅ | Show citizen thoughts in UI |

### Sprint 4 — Baseline Engineering & Visual Foundation ✅

| Task | Status | Detail |
|------|--------|--------|
| TypeScript Foundation | ✅ | Valid project references, composite builds, server configuration |
| Dependency Hygiene | ✅ | Workspace dependencies and scripts aligned with actual imports |
| Quality Gate | ✅ | Root lint, test, build, and CI commands |
| Continuous Integration | ✅ | GitHub Actions with frozen pnpm install and quality gate |
| Database Adapters | ✅ | Typed PostgreSQL, Redis, Neo4j, and Qdrant client factories |
| Visual Foundation | ✅ | EDEN observatory design system, production dashboard, refined 3D world |

---

## Changelog

| Date | Version | Change |
|------|---------|--------|
| 2026-07-19 | 0.1.0 | Sprint 4 baseline engineering and visual foundation completed |
| 2026-07-17 | 0.1.0 | Sprint 0, 1, 2, & 3 completed |
