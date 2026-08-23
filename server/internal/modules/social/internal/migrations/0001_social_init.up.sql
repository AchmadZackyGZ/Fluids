-- 1. Tambahkan kolom github_username ke tabel users jika belum ada
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS github_username VARCHAR(100) NOT NULL DEFAULT '';

-- 2. Tabel Follows (Social Graph)
CREATE TABLE IF NOT EXISTS follows (
    follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (follower_id, following_id),
    -- Cegah user mem-follow akunnya sendiri
    CONSTRAINT chk_no_self_follow CHECK (follower_id <> following_id)
);

-- 3. Tabel Bookmarks (Postingan / Snippet Tersimpan)
CREATE TABLE IF NOT EXISTS bookmarks (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, post_id)
);

-- Indexing untuk kecepatan query daftar followers, following, dan bookmarks
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_created_at ON bookmarks(created_at DESC);