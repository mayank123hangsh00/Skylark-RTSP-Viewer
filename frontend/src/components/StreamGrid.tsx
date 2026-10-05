import React from 'react';
import StreamCard from './StreamCard';
import { Stream } from '../types/stream';

interface StreamGridProps {
  streams: Stream[];
  columns: number;
  onColumnsChange: (n: number) => void;
  onRemoveStream: (id: string) => void;
}

const LAYOUT_ICONS: Record<number, React.ReactNode> = {
  1: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="2" width="12" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
  2: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="2" width="6" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="9" y="2" width="6" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
  3: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <rect x="0.5" y="2" width="4" height="12" rx="1" stroke="currentColor" strokeWidth="1.3"/>
      <rect x="6" y="2" width="4" height="12" rx="1" stroke="currentColor" strokeWidth="1.3"/>
      <rect x="11.5" y="2" width="4" height="12" rx="1" stroke="currentColor" strokeWidth="1.3"/>
    </svg>
  ),
  4: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3"/>
      <rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3"/>
      <rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3"/>
      <rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3"/>
    </svg>
  ),
};

export default function StreamGrid({ streams, columns, onColumnsChange, onRemoveStream }: StreamGridProps) {
  const effectiveCols = columns > 0 ? columns : Math.min(streams.length, 3) || 1;
  const gridClass = `stream-grid stream-grid--${effectiveCols}`;

  return (
    <div className="streams-section">
      {/* Toolbar */}
      <div className="section-toolbar">
        <div className="section-toolbar-left">
          <h2 className="section-title">Live Streams</h2>
          <span className="section-count">{streams.length}</span>
        </div>

        <div className="layout-switcher" title="Grid layout">
          <button
            className={`layout-btn ${columns === 0 ? 'active' : ''}`}
            onClick={() => onColumnsChange(0)}
            title="Auto layout"
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path d="M2 6h5M2 10h5M9 6h5M9 10h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
          {[1, 2, 3, 4].map((n) => (
            <button
              key={n}
              className={`layout-btn ${columns === n ? 'active' : ''}`}
              onClick={() => onColumnsChange(n)}
              title={`${n} column${n > 1 ? 's' : ''}`}
            >
              {LAYOUT_ICONS[n]}
            </button>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {streams.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon-wrap">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" opacity="0.5"/>
              <path d="M10 8l6 4-6 4V8z" fill="currentColor" opacity="0.35"/>
              <path d="M8 21h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
            </svg>
          </div>
          <div className="empty-state-title">No streams configured</div>
          <div className="empty-state-desc">
            Add an RTSP stream URL above to begin live monitoring. You can view multiple camera feeds simultaneously in a responsive grid layout.
          </div>
        </div>
      ) : (
        <div className={gridClass}>
          {streams.map((stream) => (
            <StreamCard
              key={stream.id}
              stream={stream}
              onRemove={onRemoveStream}
            />
          ))}
        </div>
      )}
    </div>
  );
}
