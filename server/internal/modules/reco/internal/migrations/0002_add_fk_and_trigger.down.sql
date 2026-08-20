DROP TRIGGER IF EXISTS trg_user_embeddings_updated_at ON user_embeddings;
ALTER TABLE item_embeddings DROP CONSTRAINT IF EXISTS fk_item_embeddings_post;
ALTER TABLE user_embeddings DROP CONSTRAINT IF EXISTS fk_user_embeddings_user;