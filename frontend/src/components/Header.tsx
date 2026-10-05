import React from 'react';

interface HeaderProps {
  streamCount: number;
  currentTime: Date;
}

export default function Header({ streamCount, currentTime }: HeaderProps) {
  const timeStr = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  });
  const dateStr = currentTime.toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  });

  return (
    <header className="header">
      <div className="header-left">
        <div className="header-breadcrumb">
          <span className="header-breadcrumb-root">Skylark</span>
          <span className="header-breadcrumb-sep">/</span>
          <span className="header-title">Stream Monitor</span>
        </div>
      </div>

      <div className="header-right">
        <div className="header-time">
          {dateStr} &nbsp;·&nbsp; {timeStr}
        </div>
        <div className="header-divider" />
        <div className={`header-status-pill ${streamCount === 0 ? '' : ''}`}>
          <span className="header-status-dot" />
          <span className="header-status-text">
            {streamCount === 0 ? 'No Streams' : `${streamCount} Active`}
          </span>
        </div>
        <div className="header-divider" />
        <button className="header-icon-btn" title="Notifications">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button className="header-icon-btn" title="Help">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8"/>
            <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </button>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--accent), #00a8d4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.6875rem', fontWeight: 700, color: 'var(--bg-base)',
          letterSpacing: '0.02em', cursor: 'pointer', flexShrink: 0,
        }}>
          SK
        </div>
      </div>
    </header>
  );
}
