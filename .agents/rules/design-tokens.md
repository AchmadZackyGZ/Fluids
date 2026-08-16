---
name: design-tokens
description: FLUIDS Design Tokens & Visual Direction - source of truth for styling in FLUIDS.
trigger: always_on
---

# FLUIDS — Design Tokens & Visual Direction

Dokumen ini adalah sumber kebenaran (source of truth) untuk styling di project FLUIDS.
Setiap kali Antigravity men-generate atau merevisi komponen UI, **rujuk dokumen ini dulu**
sebelum menulis CSS/Tailwind baru. Jangan improvisasi warna, gradient, atau shadow di luar
yang didefinisikan di sini.

Jika Antigravity punya `taste-skill` dan `21st.dev` terpasang: gunakan token di bawah sebagai
constraint keras (hard constraint), bukan saran — dua skill itu bagus untuk komposisi/layout,
tapi palet warna dan tipografi harus tetap mengikuti file ini supaya konsisten di seluruh app.

---

## 0. Prinsip dasar (baca ini dulu)

FLUIDS adalah sosial media **untuk developer**, bukan aplikasi "cyberpunk/metaverse".
Identitas visualnya harus terasa seperti alat yang dipakai developer sungguhan — dekat
dengan estetika terminal, git diff, code editor, dan dashboard developer tools (GitHub,
Linear, Vercel, Raycast) — bukan sci-fi neon generic.

**Yang HARUS dihindari total** (ini yang bikin tampilan sekarang terasa "AI-generated"):
- Gradient di background tombol, avatar ring, atau card (`linear-gradient(cyan, purple)` dsb.) — dilarang, kecuali disebutkan eksplisit sebagai pengecualian di bawah.
- `box-shadow`/`filter` glow atau neon border.
- Istilah techno-buzzword tanpa makna fungsional ("Vectors", "Nodes", "Sync %").
- Bio/copy yang bombastis dan abstrak ("exploring the void between cognition and synthetic consciousness").
- Radius, shadow, dan spacing yang identik di semua komponen tanpa variasi yang disengaja.

---

## 1. Warna

Base gelap netral (bukan hitam pekat, bukan biru-keunguan seperti sekarang) + **satu**
warna aksen fungsional + warna semantik dari dunia developer (diff hijau/merah).

