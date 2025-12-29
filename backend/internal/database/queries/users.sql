-- name: CreateUser :one
INSERT INTO users (id, name, device_id, approved)
VALUES (?, ?, ?, ?)
RETURNING *;

-- name: GetUser :one
SELECT * FROM users
WHERE id = ?;

-- name: GetUserByDeviceID :one
SELECT * FROM users
WHERE device_id = ?;

-- name: ListUsers :many
SELECT * FROM users
ORDER BY created_at DESC;

-- name: ListApprovedUsers :many
SELECT * FROM users
WHERE approved = TRUE
ORDER BY created_at DESC;

-- name: ApproveUser :exec
UPDATE users
SET approved = TRUE
WHERE id = ?;

-- name: UpdateUserLastActive :exec
UPDATE users
SET last_active = CURRENT_TIMESTAMP
WHERE id = ?;

-- name: DeleteUser :exec
DELETE FROM users
WHERE id = ?;

-- name: UpdateUserName :exec
UPDATE users
SET name = ?
WHERE id = ?;
