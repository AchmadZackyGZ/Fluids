-- Menambah kolom yang dibutuhkan modul auth
-- untuk verifikasi email & soft delete akun.

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Index parsial: query tetap cepat saat data sudah besar,
-- karena hanya meng-index user yang BELUM dihapus.
CREATE INDEX IF NOT EXISTS idx_users_deleted_at
    ON users (deleted_at)
    WHERE deleted_at IS NOT NULL;

-- Index untuk cek email terverifikasi (mis. cron kirim reminder).
CREATE INDEX IF NOT EXISTS idx_users_email_verified
    ON users (email_verified)
    WHERE email_verified = FALSE;
