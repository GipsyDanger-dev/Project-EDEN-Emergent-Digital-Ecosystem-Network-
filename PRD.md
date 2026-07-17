# PRD.md

> Product Requirements Document — Sumber kebenaran untuk semua requirement EDEN.

---

## 1. Executive Summary

### Project Overview

EDEN (Emergent Digital Ecosystem Network) adalah **Artificial Society Engine** — platform di mana AI Citizens berevolusi, berkolaborasi, bersaing, dan menciptakan sejarah melalui keputusan autonomous mereka sendiri.

### Vision

Membangun dunia digital hidup di mana peradaban terbentuk dari keputusan agen, bukan dari script developer.

### Objectives

1. Membangun citizen AI yang autonomous dan explainable
2. Menciptakan world engine yang konsisten dan scalable
3. Memungkinkan emergence dari interaksi agen
4. Menyediakan platform riset untuk studi artificial society

### Success Metrics

| Metric | Target |
|--------|--------|
| Citizen decision explainability | 100% |
| World consistency | Tidak ada contradiction |
| Emergence events | Muncul tanpa script |
| Simulation stability | Berjalan 24 jam tanpa crash |
| User comprehension | Pengguna bisa mengikuti alur kehidupan |

### MVP Goal

**v0.1 — One Living Human**
Satu citizen AI dapat berpikir, mengingat, dan bertindak dalam world yang minimal.

### Long-term Goal

Menjadi platform riset standar untuk studi artificial society dan emergent behavior.

---

## 2. Problem Statement

### Masalah yang Ingin Diselesaikan

Simulator dan game saat ini memiliki keterbatasan fundamental:

1. **Scripted Events** — Peristiwa dihasilkan dari script, bukan dari interaksi agen
2. **No True Autonomy** — Citizen tidak memiliki kebebasan sejati
3. **Untraceable History** — Sejarah tidak dapat ditelusuri ke akar penyebabnya
4. **Developer Determinism** — Developer menentukan hasil, bukan emergence
5. **No Emergence** — Perilaku kompleks tidak muncul dari interaksi sederhana

### Kenapa Simulator Sekarang Kurang

| Simulator | Keterbatasan |
|-----------|--------------|
| **Smallville** | Scripted behaviors, limited autonomy |
| **Minecraft Voyager** | Task-oriented, no social emergence |
| **AI Town** | Chat-focused, no world simulation |
| **Stanford Generative Agents** | Research prototype, not production-ready |

### Kelebihan EDEN

1. **True Autonomy** — Citizen bebas membuat keputusan sendiri
2. **Immutable History** — Semua peristiwa tercatat dan dapat ditelusuri
3. **Emergence First** — Perilaku kompleks muncul dari interaksi sederhana
4. **Production Quality** — Dirancang untuk jangka panjang, bukan demo
5. **Research Platform** — API dan tools untuk riset ilmiah

---

## 3. Product Goals

### Version Milestones

| Version | Goal | Deliverable |
|---------|------|-------------|
| **v0.1** | One Living Human | Satu citizen AI yang bisa berpikir dan bertindak |
| **v0.2** | Village | Beberapa citizen berinteraksi dalam settlement |
| **v0.5** | Society | Economy, politics, culture muncul secara emergent |
| **v1** | Artificial Society Engine | Platform lengkap untuk simulasi masyarakat |
| **v2** | Research Platform | API dan tools untuk riset ilmiah |
| **v3** | Community Ecosystem | Plugin system untuk扩展 fitur |

### v0.1 — One Living Human (Detail)

**Goal**: Satu citizen AI dapat:
- Memiliki identitas unik
- Menyimpan dan mengingat pengalaman
- Membuat keputusan berdasarkan drive dan goal
- Bergerak dalam world minimal
- Menjelaskan alasan tindakannya

**Deliverable**:
- Citizen agent dengan AI brain
- Memory system (short-term dan long-term)
- Drive system (basic needs)
- Goal system (goal generation dan evaluation)
- Simple world (lokasi, waktu)
- Basic rendering (melihat citizen)

### v0.2 — Village (Detail)

**Goal**: Beberapa citizen dapat:
- Berinteraksi satu sama lain
- Membangun hubungan sosial
- Trading sederhana
- Membentuk settlement

### v0.5 — Society (Detail)

**Goal**: Masyarakat dapat:
- Memiliki economy yang emergent
- Memiliki political structures
- Memiliki culture dan tradition
- Menghasilkan history yang kaya

---

## 4. Out of Scope

Hal-hal yang **tidak termasuk** dalam EDEN:

