package server

import (
    "embed"
    "net/http"
	"log"
)

//go:embed dist
var embeddedFrontend embed.FS 

func (s *Server) RegisterEmbeddedFrontend() {
    static := http.FileServer(http.FS(embeddedFrontend))

    // Serve static files for everything except /api
    s.Mux.Handle("/", static)
	log.Println("Registered embedded frontend")
}

func (s *Server) RegisterFrontendWithMiddleware(middleware func(http.Handler) http.Handler) {
	static := http.FileServer(http.FS(embeddedFrontend))

	// Serve static files for everything except /api
	s.Mux.Handle("/", middleware(static))
	log.Println("Registered embedded frontend with middleware")
}
