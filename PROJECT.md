# PROJECT.md

> Dokumentasi ini adalah sumber kebenaran tunggal untuk Project EDEN.
> Semua keputusan pengembangan harus merujuk ke sini.

---

## 1. Project Identity

| Field | Value |
|-------|-------|
| **Project Name** | EDEN |
| **Codename** | Emergent Digital Ecosystem Network |
| **Tagline** | A Living Digital World |
| **Current Version** | 0.1.0 |
| **Status** | In Development |
| **Repository** | github.com/user/project-eden |

---

## 2. Vision

### Apa itu EDEN?

EDEN adalah **Artificial Society Engine** — sebuah dunia digital hidup di mana AI Citizens berevolusi, berkolaborasi, bersaing, menciptakan sejarah, dan membentuk dunia melalui keputusan mereka sendiri.

### Kenapa EDEN dibuat?

Simulator dan game saat ini memiliki keterbatasan fundamental:
- Peristiwa dihasilkan dari script, bukan dari interaksi agen
- Sejarah tidak dapat ditelusuri ke akar penyebabnya
- Citizen tidak memiliki kebebasan sejati
- Developer menentukan hasil, bukan emergence

EDEN dibuat untuk menyelesaikan masalah ini.

### Mimpi Besar

Membangun platform riset di mana ilmuwan, pengembang, dan pengamat dapat mempelajari bagaimana peradaban terbentuk, berkembang, dan runtuh — semuanya dari keputusan autonomous agents.

---

## 3. Mission

### Target Jangka Pendek

| Version | Milestone | Deskripsi |
|---------|-----------|-----------|
| v0.1 | One Living Human | Satu Citizen dapat berpikir, mengingat, dan bertindak |
| v0.2 | Village | Beberapa Citizen berinteraksi dalam satu settlement |
| v0.5 | Society | Economy, politics, dan culture muncul secara emergent |

### Target Jangka Panjang

| Version | Milestone | Deskripsi |
|---------|-----------|-----------|
| v1 | Artificial Society Engine | Platform lengkap untuk simulasi masyarakat |
| v2 | Research Platform | API dan tools untuk riset ilmiah |
| v3 | Community Ecosystem | Plugin system untuk扩展 fitur |

---

## 4. Philosophy

### Identitas EDEN

- EDEN **bukan** game
- EDEN **bukan** simulator
- EDEN **adalah** dunia hidup

### Nilai Inti

- **Kebebasan Citizen** — Semua citizen bebas melakukan apa saja dalam batasan world rules
- **Emergence First** — Tidak ada scripted event. Semua peristiwa muncul dari interaksi agen
- **Immutable History** — Sejarah tidak boleh dipalsukan. Semua keputusan meninggalkan jejak
- **Developer Neutrality** — Developer tidak menentukan hasil simulasi

---

## 5. North Star

> **Everything in EDEN must emerge from agent decisions or world rules, never from scripted events.**

Prinsip ini menjadi panduan untuk setiap keputusan desain dan implementasi.

---

## 6. EDEN Constitution

Aturan mutlak yang tidak boleh dilanggar:

1. **No Scripted Events** — Semua peristiwa harus muncul dari keputusan agen atau world rules
2. **All Citizens Are AI** — Setiap citizen adalah autonomous AI agent
3. **Explainable Decisions** — Semua keputusan harus bisa dijelaskan
4. **Causal History** — Semua perubahan dunia harus memiliki sebab yang dapat ditelusuri
5. **Always Running** — Dunia berjalan walaupun tidak ada user
6. **Developer Non-Intervention** — Developer tidak boleh mengintervensi simulasi
7. **Immutable History** — History tidak boleh diubah tanpa alasan teknis yang jelas
8. **Emergence Over Scripting** — Emergence selalu diutamakan dibanding scripting
9. **No Protagonists** — Tidak ada karakter utama. Setiap citizen sama pentingnya
10. **Democratic Potential** — Setiap citizen bisa menjadi pemimpin
11. **World Consistency** — Dunia harus konsisten secara internal
12. **Memory Shapes Future** — Memory citizen mempengaruhi keputusan masa depan

---

## 7. Core Principles

| Prinsip | Penjelasan |
|---------|------------|
| **Citizen First** | Semua sistem dibuat untuk citizen, bukan untuk UI |
| **History Matters** | Semua keputusan meninggalkan jejak yang dapat ditelusuri |
| **Memory Shapes Reality** | Memory mengubah masa depan citizen dan dunia |
| **Every Life Matters** | Citizen biasa sama pentingnya dengan raja |
| **Explainability** | AI harus bisa menjelaskan alasan tindakannya |
| **Simplicity** | Solusi paling sederhana yang benar adalah yang terbaik |

