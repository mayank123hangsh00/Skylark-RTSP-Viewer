import React, { useEffect, useRef } from 'react';
import { useStreamSocket } from '../hooks/useStreamSocket';
import { STREAM_STATUS } from '../utils/constants';
import StatusBadge from './StatusBadge';
import StreamControls from './StreamControls';
import { Stream } from '../types/stream';
import './StreamCard.css';

interface StreamCardProps {
  stream: Stream;
  onRemove: (id: string) => void;
}

export default function StreamCard({ stream, onRemove }: StreamCardProps) {
  const {
    frame,
    status,
    error,
    fps,
    connect,
    disconnect,
    pause,
    resume,
  } = useStreamSocket(stream.id, stream.url);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!frame || !canvasRef.current) return;
    let cancelled = false;

    try {
      const binary = atob(frame);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'image/jpeg' });

      createImageBitmap(blob).then((bitmap) => {
        if (cancelled || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          if (canvas.width !== bitmap.width || canvas.height !== bitmap.height) {
            canvas.width = bitmap.width;
            canvas.height = bitmap.height;
          }
          ctx.drawImage(bitmap, 0, 0);
          bitmap.close();
        }
      }).catch(() => {});
    } catch (e) {
      console.error('Error decoding video frame:', e);
    }

    return () => { cancelled = true; };
  }, [frame]);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  const handlePlay = () => {
    if (status === STREAM_STATUS.DISCONNECTED || status === STREAM_STATUS.ERROR) {
      connect();
    } else {
      resume();
    }
  };

  const handlePause = () => {
    pause();
  };

  const handleRemove = () => {
    disconnect();
    onRemove(stream.id);
  };

  const isLive = status === STREAM_STATUS.STREAMING;
  const isConnecting = status === STREAM_STATUS.CONNECTING || status === STREAM_STATUS.CONNECTED;

  return (
    <div className={`stream-card glass animate-in ${isLive ? 'stream-card--live' : ''}`}>
      <div className="stream-card-header">
        <div className="stream-card-info">
          <h3 className="stream-card-name">{stream.name || 'RTSP Stream'}</h3>
          <p className="stream-card-url" title={stream.url}>
            {stream.url.length > 50
              ? stream.url.substring(0, 47) + '...'
              : stream.url}
          </p>
        </div>
        <StatusBadge status={status} fps={fps} />
      </div>

      <div className="stream-card-viewport">
        <canvas
          ref={canvasRef}
          className="stream-card-frame"
          style={{ display: frame ? 'block' : 'none' }}
        />
        {!frame && (
          <div className="stream-card-placeholder">
            {isConnecting ? (
              <>
                <div className="stream-card-loader">
                  <div className="stream-card-loader-ring" />
                </div>
                <p className="stream-card-placeholder-text">Connecting to stream...</p>
              </>
            ) : status === STREAM_STATUS.ERROR ? (
              <>
                <svg className="stream-card-error-icon" width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2" opacity="0.3" />
                  <path d="M24 16V28" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="24" cy="34" r="1.5" fill="currentColor" />
                </svg>
                <p className="stream-card-placeholder-text stream-card-placeholder-text--error">
                  {error || 'Connection failed'}
                </p>
              </>
            ) : (
              <>
                <svg className="stream-card-idle-icon" width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <rect x="6" y="10" width="36" height="24" rx="3" stroke="currentColor" strokeWidth="2" opacity="0.3" />
                  <path d="M20 18L20 30L30 24L20 18Z" fill="currentColor" opacity="0.4" />
                  <path d="M18 38H30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
                </svg>
                <p className="stream-card-placeholder-text">
                  {status === STREAM_STATUS.STOPPED ? 'Stream paused' : 'Ready to stream'}
                </p>
              </>
            )}
          </div>
        )}

        {isLive && (
          <div className="stream-card-live-overlay">
            <span className="stream-card-rec-dot" />
            <span className="stream-card-rec-text">REC</span>
          </div>
        )}
      </div>

      {error && status === STREAM_STATUS.ERROR && (
        <div className="stream-card-error-banner animate-in">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" />
            <path d="M7 4V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="7" cy="10.5" r="0.75" fill="currentColor" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <StreamControls
        status={status}
        onPlay={handlePlay}
        onPause={handlePause}
        onRemove={handleRemove}
      />
    </div>
  );
}
