package database

import (
	"database/sql"
	"fmt"
	"log/slog"
	"os"

	_ "github.com/mattn/go-sqlite3"
)

// InitDB initializes the database connection and runs migrations
func InitDB(dbPath string) (*sql.DB, *Queries, error) {
	// Create database file if it doesn't exist
	if _, err := os.Stat(dbPath); os.IsNotExist(err) {
		slog.Info("creating new database file", "path", dbPath)
		file, err := os.Create(dbPath)
		if err != nil {
			return nil, nil, fmt.Errorf("failed to create database file: %w", err)
		}
		file.Close()
	}

	// Open database connection
	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to open database: %w", err)
	}

	// Test connection
	if err := db.Ping(); err != nil {
		return nil, nil, fmt.Errorf("failed to ping database: %w", err)
	}

	// Run migrations
	if err := runMigrations(db); err != nil {
		return nil, nil, fmt.Errorf("failed to run migrations: %w", err)
	}

	slog.Info("database initialized successfully", "path", dbPath)

	// Create and return Queries instance
	queries := New(db)
	return db, queries, nil
}

// runMigrations executes the schema migrations
func runMigrations(db *sql.DB) error {
	schema := `
-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    device_id TEXT NOT NULL UNIQUE,
    approved INTEGER NOT NULL DEFAULT 0,
    last_active DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Audio messages table
CREATE TABLE IF NOT EXISTS audio_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_user_id INTEGER NOT NULL,
    file_path TEXT NOT NULL,
    duration INTEGER NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME,
    FOREIGN KEY (sender_user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Audio message receipts table
CREATE TABLE IF NOT EXISTS audio_message_receipts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    audio_message_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
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
`

	_, err := db.Exec(schema)
	if err != nil {
		return fmt.Errorf("failed to execute schema: %w", err)
	}

	slog.Info("database migrations completed successfully")
	return nil
}
