-- name: GetTopRecommendedPosts :many
SELECT post_id, 1 - (embedding <=> $1) AS similarity_score
FROM item_embeddings
ORDER BY embedding <=> $1
LIMIT $2;

-- name: UpsertUserEmbedding :exec
INSERT INTO user_embeddings (user_id, embedding, updated_at)
VALUES ($1, $2, NOW())
ON CONFLICT (user_id) DO UPDATE
SET embedding = EXCLUDED.embedding, updated_at = NOW();