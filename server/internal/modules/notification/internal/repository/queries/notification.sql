-- 1. Ambil Notifikasi berdasarkan Kategori (Support Filter: 'all', 'follow', 'like', 'comment', 'mention')
-- name: ListNotifications :many
SELECT 
    id,
    recipient_id,
    actor_id,
    entity_type,
    entity_id,
    actor_avatar_url,
    actor_username,
    caption,
    read_at,
    created_at
FROM notifications
WHERE recipient_id = $1
  AND (
      $4::text = 'all' 
      OR $4::text = '' 
      OR entity_type = $4::text
  )
ORDER BY created_at DESC
LIMIT $2 OFFSET $3;

-- 2. Hitung Total Notifikasi yang Belum Dibaca (Untuk Badge Lonceng 👤2)
-- name: CountUnreadNotifications :one
SELECT COUNT(*) 
FROM notifications
WHERE recipient_id = $1 
  AND read_at IS NULL;

-- 3. Tandai Satu Notifikasi Menjadi Sudah Dibaca (Mark as Read)
-- name: MarkNotificationAsRead :one
UPDATE notifications
SET read_at = CURRENT_TIMESTAMP
WHERE id = $1 AND recipient_id = $2
RETURNING id, recipient_id, read_at;

-- 4. Tandai SEMUA Notifikasi Menjadi Sudah Dibaca (Mark All as Read)
-- name: MarkAllNotificationsAsRead :exec
UPDATE notifications
SET read_at = CURRENT_TIMESTAMP
WHERE recipient_id = $1 AND read_at IS NULL;

-- 5. Helper: Simpan Notifikasi Baru (Akan dipanggil saat ada event Follow / Like / Comment)
-- name: CreateNotification :one
INSERT INTO notifications (
    recipient_id,
    actor_id,
    entity_type,
    entity_id,
    actor_avatar_url,
    actor_username,
    caption
) VALUES (
    $1, $2, $3, $4, $5, $6, $7
)
RETURNING *;