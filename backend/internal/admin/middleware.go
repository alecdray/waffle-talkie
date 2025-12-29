package admin

import (
	"net/http"

	"github.com/alecdray/waffle-talkie/internal/auth"
	"github.com/alecdray/waffle-talkie/internal/database"
	"github.com/alecdray/waffle-talkie/internal/users"
)

func IsAdminMiddleware(next http.Handler, queries *database.Queries) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()
		userID, ok := auth.GetUserIDFromContext(ctx)
		if !ok {
			http.Error(w, "User ID not found", http.StatusUnauthorized)
			return
		}

		user, err := queries.GetUser(ctx, userID)
		if err != nil {
			http.Error(w, "Failed to get user", http.StatusInternalServerError)
			return
		}

		userRole := users.UserRole(user.Role)

		if !userRole.IsAdmin() {
			http.Error(w, "User is not an admin", http.StatusForbidden)
			return
		}

		next.ServeHTTP(w, r)
	})
}
