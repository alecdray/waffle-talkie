package auth

import (
	"database/sql"
	"encoding/json"
	"log/slog"
	"net/http"
	"time"

	"github.com/alecdray/waffle-talkie/internal/database"
	"github.com/google/uuid"
)

// Handler manages authentication endpoints.
type Handler struct {
	queries   *database.Queries
	secretKey string
}

// NewHandler creates an auth handler with database access.
func NewHandler(queries *database.Queries, secretKey string) *Handler {
	return &Handler{
		queries:   queries,
		secretKey: secretKey,
	}
}

type RegisterRequest struct {
	Name     string `json:"name"`
	DeviceID string `json:"device_id"`
}

type RegisterResponse struct {
	Message string `json:"message"`
	UserID  string `json:"user_id"`
}

// HandleRegister creates a new user pending approval. Device IDs are hashed before storage.
func (h *Handler) HandleRegister(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.Name == "" || req.DeviceID == "" {
		http.Error(w, "Name and device_id are required", http.StatusBadRequest)
		return
	}

	users, err := h.queries.ListUsers(r.Context())
	if err != nil {
		slog.Error("failed to list users", "error", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	for _, existingUser := range users {
		if CompareDeviceID(existingUser.DeviceIDHash, req.DeviceID) {
			if existingUser.Name != req.Name {
				h.queries.UpdateUserName(r.Context(), database.UpdateUserNameParams{
					ID:   existingUser.ID,
					Name: req.Name,
				})
			}
			resp := RegisterResponse{
				Message: "Device already registered",
				UserID:  existingUser.ID,
			}
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(resp)
			return
		}
	}

	hashedDeviceID, err := HashDeviceID(req.DeviceID)
	if err != nil {
		slog.Error("failed to hash device ID", "error", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	user, err := h.queries.CreateUser(r.Context(), database.CreateUserParams{
		ID:           uuid.New().String(),
		Name:         req.Name,
		DeviceIDHash: hashedDeviceID,
		Approved:     false,
	})
	if err != nil {
		slog.Error("failed to create user", "error", err)
		http.Error(w, "Failed to register user", http.StatusInternalServerError)
		return
	}

	slog.Info("user registered", "user_id", user.ID, "name", user.Name)

	resp := RegisterResponse{
		Message: "Registration successful. Awaiting admin approval.",
		UserID:  user.ID,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}

type LoginRequest struct {
	DeviceID string `json:"device_id"`
}

type LoginResponse struct {
	Token          string    `json:"token"`
	TokenExpiresAt time.Time `json:"token_expires_at"`
	UserID         string    `json:"user_id"`
	Name           string    `json:"name"`
	Message        string    `json:"message,omitempty"`
}

// HandleLogin authenticates approved users and returns a JWT token.
func (h *Handler) HandleLogin(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.DeviceID == "" {
		http.Error(w, "device_id is required", http.StatusBadRequest)
		return
	}

	users, err := h.queries.ListUsers(r.Context())
	if err != nil {
		slog.Error("failed to list users", "error", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	var user *database.User
	for _, u := range users {
		if CompareDeviceID(u.DeviceIDHash, req.DeviceID) {
			user = &u
			break
		}
	}

	if user == nil {
		http.Error(w, "Device not registered", http.StatusUnauthorized)
		return
	}

	if !user.Approved {
		http.Error(w, "User not approved yet", http.StatusForbidden)
		return
	}

	if err := h.queries.UpdateUserLastActive(r.Context(), user.ID); err != nil {
		slog.Error("failed to update last active", "error", err)
	}

	token := GenerateToken(user.ID, h.secretKey)
	tokenString, err := SignToken(token, h.secretKey)
	if err != nil {
		slog.Error("failed to generate token", "error", err)
		http.Error(w, "Failed to generate token", http.StatusInternalServerError)
		return
	}
	tokenExpiresAt, err := token.Claims.GetExpirationTime()
	if err != nil {
		slog.Error("failed to get token expiration time", "error", err)
		http.Error(w, "Failed to generate token", http.StatusInternalServerError)
		return
	}

	slog.Info("user logged in", "user_id", user.ID, "name", user.Name)

	resp := LoginResponse{
		Token:          tokenString,
		TokenExpiresAt: tokenExpiresAt.Time,
		UserID:         user.ID,
		Name:           user.Name,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

type ApproveRequest struct {
	UserID string `json:"user_id"`
}

type ApproveResponse struct {
	Message string `json:"message"`
}

// HandleApprove marks a user as approved, allowing them to log in.
func (h *Handler) HandleApprove(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req ApproveRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.UserID == "" {
		http.Error(w, "user_id is required", http.StatusBadRequest)
		return
	}

	user, err := h.queries.GetUser(r.Context(), req.UserID)
	if err == sql.ErrNoRows {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	} else if err != nil {
		slog.Error("failed to get user", "error", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	if err := h.queries.ApproveUser(r.Context(), req.UserID); err != nil {
		slog.Error("failed to approve user", "error", err)
		http.Error(w, "Failed to approve user", http.StatusInternalServerError)
		return
	}

	slog.Info("user approved", "user_id", user.ID, "name", user.Name)

	resp := ApproveResponse{
		Message: "User approved successfully",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

type UserResponse struct {
	ID         string `json:"id"`
	Name       string `json:"name"`
	Approved   bool   `json:"approved"`
	LastActive string `json:"last_active,omitempty"`
	CreatedAt  string `json:"created_at"`
}

type PendingUsersResponse struct {
	Users []UserResponse `json:"users"`
}

// HandleListPendingUsers returns all users awaiting approval.
func (h *Handler) HandleListPendingUsers(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	users, err := h.queries.ListUsers(r.Context())
	if err != nil {
		slog.Error("failed to list users", "error", err)
		http.Error(w, "Failed to list users", http.StatusInternalServerError)
		return
	}

	pendingUsers := make([]UserResponse, 0)
	for _, user := range users {
		if !user.Approved {
			userResp := UserResponse{
				ID:        user.ID,
				Name:      user.Name,
				Approved:  user.Approved,
				CreatedAt: user.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
			}
			if user.LastActive.Valid {
				userResp.LastActive = user.LastActive.Time.Format("2006-01-02T15:04:05Z07:00")
			}
			pendingUsers = append(pendingUsers, userResp)
		}
	}

	resp := PendingUsersResponse{
		Users: pendingUsers,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