- ❌ Multiplayer
- ❌ MMORPG
- ❌ PvP
- ❌ Quest scripting
- ❌ Story campaign
- ❌ AI chatbot
- ❌ Real-money trading
- ❌ Scripted cutscenes
- ❌ RPG elements
- ❌ Leveling system

**Alasan**: Hal-hal ini bertentangan dengan prinsip emergence dan citizen autonomy.

---

## 5. Functional Requirements

### 5.1 Citizen System

| ID | Requirement | Priority | Version |
|----|-------------|----------|---------|
| CS-001 | Citizen memiliki identitas unik (nama, umur, gender) | High | v0.1 |
| CS-002 | Citizen memiliki memory (short-term dan long-term) | High | v0.1 |
| CS-003 | Citizen memiliki emotion (basic: happy, sad, angry, fear) | High | v0.1 |
| CS-004 | Citizen memiliki drive (basic needs: hunger, energy, social) | High | v0.1 |
| CS-005 | Citizen memiliki goal (generated dari drive) | High | v0.1 |
| CS-006 | Citizen dapat membuat keputusan | High | v0.1 |
| CS-007 | Citizen dapat menjelaskan alasan keputusan | High | v0.1 |
| CS-008 | Citizen dapat bergerak dalam world | Medium | v0.1 |
| CS-009 | Citizen dapat melakukan aksi sederhana | Medium | v0.1 |
| CS-010 | Citizen memiliki skills | Low | v0.2 |
| CS-011 | Citizen memiliki inventory | Low | v0.2 |
| CS-012 | Citizen memiliki relationship | Low | v0.2 |
| CS-013 | Citizen dapat berkonversasi | Low | v0.2 |
| CS-014 | Citizen memiliki career | Low | v0.5 |
| CS-015 | Citizen dapat learning | Medium | v0.2 |
| CS-016 | Citizen dapat reflection | Medium | v0.1 |
| CS-017 | Citizen dapat planning | Medium | v0.1 |
| CS-018 | Citizen mengalami death | Low | v0.2 |
| CS-019 | Citizen lahir dari proses birth | Low | v0.2 |

### 5.2 World System

| ID | Requirement | Priority | Version |
|----|-------------|----------|---------|
| WS-001 | World memiliki map | High | v0.1 |
| WS-002 | World memiliki waktu | High | v0.1 |
| WS-003 | World memiliki lokasi | High | v0.1 |
| WS-004 | World memiliki weather | Medium | v0.2 |
| WS-005 | World memiliki terrain | Medium | v0.2 |
| WS-006 | World memiliki resources | Medium | v0.2 |
| WS-007 | World memiliki buildings | Low | v0.5 |
| WS-008 | World memiliki roads | Low | v0.5 |
| WS-009 | World memiliki transportation | Low | v0.5 |

### 5.3 Economy System

| ID | Requirement | Priority | Version |
|----|-------------|----------|---------|
| ES-001 | Economy memiliki supply & demand | High | v0.5 |
| ES-002 | Economy memiliki trading | High | v0.5 |
| ES-003 | Economy memiliki production | Medium | v0.5 |
| ES-004 | Economy memiliki consumption | Medium | v0.5 |
| ES-005 | Economy memiliki inflation | Low | v0.5 |
| ES-006 | Economy memiliki jobs | Medium | v0.5 |
| ES-007 | Economy memiliki ownership | Low | v0.5 |
| ES-008 | Economy memiliki tax | Low | v0.5 |
| ES-009 | Economy memiliki salary | Low | v0.5 |
| ES-010 | Economy memiliki business | Low | v0.5 |

### 5.4 Politics System

| ID | Requirement | Priority | Version |
|----|-------------|----------|---------|
| PS-001 | Politics memiliki government | Medium | v0.5 |
| PS-002 | Politics memiliki election | Low | v0.5 |
| PS-003 | Politics memiliki war | Low | v0.5 |
| PS-004 | Politics memiliki diplomacy | Low | v0.5 |
| PS-005 | Politics memiliki alliance | Low | v0.5 |
| PS-006 | Politics memiliki law | Low | v0.5 |
| PS-007 | Politics memiliki crime | Low | v0.5 |
| PS-008 | Politics memiliki punishment | Low | v0.5 |

### 5.5 Technology System

| ID | Requirement | Priority | Version |
|----|-------------|----------|---------|
| TS-001 | Technology memiliki discovery | Low | v0.5 |
| TS-002 | Technology memiliki research | Low | v0.5 |
| TS-003 | Technology memiliki innovation | Low | v0.5 |
| TS-004 | Technology memiliki knowledge sharing | Low | v0.5 |

### 5.6 Religion System

