package server

import (
	"context"
	"fmt"
	"log/slog"

	"github.com/alecdray/waffle-talkie/internal/audio"
	"github.com/alecdray/waffle-talkie/internal/database"
)

type TaskManager struct {
	queries        *database.Queries
	audioDirectory string
}

func NewTaskManager(queries *database.Queries, audioDirectory string) *TaskManager {
	return &TaskManager{
		queries:        queries,
		audioDirectory: audioDirectory,
	}
}

func (tm *TaskManager) Start(ctx context.Context) error {
	slog.Info("starting server tasks")
	audioTaskManager := audio.NewTaskManager(tm.queries, tm.audioDirectory)
	err := audioTaskManager.Start(ctx)
	if err != nil {
		return fmt.Errorf("failed to start audio task manager: %w", err)
	}
	return nil
}
