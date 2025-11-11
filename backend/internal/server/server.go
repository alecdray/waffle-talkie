package server

import (
	"fmt"
	"net/http"

	"github.com/alecdray/waffle-talkie/internal/database"
)

func NewServerMux(queries *database.Queries) http.Handler {
	rootMux := http.NewServeMux()

	rootMux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "Hello, World!")
	})

	return rootMux
}