| ID | Requirement | Priority | Version |
|----|-------------|----------|---------|
| RS-001 | Religion memiliki belief | Low | v0.5 |
| RS-002 | Religion memiliki ritual | Low | v0.5 |
| RS-003 | Religion memiliki faith | Low | v0.5 |
| RS-004 | Religion memiliki conflict | Low | v0.5 |
| RS-005 | Religion memiliki conversion | Low | v0.5 |

### 5.7 Culture System

| ID | Requirement | Priority | Version |
|----|-------------|----------|---------|
| CSY-001 | Culture memiliki language | Low | v0.5 |
| CSY-002 | Culture memiliki festival | Low | v0.5 |
| CSY-003 | Culture memiliki tradition | Low | v0.5 |
| CSY-004 | Culture memiliki custom | Low | v0.5 |

### 5.8 History System

| ID | Requirement | Priority | Version |
|----|-------------|----------|---------|
| HS-001 | History mencatat semua events | High | v0.1 |
| HS-002 | History memiliki timeline | High | v0.1 |
| HS-003 | History dapat di-replay | Medium | v0.2 |
| HS-004 | History memiliki family tree | Low | v0.5 |
| HS-005 | History memiliki world archive | Low | v0.5 |

### 5.9 AI Brain

| ID | Requirement | Priority | Version |
|----|-------------|----------|---------|
| AI-001 | Brain memiliki perception | High | v0.1 |
| AI-002 | Brain memiliki attention | High | v0.1 |
| AI-003 | Brain memiliki memory retrieval | High | v0.1 |
| AI-004 | Brain memiliki goal evaluation | High | v0.1 |
| AI-005 | Brain memiliki planning | High | v0.1 |
| AI-006 | Brain memiliki reasoning | High | v0.1 |
| AI-007 | Brain memiliki decision making | High | v0.1 |
| AI-008 | Brain memiliki action execution | High | v0.1 |
| AI-009 | Brain memiliki reflection | High | v0.1 |
| AI-010 | Brain memiliki learning | Medium | v0.1 |
| AI-011 | Brain memiliki memory update | High | v0.1 |

### 5.10 Rendering

| ID | Requirement | Priority | Version |
|----|-------------|----------|---------|
| RN-001 | Menggunakan ThreeJS | High | v0.1 |
| RN-002 | Low poly style | Medium | v0.1 |
| RN-003 | LOD (Level of Detail) | Low | v0.2 |
| RN-004 | Camera control | High | v0.1 |
| RN-005 | Citizen selection | Medium | v0.1 |
| RN-006 | Heatmap visualization | Low | v0.5 |
| RN-007 | Replay visualization | Low | v0.2 |

### 5.11 UI

| ID | Requirement | Priority | Version |
|----|-------------|----------|---------|
| UI-001 | Dashboard | High | v0.1 |
| UI-002 | Citizen view | High | v0.1 |
| UI-003 | Economy view | Low | v0.5 |
| UI-004 | Politics view | Low | v0.5 |
| UI-005 | History view | Medium | v0.2 |
| UI-006 | Timeline view | Medium | v0.2 |
| UI-007 | Analytics view | Low | v0.5 |
| UI-008 | Developer mode | Medium | v0.2 |

### 5.12 Save System

| ID | Requirement | Priority | Version |
|----|-------------|----------|---------|
| SS-001 | Snapshot save | Medium | v0.2 |
| SS-002 | Replay save | Low | v0.2 |
| SS-003 | Autosave | Medium | v0.2 |
| SS-004 | World export | Low | v0.5 |
| SS-005 | World import | Low | v0.5 |
| SS-006 | Plugin system | Low | v0.5 |

---

## 6. Non-Functional Requirements

| Category | Requirement | Target |
|----------|-------------|--------|
| **Performance** | FPS | >= 30 fps |
| **Performance** | Memory usage | < 512 MB |
| **Performance** | Tick latency | < 100ms per tick |
| **Scalability** | Max citizens (v0.1) | 1 |
| **Scalability** | Max citizens (v0.5) | 100 |
| **Scalability** | Max citizens (v1) | 1000 |
| **Availability** | Uptime | 99.9% |
| **Maintainability** | Code coverage | >= 80% |
| **Extensibility** | Plugin support | v0.5 |

---

## 7. Technical Constraints

| Constraint | Description |
|------------|-------------|
| **Browser First** | Aplikasi harus berjalan di browser |
| **Docker** | Harus bisa di-deploy dengan Docker |
| **Open Source** | Semua kode harus open source |
| **Cross Platform** | Berjalan di semua platform modern |
| **Offline Support** | Bisa berjalan tanpa internet |

---

## 8. Acceptance Criteria

### v0.1 — One Living Human

