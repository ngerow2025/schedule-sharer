package main

import (
	"embed"
	"fmt"
	"mime"
	"net/http"
	"path"
)

//go:embed dist
var file_contents embed.FS

func serveFile(w http.ResponseWriter, r *http.Request) {
    if r.URL.Path == "/" {
        r.URL.Path = "/index.html"
    }
    actualPath := "dist" + r.URL.Path
    fmt.Println("path: ", actualPath)
    data, err := file_contents.ReadFile(actualPath)
    if err != nil {
        http.NotFound(w, r)
        fmt.Println("could not find file at ", actualPath)
        return
    }

    fileExt := path.Ext(r.URL.Path)
    fileMimeType := mime.TypeByExtension(fileExt)
    if fileMimeType != "" {
        w.Header().Set("Content-Type", fileMimeType)
    } else {
        w.Header().Set("Content-Type", "application/octet-stream")
    }



    w.Write(data)
}

func handleAPI(w http.ResponseWriter, r *http.Request) {
    
}

func main() {
    
    http.HandleFunc("/api", handleAPI)
    http.HandleFunc("/", serveFile)

    http.ListenAndServe(":8080", nil)
}
