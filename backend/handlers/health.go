package handlers

import (
	"encoding/json"
	"net/http"
)

type healthResponse struct {
	Status  string `json:"status"`
	Service string `json:"service"`
}

// HealthHandler returns a simple JSON health-check response.
func HealthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(healthResponse{
		Status:  "ok",
		Service: "rtsp-stream-viewer",
	}); err != nil {
		http.Error(w, "internal error", http.StatusInternalServerError)
	}
}
