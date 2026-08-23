-- 1. Follow User (ON CONFLICT DO NOTHING agar jika di-klik 2x tidak error)
-- name: FollowUser :exec
INSERT INTO follows (follower_id, following_id)
VALUES ($1, $2)
ON CONFLICT DO NOTHING;

-- 2. Unfollow User
-- name: UnfollowUser :exec
DELETE FROM follows
WHERE follower_id = $1 AND following_id = $2;

-- 3. Cek Apakah User A Mem-follow User B (Status: Sudah Follow / Belum)
-- name: IsFollowing :one
SELECT EXISTS(
    SELECT 1 FROM follows
    WHERE follower_id = $1 AND following_id = $2
);

-- 4. Ambil Daftar Followers (Siapa yang mem-follow saya)
-- name: GetFollowers :many
SELECT u.id, u.username, u.full_name, u.avatar_url, u.bio, f.created_at as followed_at
FROM follows f
JOIN users u ON u.id = f.follower_id
WHERE f.following_id = $1
ORDER BY f.created_at DESC
LIMIT $2 OFFSET $3;

-- 5. Ambil Daftar Following (Siapa yang saya ikuti)
-- name: GetFollowing :many
SELECT u.id, u.username, u.full_name, u.avatar_url, u.bio, f.created_at as followed_at
FROM follows f
JOIN users u ON u.id = f.following_id
WHERE f.follower_id = $1
ORDER BY f.created_at DESC
LIMIT $2 OFFSET $3;

-- 6. Hitung Total Followers & Following untuk Profil
-- name: CountFollowers :one
SELECT COUNT(*) FROM follows WHERE following_id = $1;

-- name: CountFollowing :one
SELECT COUNT(*) FROM follows WHERE follower_id = $1;

-- 7. Simpan Bookmark Postingan / Snippet
-- name: CreateBookmark :exec
INSERT INTO bookmarks (user_id, post_id)
VALUES ($1, $2)
ON CONFLICT DO NOTHING;

-- 8. Hapus Bookmark
-- name: DeleteBookmark :exec
DELETE FROM bookmarks
WHERE user_id = $1 AND post_id = $2;

-- 9. Cek Apakah Postingan Sudah di-Bookmark
-- name: IsBookmarked :one
SELECT EXISTS(
    SELECT 1 FROM bookmarks
    WHERE user_id = $1 AND post_id = $2
);

-- 10. Ambil Daftar Postingan yang di-Bookmark oleh User
-- name: ListBookmarks :many
SELECT p.id, p.author_id, p.post_type, p.caption, p.likes_count, p.comments_count, p.shares_count, p.created_at, b.created_at as bookmarked_at
FROM bookmarks b
JOIN posts p ON p.id = b.post_id
WHERE b.user_id = $1
ORDER BY b.created_at DESC
LIMIT $2 OFFSET $3;

-- 11. Update Akun GitHub User
-- name: UpdateGithubUsername :one
UPDATE users
SET github_username = $2
WHERE id = $1
RETURNING id, username, github_username;

-- 12. Ambil Username GitHub User untuk Sinkronisasi Heatmap
-- name: GetGithubUsername :one
SELECT id, username, github_username
FROM users
WHERE username = $1;