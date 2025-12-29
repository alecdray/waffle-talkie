package admin

import (
	"net/http"

	"github.com/alecdray/waffle-talkie/internal/database"
)

type Handler struct {
	queries *database.Queries
}

func NewHandler(queries *database.Queries) *Handler {
	return &Handler{queries: queries}
}

func (h *Handler) RegisterRoutes(router *http.ServeMux, prefix string) {

}
