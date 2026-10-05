import React, { useState } from 'react';
import StreamCard from './StreamCard';
import { Stream } from '../types/stream';

interface StreamGridProps {
  streams: Stream[];
  onRemoveStream: (id: string) => void;
}

export default function StreamGrid({ streams, onRemoveStream }: StreamGridProps) {
  const [columns, setColumns] = useState<number>(0);

  if (streams.length === 0) {
    return (
      <div className="stream-grid-empty glass animate-in">
        <div className="empty-state-icon">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            <rect x="8" y="14" width="48" height="32" rx="4" stroke="currentColor" strokeWidth="2" opacity="0.3" />
            <path d="M26 24L26 36L38 30L26 24Z" fill="currentColor" opacity="0.4" />
            <path d="M22 50H42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
          </svg>
        </div>
        <h3 className="empty-state-title">No RTSP Streams Added</h3>
        <p className="empty-state-desc">
          Add an RTSP stream URL above or click &quot;Use Demo Stream&quot; to test.
        </p>
      </div>
    );
  }

  const effectiveColumns = columns > 0 ? columns : Math.min(streams.length, 3);

  return (
    <div className="stream-grid-wrapper">
      <div className="grid-controls glass">
        <span className="grid-controls-label">Grid Layout:</span>
        <div className="grid-btn-group">
          <button
            type="button"
            className={`btn btn--xs ${columns === 0 ? 'btn--primary' : 'btn--ghost'}`}
            onClick={() => setColumns(0)}
          >
            Auto
          </button>
          <button
            type="button"
            className={`btn btn--xs ${columns === 1 ? 'btn--primary' : 'btn--ghost'}`}
            onClick={() => setColumns(1)}
          >
            1 Col
          </button>
          <button
            type="button"
            className={`btn btn--xs ${columns === 2 ? 'btn--primary' : 'btn--ghost'}`}
            onClick={() => setColumns(2)}
          >
            2 Cols
          </button>
          <button
            type="button"
            className={`btn btn--xs ${columns === 3 ? 'btn--primary' : 'btn--ghost'}`}
            onClick={() => setColumns(3)}
          >
            3 Cols
          </button>
        </div>
      </div>

      <div
        className="stream-grid"
        style={{
          gridTemplateColumns: `repeat(${effectiveColumns}, minmax(0, 1fr))`,
        }}
      >
        {streams.map((stream) => (
          <StreamCard
            key={stream.id}
            stream={stream}
            onRemove={onRemoveStream}
          />
        ))}
      </div>
    </div>
  );
}
