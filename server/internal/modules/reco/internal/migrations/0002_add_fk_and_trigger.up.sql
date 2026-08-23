-- Jalankan SETELAH migration modul content (0001_content_init) ter-apply,
-- karena FK ke posts(id) butuh tabel itu sudah ada.

ALTER TABLE user_embeddings
    ADD CONSTRAINT fk_user_embeddings_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE item_embeddings
    ADD CONSTRAINT fk_item_embeddings_post
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE;

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_user_embeddings_updated_at
    BEFORE UPDATE ON user_embeddings
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();