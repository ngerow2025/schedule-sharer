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
	log.Println("Connected to database with DATABASE_URL:", os.Getenv("DATABASE_URL"))
    defer db.Close()

    s := server.New(db)
	s.RegisterAPIRoutesWithMiddleware(server.Create_CORS_middleware("http://localhost:5173")) //this allows use from the development vite server

    log.Fatal(s.Listen(":8080"))
}
