package audio

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"os"
	"path/filepath"
	"strconv"

	"github.com/alecdray/waffle-talkie/internal/auth"
	"github.com/alecdray/waffle-talkie/internal/database"
	"github.com/google/uuid"
)

// Handler manages audio message endpoints.
type Handler struct {
	queries        *database.Queries
	audioDirectory string
}

// NewHandler creates an audio handler with database access and storage path.
func NewHandler(queries *database.Queries, audioDirectory string) *Handler {
	if err := os.MkdirAll(audioDirectory, 0755); err != nil {
		slog.Error("failed to create audio directory", "error", err)
		panic("failed to create audio directory")
	}

	return &Handler{
		queries:        queries,
		audioDirectory: audioDirectory,
	}
}

type UploadResponse struct {
	MessageID string `json:"message_id"`
	Message   string `json:"message"`
}

// HandleUpload accepts audio file uploads and creates a message record.
func (h *Handler) HandleUpload(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	userID, ok := auth.GetUserIDFromContext(r.Context())
	if !ok {
		http.Error(w, "User ID not found", http.StatusUnauthorized)
		return
	}

	if err := r.ParseMultipartForm(10 << 20); err != nil {
		http.Error(w, "Failed to parse multipart form", http.StatusBadRequest)
		return
	}

	file, header, err := r.FormFile("audio")
	if err != nil {
		http.Error(w, "Audio file is required", http.StatusBadRequest)
		return
	}
	defer file.Close()

	durationStr := r.FormValue("duration")
	if durationStr == "" {
		http.Error(w, "Duration is required", http.StatusBadRequest)
		return
	}

	duration, err := strconv.ParseInt(durationStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid duration format", http.StatusBadRequest)
		return
	}

	messageID := uuid.New().String()
	filename := fmt.Sprintf("%s%s", messageID, filepath.Ext(header.Filename))
	filePath := filepath.Join(h.audioDirectory, filename)

	dst, err := os.Create(filePath)
	if err != nil {
		slog.Error("failed to create file", "error", err)
		http.Error(w, "Failed to save audio file", http.StatusInternalServerError)
		return
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file); err != nil {
		slog.Error("failed to write file", "error", err)
		http.Error(w, "Failed to save audio file", http.StatusInternalServerError)
		return
	}

	audioMessage, err := h.queries.CreateAudioMessage(r.Context(), database.CreateAudioMessageParams{
		ID:           messageID,
		SenderUserID: userID,
		FilePath:     filePath,
		Duration:     duration,
	})
	if err != nil {
		slog.Error("failed to create audio message", "error", err)
		os.Remove(filePath)
		http.Error(w, "Failed to create message record", http.StatusInternalServerError)
		return
	}

	slog.Info("audio message created", "message_id", audioMessage.ID, "sender_id", userID)

	resp := UploadResponse{
		MessageID: audioMessage.ID,
		Message:   "Audio uploaded successfully",
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}

type MessagesResponse struct {
	Messages []database.AudioMessage `json:"messages"`
}

// HandleGetMessages returns unread messages for the authenticated user.
func (h *Handler) HandleGetMessages(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	userID, ok := auth.GetUserIDFromContext(r.Context())
	if !ok {
		http.Error(w, "User ID not found", http.StatusUnauthorized)
		return
	}

	messages, err := h.queries.GetUnreceivedMessagesByUser(r.Context(), userID)
	if err != nil {
		slog.Error("failed to get messages", "error", err)
		http.Error(w, "Failed to retrieve messages", http.StatusInternalServerError)
		return
	}

	resp := MessagesResponse{
		Messages: messages,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

// HandleDownload serves the audio file for a message.
func (h *Handler) HandleDownload(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	userID, ok := auth.GetUserIDFromContext(r.Context())
	if !ok {
		http.Error(w, "User ID not found", http.StatusUnauthorized)
		return
	}

	messageID := r.URL.Query().Get("id")
	if messageID == "" {
		http.Error(w, "Message ID is required", http.StatusBadRequest)
		return
	}

	message, err := h.queries.GetAudioMessage(r.Context(), messageID)
	if err == sql.ErrNoRows {
		http.Error(w, "Message not found", http.StatusNotFound)
		return
	} else if err != nil {
		slog.Error("failed to get message", "error", err)
		http.Error(w, "Failed to retrieve message", http.StatusInternalServerError)
		return
	}

	if _, err := os.Stat(message.FilePath); os.IsNotExist(err) {
		slog.Error("audio file not found", "path", message.FilePath)
		http.Error(w, "Audio file not found", http.StatusNotFound)
		return
	}

	_, err = h.queries.GetReceipt(r.Context(), database.GetReceiptParams{
		AudioMessageID: messageID,
		UserID:         userID,
	})
	if err == sql.ErrNoRows {
		if _, err := h.queries.CreateReceipt(r.Context(), database.CreateReceiptParams{
			AudioMessageID: messageID,
			UserID:         userID,
		}); err != nil {
			slog.Error("failed to create receipt", "error", err)
		}
	}

	http.ServeFile(w, r, message.FilePath)
}

type MarkReceivedRequest struct {
	MessageID string `json:"message_id"`
}

type MarkReceivedResponse struct {
	Message string `json:"message"`
}

// HandleMarkReceived marks a message as received by the user.
func (h *Handler) HandleMarkReceived(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	userID, ok := auth.GetUserIDFromContext(r.Context())
	if !ok {
		http.Error(w, "User ID not found", http.StatusUnauthorized)
		return
	}

	var req MarkReceivedRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.MessageID == "" {
		http.Error(w, "message_id is required", http.StatusBadRequest)
		return
	}

	message, err := h.queries.GetAudioMessage(r.Context(), req.MessageID)
	if err == sql.ErrNoRows {
		http.Error(w, "Message not found", http.StatusNotFound)
		return
	} else if err != nil {
		slog.Error("failed to get message", "error", err)
		http.Error(w, "Failed to retrieve message", http.StatusInternalServerError)
		return
	}

	_, err = h.queries.CreateReceipt(r.Context(), database.CreateReceiptParams{
		AudioMessageID: message.ID,
		UserID:         userID,
	})
	if err != nil {
		slog.Error("failed to create receipt", "error", err)
		http.Error(w, "Failed to mark message as received", http.StatusInternalServerError)
		return
	}

	resp := MarkReceivedResponse{
		Message: "Message marked as received",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
