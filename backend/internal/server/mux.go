package server

import (
	"encoding/json"
	"log/slog"
	"net/http"
	"time"

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
	rootMux.Handle("/auth/", http.StripPrefix("/auth", authMux))
	authHandler.RegisterRoutes(authMux)

	authenticatedMux := http.NewServeMux()
	rootMux.Handle("/api/", http.StripPrefix("/api", auth.IsAuthenticatedMiddleware(authenticatedMux, jwtSecret)))
	audioHandler.RegisterRoutes(authenticatedMux)
	usersHandler.RegisterRoutes(authenticatedMux)

	adminMux := http.NewServeMux()
	rootMux.Handle("/admin/", http.StripPrefix("/admin", admin.IsAdminMiddleware(auth.IsAuthenticatedMiddleware(adminMux, jwtSecret), queries)))
	adminHandler.RegisterRoutes(adminMux)

	return loggingMiddleware(rootMux)
}

func handleHealth(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"status": "ok",
	})
}

// responseWriter wraps http.ResponseWriter to capture status code
type responseWriter struct {
	http.ResponseWriter
	statusCode int
}

func (rw *responseWriter) WriteHeader(code int) {
	rw.statusCode = code
	rw.ResponseWriter.WriteHeader(code)
}

// loggingMiddleware logs basic request information
func loggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()

		slog.Info("incoming request",
			"method", r.Method,
			"path", r.URL.Path,
			"remote_addr", r.RemoteAddr,
		)

		rw := &responseWriter{ResponseWriter: w, statusCode: http.StatusOK}
		next.ServeHTTP(rw, r)

		// Log with appropriate level based on status code
		logLevel := slog.LevelInfo

		if rw.statusCode >= 500 {
			logLevel = slog.LevelError
		} else if rw.statusCode >= 400 {
			logLevel = slog.LevelWarn
		}

		slog.Log(r.Context(), logLevel, "request completed",
			"method", r.Method,
			"path", r.URL.Path,
			"status", rw.statusCode,
			"status_text", http.StatusText(rw.statusCode),
			"duration", time.Since(start),
		)
	})
}
