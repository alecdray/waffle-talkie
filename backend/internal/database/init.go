package database

import (
	"database/sql"
	"fmt"
	"log/slog"
	"os"
	"path/filepath"

	_ "github.com/mattn/go-sqlite3"
	"github.com/pressly/goose/v3"
)

// InitDB creates the database file if needed, applies schema, and returns queries.
func InitDB(dbPath string) (*sql.DB, *Queries, error) {
	if _, err := os.Stat(dbPath); os.IsNotExist(err) {
		slog.Info("creating new database file", "path", dbPath)

		dbDir := filepath.Dir(dbPath)
		if err := os.MkdirAll(dbDir, 0755); err != nil {
			return nil, nil, fmt.Errorf("failed to create database directory: %w", err)
		}

		file, err := os.Create(dbPath)
		if err != nil {
			return nil, nil, fmt.Errorf("failed to create database file: %w", err)
		}

		file.Close()
	}

	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to open database: %w", err)
	}

	if err := db.Ping(); err != nil {
		return nil, nil, fmt.Errorf("failed to ping database: %w", err)
	}

	if err := goose.SetDialect("sqlite3"); err != nil {
		return nil, nil, fmt.Errorf("failed to set goose dialect: %w", err)
	}

	if err := goose.Up(db, "./internal/database/migrations"); err != nil {
		return nil, nil, fmt.Errorf("failed to run migrations: %w", err)
	}

	slog.Info("database initialized successfully", "path", dbPath)

	queries := New(db)
	return db, queries, nil
}
