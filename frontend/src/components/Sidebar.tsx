import React from 'react';

interface SidebarProps {
  streamCount: number;
}

export default function Sidebar({ streamCount }: SidebarProps) {
  return (
    <nav className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M15 10l4.553-2.069A1 1 0 0121 8.845V15.155a1 1 0 01-1.447.914L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="sidebar-brand-text">
          <div className="sidebar-brand-name">Skylark</div>
          <div className="sidebar-brand-tagline">Stream Monitor</div>
        </div>
      </div>

      {/* Navigation */}
      <div className="sidebar-section">
        <div className="sidebar-section-label">Monitoring</div>
        <ul className="sidebar-nav">
          <li className="sidebar-nav-item active">
            <svg className="sidebar-nav-icon" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8"/>
              <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8"/>
              <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8"/>
              <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8"/>
            </svg>
            <span>Dashboard</span>
            {streamCount > 0 && (
              <span className="sidebar-nav-badge">{streamCount}</span>
            )}
          </li>
          <li className="sidebar-nav-item">
            <svg className="sidebar-nav-icon" viewBox="0 0 24 24" fill="none">
              <path d="M15 10l4.553-2.069A1 1 0 0121 8.845V15.155a1 1 0 01-1.447.914L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Streams</span>
          </li>
          <li className="sidebar-nav-item">
            <svg className="sidebar-nav-icon" viewBox="0 0 24 24" fill="none">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Alerts</span>
          </li>
        </ul>

        <div className="sidebar-section-label">System</div>
        <ul className="sidebar-nav">
          <li className="sidebar-nav-item">
            <svg className="sidebar-nav-icon" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/>
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" stroke="currentColor" strokeWidth="1.8"/>
            </svg>
            <span>Settings</span>
          </li>
        </ul>
      </div>

      {/* Footer: System Status */}
      <div className="sidebar-footer">
        <div className="sidebar-system-status">
          <div className="sidebar-status-row">
            <div className="sidebar-status-label">
              <span className="sidebar-status-dot sidebar-status-dot--ok" />
              <span>Backend</span>
            </div>
            <span className="sidebar-status-value">Online</span>
          </div>
          <div className="sidebar-status-row">
            <div className="sidebar-status-label">
              <span className="sidebar-status-dot sidebar-status-dot--ok" />
              <span>MediaMTX</span>
            </div>
            <span className="sidebar-status-value">:8554</span>
          </div>
          <div className="sidebar-status-row">
            <div className="sidebar-status-label">
              <span className="sidebar-status-dot sidebar-status-dot--ok" />
              <span>FFmpeg</span>
            </div>
            <span className="sidebar-status-value">Ready</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
