import React from 'react';

interface HeaderProps {
  streamCount: number;
}

export default function Header({ streamCount }: HeaderProps) {
  return (
    <header className="header glass">
      <div className="header-container">
        <div className="header-brand">
          <div className="header-logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="header-titles">
            <h1 className="header-title">Skylark Stream Viewer</h1>
            <span className="header-subtitle">Real-time RTSP Video Monitor</span>
          </div>
        </div>
        <div className="header-status">
          <span className="header-badge">
            <span className="header-badge-dot" />
            {streamCount} {streamCount === 1 ? 'Stream' : 'Streams'} Active
          </span>
        </div>
      </div>
    </header>
  );
}
