import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import AddStreamForm from './components/AddStreamForm';
import StreamGrid from './components/StreamGrid';
import { Stream } from './types/stream';
import './App.css';

export default function App() {
  const [streams, setStreams] = useState<Stream[]>([]);

  const handleAddStream = useCallback(({ url, name }: { url: string; name: string }) => {
    const newStream: Stream = {
      id: `stream-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      url,
      name,
      addedAt: new Date().toISOString(),
    };
    setStreams((prev) => [...prev, newStream]);
  }, []);

  const handleRemoveStream = useCallback((streamId: string) => {
    setStreams((prev) => prev.filter((s) => s.id !== streamId));
  }, []);

  return (
    <div className="app">
      <Header streamCount={streams.length} />
      <main className="app-main">
        <div className="app-container">
          <AddStreamForm onAddStream={handleAddStream} />
          <StreamGrid
            streams={streams}
            onRemoveStream={handleRemoveStream}
          />
        </div>
      </main>
      <footer className="app-footer">
        <p>
          Skylark Stream Viewer &middot; Built with React (TypeScript) + Go (Golang) + FFmpeg
        </p>
      </footer>
    </div>
  );
}
