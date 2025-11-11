package main

import (
	"fmt"
	"log/slog"
	"net/http"
	"os"

	"github.com/alecdray/waffle-talkie/internal/config"
	"github.com/alecdray/waffle-talkie/internal/database"
	"github.com/alecdray/waffle-talkie/internal/server"
)

func main() {
	logger := slog.New(slog.NewTextHandler(os.Stdout, nil))
	slog.SetDefault(logger)

	db, queries, err := database.InitDB(config.Config.DatabasePath)
	if err != nil {
		slog.Error("failed to initialize database", "error", err)
		os.Exit(1)
	}
	defer db.Close()

	mux := server.NewServerMux(queries, config.Config.JWTSecret)
	serverAddress := fmt.Sprintf("%s:%s", "", config.Config.Port)
	slog.Info("starting server", "address", serverAddress)
	err = http.ListenAndServe(serverAddress, mux)
	if err != nil {
		slog.Error("failed to start server", "error", err)
		return
	}
}
