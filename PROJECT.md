1. Project Identity ⭐⭐⭐⭐⭐

Berisi

Project Name
Codename
Tagline
Current Version
Status
Repository
2. Vision

Menjelaskan

Apa itu EDEN.

Kenapa dibuat.

Masalah apa yang ingin diselesaikan.

Apa mimpi besarnya.

3. Mission

Target jangka pendek.

Target jangka panjang.

Misalnya

v0.1

Membuat satu Citizen hidup.

v1

Membuat satu desa hidup.

v5

Artificial Society Engine.

4. Philosophy ⭐⭐⭐⭐⭐

Ini yang sudah kita diskusikan.

Contohnya

EDEN bukan game.

EDEN bukan simulator.

EDEN adalah dunia hidup.

Kemudian

Semua citizen bebas melakukan apa saja.

Tidak ada scripted event.

Emergence adalah prioritas.

History tidak boleh dipalsukan.

Developer tidak menentukan hasil simulasi.

5. North Star

Satu kalimat.

Misalnya

Everything in EDEN must emerge from agent decisions or world rules, never from scripted events.

6. EDEN Constitution ⭐⭐⭐⭐⭐

10–15 aturan mutlak.

Misalnya

Tidak ada scripted event.
Semua citizen adalah AI.
Semua keputusan harus bisa dijelaskan.
Semua perubahan dunia harus memiliki sebab.
Dunia berjalan walaupun tidak ada user.
Developer tidak boleh mengintervensi simulasi.
History bersifat immutable (tidak boleh diubah tanpa alasan teknis yang jelas).
Emergence selalu diutamakan dibanding scripting.
7. Core Principles

Misalnya

Citizen First

↓

Semua sistem dibuat untuk citizen.

Bukan untuk UI.

History Matters

↓

Semua keputusan meninggalkan jejak.

Memory Shapes Reality

↓

Memory mengubah masa depan.

Every Life Matters

↓

Citizen biasa sama pentingnya dengan raja.

Explainability

↓

AI harus bisa menjelaskan alasan tindakannya.

8. Project Scope

Yang termasuk.

Misalnya

✅ Society

✅ Economy

✅ Politics

✅ Memory

Yang tidak termasuk.

❌ Multiplayer

❌ MMORPG

❌ PvP

❌ Quest scripting

❌ Story campaign

9. Long-term Vision

Misalnya

v1

Village

↓

v2

City

↓

v3

Kingdom

↓

v4

Civilization

↓

v5

Artificial Society Engine

↓

v6

Research Platform

10. Glossary

Menurutku ini WAJIB.

Misalnya

Citizen

Settlement

World Tick

Memory

Drive

Goal

Reflection

Emergence

History

Influence

Trust

Reputation

Legacy

Simulation

Knowledge

Culture

Religion

Identity

Semua istilah punya definisi resmi.

11. Success Metrics

Bagaimana kita tahu EDEN berhasil?

Contohnya:

Dunia menghasilkan peristiwa tanpa skrip.
Citizen membangun hubungan sosial yang konsisten.
Sejarah dapat ditelusuri hingga akar penyebabnya.
Dunia tetap stabil dalam simulasi jangka panjang.
Pengguna dapat mengamati kehidupan yang terasa alami.
12. Design Guardrails ⭐⭐⭐⭐⭐

Ini berbeda dari Constitution.

Constitution = aturan dunia.

Guardrails = aturan developer.

Misalnya

Jangan menambah fitur hanya karena terlihat keren.
Selalu utamakan emergence dibanding kompleksitas.
Jangan mengoptimasi performa sebelum sistem benar.
Jangan memakai LLM jika solusi deterministik sudah cukup.
Semua fitur harus bisa diskalakan.

Development Principles
Continuous Documentation

EDEN menggunakan pendekatan documentation-first. Setiap fitur harus didokumentasikan sebelum atau bersamaan dengan implementasi. Dokumentasi harus selalu mencerminkan kondisi terbaru dari sistem.

Small Increment Policy

Pengembangan dilakukan dalam perubahan kecil yang memiliki tujuan jelas (logical changes). Hindari menggabungkan banyak fitur besar dalam satu commit.

Commit & Push Policy

Untuk menjaga histori pengembangan tetap bersih dan mudah ditelusuri, setiap maksimal tiga perubahan logis harus segera:

Memastikan kode berada dalam kondisi buildable.
Memperbarui dokumentasi yang terdampak.
Membuat commit dengan pesan yang deskriptif mengikuti format proyek.
Melakukan push ke branch aktif di GitHub.

Jangan menunggu hingga banyak perubahan menumpuk sebelum melakukan commit.

Documentation Sync Rule

Tidak boleh ada implementasi yang menyebabkan dokumentasi tertinggal jauh. Jika suatu perubahan mengubah perilaku sistem, dokumentasi terkait harus diperbarui sebelum perubahan dianggap selesai.

Working State Rule

Repository harus selalu berada dalam kondisi yang dapat dibangun (buildable state). Hindari meninggalkan kode yang rusak atau fitur setengah jadi dalam branch utama maupun branch pengembangan.