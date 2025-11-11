package audio

import (
	"context"
	"log/slog"
	"time"

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
	slog.Info("starting audio tasks")
	go func() {
		for {
			select {
			case <-ctx.Done():
				return
			case <-time.After(time.Minute):
				err := tm.CleanUpAudioFiles(ctx)
				if err != nil {
					slog.Error("failed to clean up audio files", "error", err)
				}
			}
		}
	}()
	return nil
}

func (tm *TaskManager) CleanUpAudioFiles(ctx context.Context) error {
	return nil
}
