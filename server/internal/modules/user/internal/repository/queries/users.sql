-- name: CreateUser :one
INSERT INTO users (
    username,
    email,
    password_hash,
    full_name
) VALUES (
    $1, $2, $3, $4
)
RETURNING id, username, email, full_name, bio, avatar_url, created_at, updated_at;

-- name: GetUserByEmail :one
SELECT id, username, email, full_name, bio, avatar_url, created_at, updated_at
FROM users
WHERE email = $1 LIMIT 1;

-- name: GetUserByID :one
SELECT id, username, email, full_name, bio, avatar_url, created_at, updated_at
from users
where id = $1 LIMIT 1;

-- name: GetUserByUsername :one
SELECT id, username, email, full_name, bio, avatar_url, created_at, updated_at
FROM users
WHERE username = $1 LIMIT 1;