---

## 8. Project Scope

### Yang Termasuk

- Citizen System (identity, memory, emotion, decision)
- World System (map, time, weather, resources)
- Economy System (supply, demand, trading, jobs)
- Politics System (government, election, diplomacy)
- History System (event, timeline, replay)
- AI Brain (perception, planning, reasoning, reflection)
- Memory System (storage, retrieval, update)
- Rendering (ThreeJS, low poly, camera)
- UI (dashboard, citizen view, analytics)

### Yang Tidak Termasuk

- Multiplayer
- MMORPG
- PvP
- Quest scripting
- Story campaign
- AI chatbot
- Real-money trading

---

## 9. Long-term Vision

```
v0.1  One Living Human
  ↓
v0.2  Village
  ↓
v0.5  Society
  ↓
v1    Artificial Society Engine
  ↓
v2    Research Platform
  ↓
v3    Community Ecosystem
```

---

## 10. Glossary

| Istilah | Definisi |
|---------|----------|
| **Citizen** | Autonomous AI agent yang hidup di dunia EDEN |
| **Settlement** | Tempat tinggal kolektif citizen (desa, kota, dll) |
| **World Tick** | Satu siklus simulasi di mana semua sistem diperbarui |
| **Memory** | Penyimpanan pengalaman dan pengetahuan citizen |
| **Drive** | Kebutuhan dasar citizen (makan, tidur, sosial, dll) |
| **Goal** | Tujuan spesifik yang ingin dicapai citizen |
| **Reflection** | Proses citizen mengevaluasi pengalaman masa lalu |
| **Emergence** | Peristiwa yang muncul dari interaksi agen, bukan dari script |
| **History** | Catatan seluruh peristiwa yang terjadi di dunia |
| **Influence** | Kemampuan citizen mempengaruhi citizen lain |
| **Trust** | Tingkat kepercayaan antar citizen |
| **Reputation** | Status sosial citizen di mata masyarakat |
| **Legacy** | Warisan yang ditinggalkan citizen setelah kematian |
| **Simulation** | Proses menjalankan dunia EDEN |
| **Knowledge** | Informasi yang dipelajari citizen dari pengalaman |
| **Culture** | Kebiasaan dan tradisi yang berkembang di masyarakat |
| **Religion** | Sistem kepercayaan yang muncul dari citizen |
| **Identity** | Identitas unik setiap citizen |

---

## 11. Success Metrics

EDEN berhasil jika:

- [ ] Dunia menghasilkan peristiwa tanpa skrip
- [ ] Citizen membangun hubungan sosial yang konsisten
- [ ] Sejarah dapat ditelusuri hingga akar penyebabnya
- [ ] Dunia tetap stabil dalam simulasi jangka panjang
- [ ] Pengguna dapat mengamati kehidupan yang terasa alami
- [ ] Economy muncul dari interaksi citizen, bukan dari script
- [ ] Politics berkembang dari hubungan sosial
- [ ] Culture dan religion muncul secara emergent

---

## 12. Design Guardrails

> **Constitution = aturan dunia**
> **Guardrails = aturan developer**

### Development Rules

1. **Jangan menambah fitur hanya karena terlihat keren**
2. **Selalu utamakan emergence dibanding kompleksitas**
3. **Jangan mengoptimasi performa sebelum sistem benar**
4. **Jangan memakai LLM jika solusi deterministik sudah cukup**
5. **Semua fitur harus bisa diskalakan**
6. **Bangun sistem terkecil yang berfungsi, validasi, dokumentasi, commit, push**

### Documentation Rules

- EDEN menggunakan pendekatan **documentation-first**
- Setiap fitur harus didokumentasikan sebelum atau bersamaan dengan implementasi
- Dokumentasi harus selalu mencerminkan kondisi terbaru dari sistem
- Tidak boleh ada implementasi yang menyebabkan dokumentasi tertinggal

### Commit Rules

Maksimal 3 perubahan logis sebelum:
1. Memastikan kode buildable
2. Memperbarui dokumentasi
3. Membuat commit dengan pesan deskriptif
4. Push ke branch aktif

### Working State Rules

- Repository harus selalu dalam kondisi **buildable**
- Hindari meninggalkan kode yang rusak
- Hotfix lebih diprioritaskan daripada fitur baru

---

## Changelog

| Date | Version | Change |
|------|---------|--------|
| 2026-07-17 | 0.1.0 | Initial documentation finalization |
