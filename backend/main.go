// Skylark Stream Viewer — Go backend entry point.
//
// Routing:
//
//	GET  /health                  → health check
//	GET  /api/streams             → list saved streams
//	POST /api/streams             → add stream
//	DEL  /api/streams/{id}        → remove stream
//	GET  /ws/stream/{streamId}    → WebSocket stream bridge
package main

import (
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/gorilla/mux"
	"github.com/rs/cors"

	"skylark-backend/handlers"
	"skylark-backend/store"
)

func main() {
	streamStore := store.NewMemoryStore()

	r := mux.NewRouter()

	// ── REST API ──────────────────────────────────────────────────────────────
	r.HandleFunc("/health", handlers.HealthHandler).Methods(http.MethodGet, http.MethodOptions)

	api := r.PathPrefix("/api").Subrouter()
	api.HandleFunc("/streams", handlers.ListStreams(streamStore)).Methods(http.MethodGet)
	api.HandleFunc("/streams", handlers.CreateStream(streamStore)).Methods(http.MethodPost)
	api.HandleFunc("/streams/{id}", handlers.DeleteStream(streamStore)).Methods(http.MethodDelete)

	// ── WebSocket ─────────────────────────────────────────────────────────────
	wsHandler := handlers.NewStreamWSHandler()
	r.HandleFunc("/ws/stream/{streamId}", wsHandler)
	r.HandleFunc("/ws/stream/{streamId}/", wsHandler)

	// ── CORS ──────────────────────────────────────────────────────────────────
	allowedOrigins := []string{"*"}
	if env := os.Getenv("CORS_ALLOWED_ORIGINS"); env != "" {
		allowedOrigins = strings.Split(env, ",")
	}

	c := cors.New(cors.Options{
		AllowedOrigins:   allowedOrigins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Content-Type", "Authorization"},
		AllowCredentials: false,
	})

	// ── Listen ────────────────────────────────────────────────────────────────
	port := os.Getenv("PORT")
	if port == "" {
		port = "8000"
	}

	log.Printf("🚀 Skylark backend (Go) starting on :%s", port)
	if err := http.ListenAndServe(":"+port, c.Handler(r)); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
