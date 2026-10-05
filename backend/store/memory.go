// Package store provides a thread-safe in-memory store for Stream objects.
package store

import (
	"sync"

	"skylark-backend/models"
)

// MemoryStore is a concurrent-safe in-memory stream registry.
type MemoryStore struct {
	mu      sync.RWMutex
	streams map[string]*models.Stream
	order   []string // tracks insertion order for stable listing
}

// NewMemoryStore initialises an empty store.
func NewMemoryStore() *MemoryStore {
	return &MemoryStore{
		streams: make(map[string]*models.Stream),
	}
}

// List returns all streams in insertion order.
func (s *MemoryStore) List() []*models.Stream {
	s.mu.RLock()
	defer s.mu.RUnlock()

	result := make([]*models.Stream, 0, len(s.order))
	for _, id := range s.order {
		if stream, ok := s.streams[id]; ok {
			result = append(result, stream)
		}
	}
	return result
}

// Add inserts a new stream. Overwrites if the same ID already exists.
func (s *MemoryStore) Add(stream *models.Stream) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, exists := s.streams[stream.ID]; !exists {
		s.order = append(s.order, stream.ID)
	}
	s.streams[stream.ID] = stream
}

// Delete removes a stream by ID. Returns false if not found.
func (s *MemoryStore) Delete(id string) bool {
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, ok := s.streams[id]; !ok {
		return false
	}
	delete(s.streams, id)
	for i, oid := range s.order {
		if oid == id {
			s.order = append(s.order[:i], s.order[i+1:]...)
			break
		}
	}
	return true
}

// Get returns a stream by ID.
func (s *MemoryStore) Get(id string) (*models.Stream, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	stream, ok := s.streams[id]
	return stream, ok
}
