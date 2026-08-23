-- name: CreatePost :one
INSERT INTO posts (author_id, post_type, caption)
VALUES ($1, $2, $3)
RETURNING *;

-- name: CreatePostCodeSnippet :one
INSERT INTO post_code_snippets (post_id, language, file_name, code_content)
VALUES ($1, $2, $3, $4)
RETURNING *;

-- name: CreatePostMedia :one
INSERT INTO post_media (post_id, media_url, media_type, display_order)
VALUES ($1, $2, $3, $4)
RETURNING *;

-- name: GetPostByID :one
SELECT * FROM posts
WHERE id = $1;

-- name: ListCodeSnippetsByPostID :many
SELECT * FROM post_code_snippets
WHERE post_id = $1
ORDER BY created_at ASC;

-- name: ListMediaByPostID :many
SELECT * FROM post_media
WHERE post_id = $1
ORDER BY display_order ASC;

-- name: ListFeed :many
-- Keyset pagination: kirim created_at dari post TERAKHIR yang sudah diterima client.
-- Untuk load pertama kali, kirim waktu sekarang (NOW()) dari sisi aplikasi Go.
SELECT * FROM posts
WHERE created_at < $1
  AND (sqlc.narg('post_type')::varchar IS NULL OR post_type = sqlc.narg('post_type'))
ORDER BY created_at DESC
LIMIT $2;

-- name: UpdatePostCaption :one
UPDATE posts
SET caption = $2
WHERE id = $1
RETURNING *;

-- name: DeletePost :exec
DELETE FROM posts
WHERE id = $1;

-- name: IncrementLikesCount :exec
UPDATE posts
SET likes_count = likes_count + 1
WHERE id = $1;

-- name: DecrementLikesCount :exec
UPDATE posts
SET likes_count = likes_count - 1
WHERE id = $1 AND likes_count > 0;

-- name: IncrementCommentsCount :exec
UPDATE posts
SET comments_count = comments_count + 1
WHERE id = $1;

-- name: IncrementSharesCount :exec
UPDATE posts
SET shares_count = shares_count + 1
WHERE id = $1;