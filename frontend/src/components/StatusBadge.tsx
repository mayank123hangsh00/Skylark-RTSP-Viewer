import React from 'react';
import { STREAM_STATUS } from '../utils/constants';
import { StreamStatusType } from '../types/stream';

interface StatusBadgeProps {
  status: StreamStatusType;
  fps?: number;
}

export default function StatusBadge({ status, fps = 0 }: StatusBadgeProps) {
  const getBadgeInfo = () => {
    switch (status) {
      case STREAM_STATUS.STREAMING:
        return { label: `LIVE ${fps ? `(${fps} FPS)` : ''}`, classModifier: 'live' };
      case STREAM_STATUS.CONNECTING:
        return { label: 'CONNECTING', classModifier: 'connecting' };
      case STREAM_STATUS.CONNECTED:
        return { label: 'CONNECTED', classModifier: 'connected' };
      case STREAM_STATUS.STOPPED:
        return { label: 'PAUSED', classModifier: 'stopped' };
      case STREAM_STATUS.ERROR:
        return { label: 'ERROR', classModifier: 'error' };
      case STREAM_STATUS.DISCONNECTED:
      default:
        return { label: 'OFFLINE', classModifier: 'offline' };
    }
  };

  const { label, classModifier } = getBadgeInfo();

  return (
    <div className={`status-badge status-badge--${classModifier}`}>
      <span className="status-badge-dot" />
      <span className="status-badge-text">{label}</span>
    </div>
  );
}
