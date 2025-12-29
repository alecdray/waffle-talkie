package server

import (
	"encoding/json"
	"net/http"

	"github.com/alecdray/waffle-talkie/internal/admin"
	"github.com/alecdray/waffle-talkie/internal/audio"
	"github.com/alecdray/waffle-talkie/internal/auth"
	"github.com/alecdray/waffle-talkie/internal/database"
	"github.com/alecdray/waffle-talkie/internal/users"
)

func NewMux(queries *database.Queries, jwtSecret string, audioDirectory string) http.Handler {
	rootMux := http.NewServeMux()

	authHandler := auth.NewHandler(queries, jwtSecret)
	audioHandler := audio.NewHandler(queries, audioDirectory)
	usersHandler := users.NewHandler(queries)
	adminHandler := admin.NewHandler(queries)

	rootMux.HandleFunc("/health", handleHealth)

	authMux := http.NewServeMux()
	authMuxPrefix := "/auth"
	rootMux.Handle(authMuxPrefix, authMux)
	authHandler.RegisterRoutes(authMux, authMuxPrefix)

	authenticatedMux := http.NewServeMux()
	authenticatedMuxPrefix := "/api"
	rootMux.Handle(authenticatedMuxPrefix, auth.IsAuthenticatedMiddleware(authenticatedMux, jwtSecret))
	audioHandler.RegisterRoutes(authenticatedMux, authenticatedMuxPrefix)
	usersHandler.RegisterRoutes(authenticatedMux, authenticatedMuxPrefix)

	adminMux := http.NewServeMux()
	adminMuxPrefix := "/admin"
	rootMux.Handle(adminMuxPrefix, admin.IsAdminMiddleware(auth.IsAuthenticatedMiddleware(adminMux, jwtSecret), queries))
	adminHandler.RegisterRoutes(adminMux, adminMuxPrefix)

	return rootMux
}

func handleHealth(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"status": "ok",
	})
}
