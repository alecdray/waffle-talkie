package server

import (
	"fmt"
	"net/http"
)

func NewServerMux() http.Handler {
	rootMux := http.NewServeMux()

	rootMux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "Hello, World!")
	})

	return rootMux
}
