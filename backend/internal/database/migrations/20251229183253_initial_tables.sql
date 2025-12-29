-- +goose Up
-- +goose StatementBegin

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    device_id_hash TEXT NOT NULL,
    approved BOOLEAN NOT NULL DEFAULT FALSE,
    last_active DATETIME,
    role TEXT NOT NULL DEFAULT 'user',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_device_id_hash ON users(device_id_hash);
CREATE INDEX IF NOT EXISTS idx_users_approved ON users(approved);

-- Audio messages table
CREATE TABLE IF NOT EXISTS audio_messages (
    id TEXT PRIMARY KEY,
    sender_user_id TEXT NOT NULL,
    file_path TEXT NOT NULL,
    duration INTEGER NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME,
    FOREIGN KEY (sender_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_audio_messages_sender ON audio_messages(sender_user_id);
CREATE INDEX IF NOT EXISTS idx_audio_messages_created ON audio_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_audio_messages_deleted ON audio_messages(deleted_at);

-- Audio message receipts table
CREATE TABLE IF NOT EXISTS audio_message_receipts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    audio_message_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    received_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (audio_message_id) REFERENCES audio_messages(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(audio_message_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_receipts_message ON audio_message_receipts(audio_message_id);
CREATE INDEX IF NOT EXISTS idx_receipts_user ON audio_message_receipts(user_id);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS audio_message_receipts;
DROP TABLE IF EXISTS audio_messages;
DROP TABLE IF EXISTS users;
-- +goose StatementEnd
