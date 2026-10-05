package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/gorilla/mux"

	"skylark-backend/models"
	"skylark-backend/store"
)

// ListStreams returns all saved streams as JSON.
func ListStreams(s *store.MemoryStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		streams := s.List()
		if streams == nil {
			streams = []*models.Stream{}
		}
		json.NewEncoder(w).Encode(streams) //nolint:errcheck
	}
}

type createStreamRequest struct {
	URL  string `json:"url"`
	Name string `json:"name"`
}

// CreateStream adds a new stream to the store.
func CreateStream(s *store.MemoryStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req createStreamRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid JSON"})
			return
		}
		if req.URL == "" {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "url is required"})
			return
		}

		stream := &models.Stream{
			ID:        fmt.Sprintf("stream-%d", time.Now().UnixNano()),
			URL:       req.URL,
			Name:      req.Name,
			CreatedAt: time.Now().UTC(),
		}
		s.Add(stream)

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(stream) //nolint:errcheck
	}
}

// DeleteStream removes a stream by ID.
func DeleteStream(s *store.MemoryStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := mux.Vars(r)["id"]
		if !s.Delete(id) {
			writeJSON(w, http.StatusNotFound, map[string]string{"error": "stream not found"})
			return
		}
		w.WriteHeader(http.StatusNoContent)
	}
}

func writeJSON(w http.ResponseWriter, code int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(v) //nolint:errcheck
}
