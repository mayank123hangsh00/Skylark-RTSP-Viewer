import React from 'react';
import { STREAM_STATUS } from '../utils/constants';
import { StreamStatusType } from '../types/stream';

interface StreamControlsProps {
  status: StreamStatusType;
  onPlay: () => void;
  onPause: () => void;
  onRemove: () => void;
}

export default function StreamControls({
  status,
  onPlay,
  onPause,
  onRemove,
}: StreamControlsProps) {
  const isPlaying = status === STREAM_STATUS.STREAMING || status === STREAM_STATUS.CONNECTING;

  return (
    <div className="stream-controls">
      <div className="stream-controls-group">
        {isPlaying ? (
          <button
            type="button"
            className="btn btn--secondary btn--icon"
            onClick={onPause}
            title="Pause stream"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="3" y="2" width="3.5" height="12" rx="1" fill="currentColor" />
              <rect x="9.5" y="2" width="3.5" height="12" rx="1" fill="currentColor" />
            </svg>
            <span>Pause</span>
          </button>
        ) : (
          <button
            type="button"
            className="btn btn--primary btn--icon"
            onClick={onPlay}
            title="Play stream"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3.5 2.5L13.5 8L3.5 13.5V2.5Z" fill="currentColor" />
            </svg>
            <span>Play</span>
          </button>
        )}
      </div>

      <button
        type="button"
        className="btn btn--danger btn--icon"
        onClick={onRemove}
        title="Remove stream"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M2 4H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M5 4V2.5C5 2.22386 5.22386 2 5.5 2H10.5C10.7761 2 11 2.22386 11 2.5V4" stroke="currentColor" strokeWidth="1.5" />
          <path d="M3.5 4L4.25 13C4.3 13.5 4.7 14 5.2 14H10.8C11.3 14 11.7 13.5 11.75 13L12.5 4" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        <span>Remove</span>
      </button>
    </div>
  );
}