| ID | Criteria | Status |
|----|----------|--------|
| AC-001 | Citizen memiliki identitas unik | ☐ |
| AC-002 | Citizen dapat menyimpan pengalaman | ☐ |
| AC-003 | Citizen dapat mengingat pengalaman | ☐ |
| AC-004 | Citizen memiliki drive yang berubah | ☐ |
| AC-005 | Citizen dapat membuat goal | ☐ |
| AC-006 | Citizen dapat membuat keputusan | ☐ |
| AC-007 | Citizen dapat menjelaskan keputusan | ☐ |
| AC-008 | Citizen dapat bergerak | ☐ |
| AC-009 | World berjalan dengan tick | ☐ |
| AC-010 | History tercatat | ☐ |
| AC-011 | Rendering menampilkan citizen | ☐ |
| AC-012 | UI menampilkan info citizen | ☐ |

---

## 9. Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **LLM Cost** | High | Medium | Gunakan model lokal atau caching |
| **Simulation Speed** | High | Medium | Optimasi tick processing |
| **Memory Explosion** | Medium | High | Batasi memory per citizen |
| **History Explosion** | Medium | High | Implementasi compression |
| **Storage** | Medium | Medium | Gunakan efficient encoding |
| **Concurrency** | High | Low | Event-driven architecture |
| **Scaling** | High | Low | Mulai dari single citizen |

---

## 10. Milestones

### Sprint Plan

| Sprint | Duration | Goal | Deliverable |
|--------|----------|------|-------------|
| Sprint 0 | 1 minggu | Setup | Project scaffolding, CI/CD |
| Sprint 1 | 2 minggu | v0.1 Core | Citizen agent, AI brain, memory |
| Sprint 2 | 2 minggu | v0.1 World | World engine, tick system |
| Sprint 3 | 2 minggu | v0.1 Render | ThreeJS, camera, UI |
| Sprint 4 | 2 minggu | v0.1 Polish | History, testing, docs |

### Roadmap

```
Q1 2026: v0.1 — One Living Human
Q2 2026: v0.2 — Village
Q3 2026: v0.5 — Society
Q4 2026: v1 — Artificial Society Engine
```

---

## 11. Emergence Requirements

> **Ini adalah bagian unik EDEN.** Semua requirement di section ini harus dipenuhi melalui emergence, bukan scripting.

| ID | Requirement | Alasan |
|----|-------------|--------|
| **ER-001** | Perang harus muncul dari interaksi agent | Perang yang di-script tidak autentik |
| **ER-002** | Harga barang berubah berdasarkan supply & demand | Harga harus emergent |
| **ER-003** | Agama muncul dari citizen menciptakan belief | Agama yang di-script tidak memiliki makna |
| **ER-004** | Bahasa berkembang dari komunikasi | Bahasa harus evolusioner |
| **ER-005** | Teknologi muncul dari discovery | Teknologi harus dihasilkan, bukan diberikan |
| **ER-006** | Politik muncul dari hubungan sosial | Kekuasaan harus emergent |
| **ER-007** | Tidak ada karakter utama | Setiap citizen sama pentingnya |
| **ER-008** | Setiap citizen bisa menjadi pemimpin | Kepemimpinan harus demokratis |
| **ER-009** | Semua keputusan dapat dijelaskan | Transparansi adalah kunci |
| **ER-010** | History immutable | Sejarah tidak boleh diubah |
| **ER-011** | Culture muncul dari kebiasaan | Culture harus natural |
| **ER-012** | Innovation muncul dari kebutuhan | Inovasi harus emergent |

---

## 12. Research Backlog

> **Daftar ide riset untuk pengembangan masa depan.** Ini bukan fitur, tapi arah riset.

| Area | Research Topic | Prioritas |
|------|----------------|-----------|
| **Memory** | Hierarchical Memory | Tinggi |
| **Cognitive** | World Model | Tinggi |
| **Cognitive** | Self Reflection | Tinggi |
| **Architecture** | Cognitive Architecture | Sedang |
| **Planning** | Multi-Agent Planning | Sedang |
| **Language** | Emergent Language | Sedang |
| **Social** | Social Graph Evolution | Sedang |
| **Goals** | Recursive Goal Generation | Sedang |
| **Ethics** | Value Formation | Rendah |
| **Ethics** | Moral Development | Rendah |
| **Collective** | Collective Intelligence | Rendah |
| **Consciousness** | Dreaming | Rendah |
| **Consciousness** | Imagination | Rendah |
| **Curiosity** | Curiosity Engine | Rendah |
| **Theory** | Theory of Mind | Rendah |

---

## Changelog

| Date | Version | Change |
|------|---------|--------|
| 2026-07-17 | 0.1.0 | Initial PRD finalization |