| Token | Hex | Peran |
|---|---|---|
| `--bg-canvas` | `#0D0E10` | Background utama (bukan hitam pekat #000, sedikit hangat) |
| `--bg-surface` | `#17181B` | Card, panel, sidebar |
| `--bg-surface-raised` | `#1F2023` | Elemen di atas surface (modal, dropdown) |
| `--border-default` | `#2A2B2F` | Border hairline 1px, default |
| `--border-strong` | `#3A3B40` | Border saat hover/focus |
| `--text-primary` | `#EDEDEF` | Teks utama |
| `--text-secondary` | `#9A9AA2` | Teks sekunder, metadata |
| `--text-muted` | `#5F5F66` | Placeholder, disabled |
| `--accent` | `#E8A33D` | **Satu-satunya warna aksen** — amber terminal-prompt, dipakai untuk CTA, link aktif, highlight. Solid, tanpa gradient. |
| `--accent-muted` | `#3D3115` | Background untuk badge/pill beraksen (bukan solid accent penuh) |
| `--diff-add` | `#3FB68B` | Sukses, follow, kontribusi positif — terinspirasi warna `+` di git diff |
| `--diff-remove` | `#D9645A` | Error, delete, warning |

**Kenapa amber, bukan cyan/purple:** cyan-ke-purple adalah default paling umum dari AI
image/UI generator saat ini — begitu dilihat orang langsung mengenali "ini generate-an".
Amber terminal-prompt (`#E8A33D`) jarang dipakai, dan punya makna kontekstual (warna
kursor/prompt di banyak terminal color scheme) yang relevan untuk audiens developer.

**Aturan pemakaian aksen:** `--accent` HANYA untuk 1 elemen call-to-action per layar
(misal tombol utama "Post" atau tab aktif). Jangan sebar ke avatar ring, semua ikon,
dan semua border sekaligus seperti desain sekarang.

---

## 2. Tipografi

Dua typeface, dua peran yang jelas — bukan satu sans generic dipakai untuk semuanya.

| Role | Font | Alasan |
|---|---|---|
| **Display / heading** | `Inter Tight` atau `General Sans` (weight 600) | Sans modern tapi bukan default `Inter` biasa yang terlalu sering dipakai starter template |
| **Body / UI text** | `Inter` (weight 400–500) | Netral, sangat legible untuk UI padat |
| **Signature / data** | `JetBrains Mono` atau `Berkeley Mono` | Dipakai KHUSUS untuk: timestamp, username/handle, angka statistik, snippet kode, label metadata. Ini elemen signature FLUIDS — bikin semua data terasa seperti log/terminal output, relevan untuk platform developer. |

**Skala ukuran** (jangan bikin skala baru per komponen):
`12px` (caption/mono metadata) · `14px` (body) · `16px` (body besar) · `20px` (heading kecil) · `28px` (heading besar)

Contoh penerapan monospace signature: `10m ago · Go Backend Server` di post card,
`14.2k followers`, `42 day streak` — semua angka dan metadata pakai `JetBrains Mono`,
bukan sans biasa. Ini yang membedakan FLUIDS dari sosmed generic.

---

## 3. Layout & komponen

- **Radius**: `4px` untuk elemen kecil (badge, input), `8px` untuk card, `12px` untuk modal/panel besar. Jangan pakai radius besar (16px+) di semua tempat — variasikan sesuai ukuran elemen.
- **Border, bukan shadow**: gunakan `1px solid var(--border-default)` untuk memisahkan elemen, bukan `box-shadow`. Shadow hanya untuk elemen yang benar-benar melayang (dropdown, modal) dengan intensitas tipis (`0 4px 12px rgba(0,0,0,0.3)`, tanpa warna/glow).
- **Avatar**: lingkaran solid dengan border 1px `--border-default`. Border menyala (glow ring) HANYA untuk indikator "live/aktif" — bukan default semua avatar.
- **Heatmap kontribusi**: gunakan skala monokrom dari `--bg-surface` sampai `--accent` (bukan gradasi cyan pelangi). 4 level cukup: `--bg-surface` → `--border-strong` → `--accent-muted` → `--accent`.

## 4. Copy / microcopy

- Tulis dari sudut pandang developer asli: spesifik, teknis, sedikit self-deprecating humor — bukan puitis/abstrak.
- Label harus menjelaskan fungsi nyata. Kalau tidak bisa dijelaskan dalam satu kalimat apa gunanya (contoh: "Sync 98%"), hapus elemennya.
- Bio contoh yang lebih grounded: `"Backend @ FLUIDS. Go, Postgres, kadang panik jam 2 pagi karena race condition."` — bandingkan dengan bio lama yang generic-poetic.

## 5. Yang boleh dieksplorasi (bukan larangan mutlak)

- Micro-interaction halus (hover state, transisi 150ms ease) — boleh, asal tidak berlebihan.
- Satu elemen signature per halaman boleh sedikit "berani" (misal cursor blink animation di search bar, terinspirasi terminal caret) — tapi HANYA satu elemen, sisanya tetap tenang.

---

## Checklist review sebelum accept hasil generate Antigravity

- [ ] Tidak ada `linear-gradient` di background tombol/avatar/card
- [ ] Tidak ada glow/neon shadow
- [ ] Aksen warna (`--accent`) muncul maksimal di 1-2 elemen per layar
- [ ] Metadata/angka pakai monospace, bukan sans
- [ ] Copy tidak pakai buzzword tanpa makna fungsional
- [ ] Radius dan shadow bervariasi sesuai jenis elemen, bukan seragam semua
