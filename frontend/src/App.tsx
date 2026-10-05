import React, { useState, useCallback, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import AddStreamForm from './components/AddStreamForm';
import StreamGrid from './components/StreamGrid';
import { Stream } from './types/stream';
import './App.css';

export default function App() {
  const [streams, setStreams] = useState<Stream[]>([]);
  const [columns, setColumns] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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

  const activeCount = streams.length;

  return (
    <div className="app-shell">
      <Sidebar streamCount={activeCount} />
      <div className="main-area">
        <Header
          streamCount={activeCount}
          currentTime={currentTime}
        />
        <main className="page-content">
          {/* Stats Row */}
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-icon stat-icon--teal">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M15 10l4.553-2.069A1 1 0 0121 8.845V15.155a1 1 0 01-1.447.914L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="stat-info">
                <div className="stat-value">{activeCount}</div>
                <div className="stat-label">Active Streams</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon stat-icon--green">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12.55a11 11 0 0114.08 0M1.42 9a16 16 0 0121.16 0M8.53 16.11a6 6 0 016.95 0M12 20h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="stat-info">
                <div className="stat-value" style={{ color: 'var(--status-live)' }}>
                  {activeCount > 0 ? 'OK' : '—'}
                </div>
                <div className="stat-label">Network Status</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon stat-icon--blue">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" stroke="currentColor" strokeWidth="1.8"/>
                  <path d="M12 12h.01M8 12h.01M16 12h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="stat-info">
                <div className="stat-value" style={{ color: 'var(--text-blue)' }}>8554</div>
                <div className="stat-label">RTSP Port</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon stat-icon--warn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8"/>
                  <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="stat-info">
                <div className="stat-value" style={{ fontFamily: 'var(--font-mono)', fontSize: '1.125rem', color: 'var(--status-connect)' }}>
                  {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                </div>
                <div className="stat-label">System Time</div>
              </div>
            </div>
          </div>

          {/* Add Stream Panel */}
          <AddStreamForm onAddStream={handleAddStream} />

          {/* Stream Grid Section */}
          <StreamGrid
            streams={streams}
            columns={columns}
            onColumnsChange={setColumns}
            onRemoveStream={handleRemoveStream}
          />
        </main>

        <footer className="app-footer">
          <div className="footer-left">
            <span className="footer-text">Skylark Stream Monitor v1.0.0</span>
            <span className="footer-badge">
              <span style={{ color: 'var(--accent)' }}>●</span>
              Go + React TS
            </span>
            <span className="footer-badge">FFmpeg</span>
            <span className="footer-badge">MediaMTX</span>
          </div>
          <span className="footer-text" style={{ color: 'var(--text-muted)' }}>
            © 2024 Skylark Labs. All rights reserved.
          </span>
        </footer>
      </div>
    </div>
  );
}
