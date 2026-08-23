DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
-- Function set_updated_at() TIDAK di-drop di sini,
-- karena kemungkinan masih dipakai modul content/reco.