-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    device_id TEXT NOT NULL UNIQUE,
    approved BOOLEAN NOT NULL DEFAULT FALSE,
    last_active DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

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

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_users_device_id ON users(device_id);
CREATE INDEX IF NOT EXISTS idx_users_approved ON users(approved);
CREATE INDEX IF NOT EXISTS idx_audio_messages_sender ON audio_messages(sender_user_id);
CREATE INDEX IF NOT EXISTS idx_audio_messages_created ON audio_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_audio_messages_deleted ON audio_messages(deleted_at);
CREATE INDEX IF NOT EXISTS idx_receipts_message ON audio_message_receipts(audio_message_id);
CREATE INDEX IF NOT EXISTS idx_receipts_user ON audio_message_receipts(user_id);
