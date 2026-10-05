import React from 'react';
import { STREAM_STATUS } from '../utils/constants';
import { StreamStatusType } from '../types/stream';

interface StatusBadgeProps {
  status: StreamStatusType;
  fps?: number;
}

export default function StatusBadge({ status, fps = 0 }: StatusBadgeProps) {
  const info: Record<string, { label: string; cls: string }> = {
    [STREAM_STATUS.STREAMING]:   { label: fps ? `LIVE · ${fps} FPS` : 'LIVE',       cls: 'live' },
    [STREAM_STATUS.CONNECTING]:  { label: 'CONNECTING',   cls: 'connecting' },
    [STREAM_STATUS.CONNECTED]:   { label: 'CONNECTED',    cls: 'connected' },
    [STREAM_STATUS.STOPPED]:     { label: 'PAUSED',       cls: 'stopped' },
    [STREAM_STATUS.ERROR]:       { label: 'ERROR',         cls: 'error' },
    [STREAM_STATUS.DISCONNECTED]:{ label: 'OFFLINE',      cls: 'offline' },
  };

  const { label, cls } = info[status] ?? { label: 'UNKNOWN', cls: 'offline' };

  return (
    <div className={`status-badge status-badge--${cls}`}>
      <span className="status-badge-dot" />
      {label}
    </div>
  );
}
