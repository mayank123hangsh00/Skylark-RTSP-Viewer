import React, { useEffect, useRef } from 'react';
import { useStreamSocket } from '../hooks/useStreamSocket';
import { STREAM_STATUS } from '../utils/constants';
import StatusBadge from './StatusBadge';
import { Stream } from '../types/stream';

interface StreamCardProps {
  stream: Stream;
  onRemove: (id: string) => void;
}

export default function StreamCard({ stream, onRemove }: StreamCardProps) {
  const { frame, status, error, fps, connect, disconnect, pause, resume } =
    useStreamSocket(stream.id, stream.url);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Decode base64 JPEG → canvas (off-thread via createImageBitmap)
  useEffect(() => {
    if (!frame || !canvasRef.current) return;
    let cancelled = false;
    try {
      const binary = atob(frame);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      createImageBitmap(new Blob([bytes], { type: 'image/jpeg' }))
        .then((bmp) => {
          if (cancelled || !canvasRef.current) return;
          const cvs = canvasRef.current;
          if (cvs.width !== bmp.width || cvs.height !== bmp.height) {
            cvs.width = bmp.width; cvs.height = bmp.height;
          }
          cvs.getContext('2d')?.drawImage(bmp, 0, 0);
          bmp.close();
        })
        .catch(() => {});
    } catch {}
    return () => { cancelled = true; };
  }, [frame]);

  // Auto-connect on mount
  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  const isLive        = status === STREAM_STATUS.STREAMING;
  const isConnecting  = status === STREAM_STATUS.CONNECTING || status === STREAM_STATUS.CONNECTED;
  const isPaused      = status === STREAM_STATUS.STOPPED;
  const isError       = status === STREAM_STATUS.ERROR;
  const isOffline     = status === STREAM_STATUS.DISCONNECTED;

  const handlePlay = () => {
    if (isOffline || isError) connect();
    else resume();
  };

  const handleRemove = () => { disconnect(); onRemove(stream.id); };

  // Short display name: truncate URL
  const displayUrl = stream.url.length > 40
    ? stream.url.substring(0, 37) + '…'
    : stream.url;

  return (
    <div className={`stream-card${isLive ? ' stream-card--live' : ''}`}>
      {/* Card Header */}
      <div className="stream-card-head">
        <div className="stream-card-head-left">
          <div className="stream-card-cam-icon">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M15 10l4.553-2.069A1 1 0 0121 8.845V15.155a1 1 0 01-1.447.914L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div style={{ minWidth: 0 }}>
            <div className="stream-card-name">{stream.name || 'RTSP Stream'}</div>
            <div className="stream-card-url" title={stream.url}>{displayUrl}</div>
          </div>
        </div>
        <StatusBadge status={status} fps={fps} />
      </div>

      {/* Viewport */}
      <div className="stream-card-viewport">
        {/* Canvas — always mounted so it persists */}
        <canvas
          ref={canvasRef}
          className="stream-card-canvas"
          style={{ display: frame ? 'block' : 'none' }}
        />

        {/* Placeholder */}
        {!frame && (
          <div className="stream-card-placeholder">
            {isConnecting && (
              <>
                <div className="stream-card-spinner" />
                <div className="stream-card-placeholder-label">Establishing connection…</div>
              </>
            )}
            {isError && (
              <>
                <svg className="stream-card-placeholder-icon" width="40" height="40" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" opacity="0.5"/>
                  <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
                <div className="stream-card-placeholder-label stream-card-placeholder-label--error">
                  {error || 'Connection failed'}
                </div>
              </>
            )}
            {(isPaused || isOffline) && !isConnecting && !isError && (
              <>
                <svg className="stream-card-placeholder-icon" width="40" height="40" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" opacity="0.4"/>
                  <path d="M10 8l6 4-6 4V8z" fill="currentColor" opacity="0.35"/>
                  <path d="M8 21h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.3"/>
                </svg>
                <div className="stream-card-placeholder-label">
                  {isPaused ? 'Stream paused' : 'Ready — press Play to connect'}
                </div>
              </>
            )}
          </div>
        )}

        {/* Live badge */}
        {isLive && (
          <div className="stream-card-live-badge">
            <span className="stream-card-rec-dot" />
            <span className="stream-card-rec-label">REC</span>
          </div>
        )}

        {/* FPS counter */}
        {isLive && fps > 0 && (
          <div className="stream-card-fps-badge">{fps} FPS</div>
        )}
      </div>

      {/* Error strip */}
      {isError && error && (
        <div className="stream-card-error-strip">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          {error}
        </div>
      )}

      {/* Controls Footer */}
      <div className="stream-card-footer">
        <div className="stream-card-status-group">
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            ID: {stream.id.split('-').pop()}
          </span>
        </div>
        <div className="stream-card-control-group">
          {isLive ? (
            <button className="ctrl-btn ctrl-btn--pause" onClick={pause} title="Pause stream">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1"/>
                <rect x="14" y="4" width="4" height="16" rx="1"/>
              </svg>
            </button>
          ) : (
            <button className="ctrl-btn ctrl-btn--play" onClick={handlePlay} title="Play stream">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M5 3l14 9-14 9V3z"/>
              </svg>
            </button>
          )}
          <button className="ctrl-btn ctrl-btn--remove" onClick={handleRemove} title="Remove stream">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
