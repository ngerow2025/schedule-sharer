package main

import (
    "database/sql"
    "log"
    "os"

    _ "github.com/lib/pq"
    "github.com/ngerow2025/schedule-sharer/internal/server"
)

func main() {
    db, err := sql.Open("postgres", os.Getenv("DATABASE_URL"))
    if err != nil {
        log.Fatal(err)
    }
    defer db.Close()

    s := server.New(db)
    s.RegisterEmbeddedFrontend() // add frontend handlers
	s.RegisterAPIRoutes()

    log.Fatal(s.Listen(":8080"))
}
