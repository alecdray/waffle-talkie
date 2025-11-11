package main

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"os"

	"github.com/alecdray/waffle-talkie/internal/config"
	"github.com/alecdray/waffle-talkie/internal/database"
	"github.com/alecdray/waffle-talkie/internal/server"
)

func main() {
	ctx := context.Background()
	ctx, cancel := context.WithCancel(ctx)
	defer cancel()

	logger := slog.New(slog.NewTextHandler(os.Stdout, nil))
	slog.SetDefault(logger)

	db, queries, err := database.InitDB(config.Config.DatabasePath)
	if err != nil {
		slog.Error("failed to initialize database", "error", err)
		os.Exit(1)
	}
	defer db.Close()

	taskManager := server.NewTaskManager(queries, config.Config.AudioDirectory)
	err = taskManager.Start(ctx)
	if err != nil {
		slog.Error("failed to start task manager", "error", err)
		os.Exit(1)
	}

	mux := server.NewServerMux(queries, config.Config.JWTSecret, config.Config.AudioDirectory)
	serverAddress := fmt.Sprintf("%s:%s", "", config.Config.Port)
	slog.Info("starting server", "address", serverAddress)
	err = http.ListenAndServe(serverAddress, mux)
	if err != nil {
		slog.Error("failed to start server", "error", err)
		os.Exit(1)
	}
}
