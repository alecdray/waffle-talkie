package server

import (
	"encoding/json"
	"net/http"

	"github.com/alecdray/waffle-talkie/internal/audio"
	"github.com/alecdray/waffle-talkie/internal/auth"
	"github.com/alecdray/waffle-talkie/internal/database"
)

func NewMux(queries *database.Queries, jwtSecret string, audioDirectory string) http.Handler {
	rootMux := http.NewServeMux()
	authHandler := auth.NewHandler(queries, jwtSecret)
	audioHandler := audio.NewHandler(queries, audioDirectory)

	rootMux.HandleFunc("/", handleRoot)
	rootMux.HandleFunc("/health", handleHealth)

	rootMux.HandleFunc("/auth/register", authHandler.HandleRegister)
	rootMux.HandleFunc("/auth/login", authHandler.HandleLogin)

	// TODO: add admin middleware
	rootMux.HandleFunc("/auth/pending", authHandler.HandleListPendingUsers)
	rootMux.HandleFunc("/auth/approve", authHandler.HandleApprove)

	protectedMux := http.NewServeMux()
	protectedMux.HandleFunc("/api/me", handleMe(queries))
	protectedMux.HandleFunc("/api/messages", audioHandler.HandleGetMessages)
	protectedMux.HandleFunc("/api/messages/upload", audioHandler.HandleUpload)
	protectedMux.HandleFunc("/api/messages/download", audioHandler.HandleDownload)
	protectedMux.HandleFunc("/api/messages/received", audioHandler.HandleMarkReceived)
	rootMux.Handle("/api/", authHandler.AuthMiddleware(protectedMux))

	return rootMux
}

func handleRoot(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		http.NotFound(w, r)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Waffle Talkie API",
		"version": "1.0.0",
	})
}

func handleHealth(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"status": "ok",
	})
}

func handleMe(queries *database.Queries) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID, ok := auth.GetUserIDFromContext(r.Context())
		if !ok {
			http.Error(w, "User ID not found in context", http.StatusInternalServerError)
			return
		}

		user, err := queries.GetUser(r.Context(), userID)
		if err != nil {
			http.Error(w, "User not found", http.StatusNotFound)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(user)
	}
}
