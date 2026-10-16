-- name: CreateUser :one
INSERT INTO users (
    username,
    email,
    password_hash,
    full_name
) VALUES (
    $1, $2, $3, $4
)
RETURNING id, username, email, full_name, bio, avatar_url,
          email_verified, created_at, updated_at;

-- name: GetUserByEmail :one
SELECT id, username, email, password_hash, full_name, bio, avatar_url,
       email_verified, created_at, updated_at
FROM users
WHERE email = $1 AND deleted_at IS NULL
LIMIT 1;

-- name: GetUserByID :one
SELECT id, username, email, password_hash, full_name, bio, avatar_url,
       email_verified, created_at, updated_at
FROM users
WHERE id = $1 AND deleted_at IS NULL
LIMIT 1;

-- name: GetUserByUsername :one
SELECT id, username, email, full_name, bio, avatar_url,
       email_verified, created_at, updated_at
FROM users
WHERE username = $1 AND deleted_at IS NULL
LIMIT 1;

-- ============================================================
-- Step B: dipakai modul auth
-- ============================================================

-- name: UpdateUserPassword :execrows
UPDATE users
SET password_hash = $2,
    updated_at    = CURRENT_TIMESTAMP
WHERE id = $1
  AND deleted_at IS NULL;

-- name: UpdateUserEmailVerified :execrows
UPDATE users
SET email_verified = $2,
    updated_at     = CURRENT_TIMESTAMP
WHERE id = $1
  AND deleted_at IS NULL;

-- name: SoftDeleteUser :execrows
UPDATE users
SET deleted_at = CURRENT_TIMESTAMP,
    updated_at = CURRENT_TIMESTAMP
WHERE id = $1
  AND deleted_at IS NULL;
