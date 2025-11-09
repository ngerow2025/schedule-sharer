package server

import (
    "database/sql"
    "log"
    "net/http"
)

type Server struct {
    DB *sql.DB
    Mux *http.ServeMux
}

func New(db *sql.DB) *Server {
    s := &Server{
        DB: db,
        Mux: http.NewServeMux(),
    }
    return s
}

func (s *Server) Listen(addr string) error {
    log.Printf("Server listening on %s", addr)
    return http.ListenAndServe(addr, s.Mux)
}
