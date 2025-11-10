package server

import (
    "encoding/json"
    "net/http"
	"log"
)

type APIHandler struct {
	MethodAndRoute string
	Handler func(http.ResponseWriter, *http.Request)
}

func GetAPIHandlers() []APIHandler {
	return []APIHandler{
		{
			MethodAndRoute: "/api/",
			Handler: func(w http.ResponseWriter, r *http.Request) {
				http.NotFound(w, r)
				log.Println("unknown api call recieved", r.URL.Path)
			},
		},
		{
			MethodAndRoute: "GET /api/hello",
			Handler: func(w http.ResponseWriter, r *http.Request) {
				resp := map[string]string{"message": "Hello from API"}
				w.Header().Set("Content-Type", "application/json")
				json.NewEncoder(w).Encode(resp)
			},
		},
	}
}

func (s *Server) RegisterAPIRoutes() {
	apiHandlers := GetAPIHandlers()
	for _, apiHandler := range apiHandlers {
		s.Mux.HandleFunc(apiHandler.MethodAndRoute, apiHandler.Handler)
		log.Println("Registered API route:", apiHandler.MethodAndRoute)
	}
}

func (s *Server) RegisterAPIRoutesWithMiddleware(middleware func(http.Handler) http.Handler) {
	apiHandlers := GetAPIHandlers()
	for _, apiHandler := range apiHandlers {
		s.Mux.Handle(apiHandler.MethodAndRoute, middleware(http.HandlerFunc(apiHandler.Handler)))
		log.Println("Registered API route with middleware:", apiHandler.MethodAndRoute)
	}
}