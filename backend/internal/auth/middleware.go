package auth

import (
	"context"
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"
	"strings"
)

type contextKey string

const (
	UserIDKey contextKey = "user_id"
)

// IsAuthenticatedMiddleware extracts and validates the Bearer token, then adds user context.
func IsAuthenticatedMiddleware(next http.Handler, secretKey string) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "Authorization header required", http.StatusUnauthorized)
			return
		}

		// Extract token from "Bearer <token>"
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			http.Error(w, "Invalid authorization header format", http.StatusUnauthorized)
			return
		}

		token := parts[1]

		// Validate token
		claims, err := ValidateToken(token, secretKey)
		if err != nil {
			slog.Error("token validation failed", "error", err)
			w.WriteHeader(http.StatusUnauthorized)
			if errors.Is(err, ErrTokenExpired) {
				json.NewEncoder(w).Encode(map[string]string{"error": ErrTokenExpired.Error()})
			} else {
				json.NewEncoder(w).Encode(map[string]string{"error": ErrTokenInvalid.Error()})
			}
			return
		}

		// Add claims to context
		ctx := context.WithValue(r.Context(), UserIDKey, claims.UserID)

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// GetUserIDFromContext extracts the user ID from the request context.
func GetUserIDFromContext(ctx context.Context) (string, bool) {
	userID, ok := ctx.Value(UserIDKey).(string)
	return userID, ok
}
