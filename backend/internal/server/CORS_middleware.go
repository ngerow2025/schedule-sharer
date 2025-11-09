package server

import (
	"net/http"
)

func Create_CORS_middleware(allowedURL string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Access-Control-Allow-Origin", allowedURL)
			w.Header().Set("Access-Control-Allow-Headers", "*")
			next.ServeHTTP(w, r)
		})
	}
}
