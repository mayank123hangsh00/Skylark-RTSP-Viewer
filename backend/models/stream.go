package models

import "time"

// Stream represents a saved RTSP stream configuration.
type Stream struct {
	ID        string    `json:"id"`
	URL       string    `json:"url"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"created_at"`
}
