package main

import (
	"fmt"
	"log/slog"
	"net/http"
	"os"

	"github.com/alecdray/waffle-talkie/internal/config"
	"github.com/alecdray/waffle-talkie/internal/server"
)

func main() {
	logger := slog.New(slog.NewTextHandler(os.Stdout, nil))
	slog.SetDefault(logger)

	mux := server.NewServerMux()
	serverAddress := fmt.Sprintf("%s:%s", "", config.Config.Port)
	slog.Info("starting server", "address", serverAddress)
	err := http.ListenAndServe(serverAddress, mux)
	if err != nil {
		slog.Error("failed to start server", "error", err)
		return
	}
}
