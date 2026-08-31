-- 1. Tabel Utama Notifikasi (Instagram-Style Flyout + Badge Counter)
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    actor_id UUID REFERENCES users(id) ON DELETE SET NULL,

    entity_type VARCHAR(50) NOT NULL
        CHECK (entity_type IN ('like', 'comment', 'follow', 'mention')),
    entity_id UUID,

    actor_avatar_url TEXT NOT NULL DEFAULT '',
    actor_username VARCHAR(50) NOT NULL DEFAULT '',

    caption TEXT NOT NULL DEFAULT '',

    read_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_recipient
    ON notifications(recipient_id, created_at DESC);

CREATE INDEX idx_notifications_unread
    ON notifications(recipient_id)
    WHERE read_at IS NULL;

CREATE INDEX idx_notifications_read_status
    ON notifications(recipient_id, read_at)
    WHERE read_at IS NULL;