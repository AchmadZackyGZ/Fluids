CREATE TABLE IF NOT EXIST user_embeddings (
    user_id UUID PRIMARY KEY,
    embedding vector(128) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXIST item_embeddings (
    item_id UUID PRIMARY KEY,
    embedding vector(128) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index HNSW Cosine Similarity untuk pencarian rekomendasi berkecepatan tinggi
CREATE INDEX IF NOT EXIST idx_item_embeddings_hnsw
ON item_embeddings USING hnsw (embedding vector_cosine_ops);