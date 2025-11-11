package server

import (
    "encoding/json"
    "net/http"
	"log"
	"github.com/ngerow2025/schedule-sharer/internal/ldap"
	"os"
	"sync"
)

type APIHandler struct {
	MethodAndRoute string
	Handler func(http.ResponseWriter, *http.Request)
}

var LDAPConnection *ldap.LDAPClient
var LDAPConnectionMutex = &sync.Mutex{}

func init() {
	log.Println("Initializing API handlers")

	{
		log.Println("Initilizing LDAP connection")
		ldap_client := &ldap.LDAPClient{
			BindCN: "uid=" + os.Getenv("LDAP_UID") + ",cn=users,cn=accounts,dc=csh,dc=rit,dc=edu",
			BindPW: os.Getenv("LDAP_PASSWORD"),
		}

		if err := ldap_client.Connect(); err != nil {
			log.Fatalf("LDAP connection failed: %v", err)
		}
		LDAPConnection = ldap_client
	}
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
		{
			MethodAndRoute: "GET /api/users",
			Handler: func(w http.ResponseWriter, r *http.Request) {
				log.Println("Recieved users request")
				LDAPConnectionMutex.Lock()
				defer LDAPConnectionMutex.Unlock()
				users, err := LDAPConnection.GetUsers()
				if err != nil {
					http.Error(w, "Failed to fetch users", http.StatusInternalServerError)
					log.Println("Error fetching users:", err)
					return
				}
				log.Printf("Successfully fetched %d users", len(users))
				w.Header().Set("Content-Type", "application/json")
				json.NewEncoder(w).Encode(users)

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