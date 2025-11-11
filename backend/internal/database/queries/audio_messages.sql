-- name: CreateAudioMessage :one
INSERT INTO audio_messages (id, sender_user_id, file_path, duration)
VALUES (?, ?, ?, ?)
RETURNING *;

-- name: GetAudioMessage :one
SELECT * FROM audio_messages
WHERE id = ? AND deleted_at IS NULL;

-- name: ListAudioMessages :many
SELECT * FROM audio_messages
WHERE deleted_at IS NULL
ORDER BY created_at DESC;

-- name: ListAudioMessagesBySender :many
SELECT * FROM audio_messages
WHERE sender_user_id = ? AND deleted_at IS NULL
ORDER BY created_at DESC;

-- name: GetActiveAudioMessages :many
SELECT * FROM audio_messages
WHERE deleted_at IS NULL
  AND (
    -- Not older than 7 days
    created_at > datetime('now', '-7 days')
  )
ORDER BY created_at DESC;

-- name: SoftDeleteAudioMessage :exec
UPDATE audio_messages
SET deleted_at = CURRENT_TIMESTAMP
WHERE id = ?;

-- name: DeleteAudioMessage :exec
DELETE FROM audio_messages
WHERE id = ?;

-- name: GetOldOrFullyReceivedMessages :many
SELECT am.*
FROM audio_messages am
WHERE am.deleted_at IS NULL
  AND (
    -- Older than 7 days
    am.created_at <= datetime('now', '-7 days')
    OR
    -- All approved users have received it
    (
      SELECT COUNT(DISTINCT u.id)
      FROM users u
      WHERE u.approved = TRUE
    ) = (
      SELECT COUNT(*)
      FROM audio_message_receipts amr
      WHERE amr.audio_message_id = am.id
    )
  );
