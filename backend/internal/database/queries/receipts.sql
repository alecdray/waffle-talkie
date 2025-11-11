-- name: CreateReceipt :one
INSERT INTO audio_message_receipts (audio_message_id, user_id)
VALUES (?, ?)
RETURNING *;

-- name: GetReceipt :one
SELECT * FROM audio_message_receipts
WHERE audio_message_id = ? AND user_id = ?;

-- name: ListReceiptsByMessage :many
SELECT * FROM audio_message_receipts
WHERE audio_message_id = ?
ORDER BY received_at DESC;

-- name: ListReceiptsByUser :many
SELECT * FROM audio_message_receipts
WHERE user_id = ?
ORDER BY received_at DESC;

-- name: CountReceiptsByMessage :one
SELECT COUNT(*) as count
FROM audio_message_receipts
WHERE audio_message_id = ?;

-- name: GetUnreceivedMessagesByUser :many
SELECT am.*
FROM audio_messages am
WHERE am.deleted_at IS NULL
  AND am.id NOT IN (
    SELECT amr.audio_message_id
    FROM audio_message_receipts amr
    WHERE amr.user_id = ?
  )
ORDER BY am.created_at DESC;
