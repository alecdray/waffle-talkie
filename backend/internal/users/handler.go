package users

import (
	"encoding/json"
	"log/slog"
	"net/http"

	"github.com/alecdray/waffle-talkie/internal/database"
)

// Handler manages audio message endpoints.
type Handler struct {
	queries *database.Queries
}

// NewHandler creates an audio handler with database access and storage path.
func NewHandler(queries *database.Queries) *Handler {
	return &Handler{
		queries: queries,
	}
}

type User struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

func (h *Handler) HandleGetUsers(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	dbUsers, err := h.queries.ListUsers(r.Context())
	if err != nil {
		slog.Error("failed to list users", "error", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	users := make([]User, len(dbUsers))
	for i, user := range dbUsers {
		users[i] = User{
			ID:   user.ID,
			Name: user.Name,
		}
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"users": users,
	})
}
