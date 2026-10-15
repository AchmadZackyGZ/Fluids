# FLUIDS — Workspace Instructions

> File ini adalah **pointer** untuk agent (Gemini / Antigravity / Codex).
> Isi utamanya cuma satu: arahkan ke source-of-truth styling & konteks project.

## 1. Styling UI — source of truth

Aturan styling, token visual, dan panduan desain untuk project FLUIDS didefinisikan secara terpusat di:

👉 **`.agents/rules/design-tokens.md`**

Rujuk file tersebut sebagai **satu-satunya sumber kebenaran** (*single source of truth*) sebelum men-generate atau merevisi komponen UI. Jangan improvisasi warna, gradient, glow, atau tipografi di luar yang didefinisikan di sana.

> ⚠️ **Design `/web` sudah final.** Jangan mengubah desain yang sudah jadi — `design-tokens.md` berlaku untuk komponen **baru** dan untuk menjaga konsistensi, bukan alasan untuk me-redesign halaman yang sudah selesai.

## 2. Konteks project — baca ini juga

| File | Isi |
|---|---|
| `AGENTS.md` | Konteks lengkap: alur branch, stack, struktur modul, konvensi, jebakan, **status pekerjaan terkini** |
| `PLAN.md` | Keputusan arsitektur + roadmap (ADR style) |
| `ARCHITECTURE_DOCUMENTATION.md` | Referensi teknis detail arsitektur aktual |
| `TODO.md` | Status task per-minggu |

**Urutan baca yang disarankan:** `AGENTS.md` → `PLAN.md` → `ARCHITECTURE_DOCUMENTATION.md` → `TODO.md`.

## 3. Aturan wajib (ringkas)

1. Kerjakan semua perubahan di branch **`dev-zacky`**, naik ke `dev` → `staging` → `main` **hanya lewat Pull Request**.
2. Komunikasi antar modul backend **hanya lewat `contracts/`** (`errors.go` + `<nama>_contract.go`). Dilarang import `internal/` modul lain.
3. Jangan pernah commit `.env` atau kredensial.
4. Jangan hapus folder `.workbuddy-ai/`.

Detail lengkap ada di `AGENTS.md` bagian 4, 5, dan 11.
