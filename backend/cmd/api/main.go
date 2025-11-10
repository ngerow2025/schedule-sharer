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

    db.SetConnMaxLifetime(0)
    db.SetMaxIdleConns(5)
    db.SetMaxOpenConns(5)

    err = db.Ping()
    if err != nil {
        log.Fatal(err)
    }

    log.Println("Database connection successfully established")

    s := server.New(db)
	s.RegisterAPIRoutesWithMiddleware(server.Create_CORS_middleware(os.Getenv("FRONTEND_URL"))) //this allows use from the development vite server

    log.Fatal(s.Listen(":8080"))
}
