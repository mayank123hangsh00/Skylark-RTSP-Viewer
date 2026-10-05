import React, { useState, FormEvent } from 'react';
import { TEST_STREAM_URL } from '../utils/constants';

interface AddStreamFormProps {
  onAddStream: (streamData: { url: string; name: string }) => void;
}

export default function AddStreamForm({ onAddStream }: AddStreamFormProps) {
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      setError('RTSP stream URL is required');
      return;
    }
    if (!trimmedUrl.toLowerCase().startsWith('rtsp://') && !trimmedUrl.toLowerCase().startsWith('rtsps://')) {
      setError('URL must start with rtsp:// or rtsps://');
      return;
    }
    setError('');
    onAddStream({ url: trimmedUrl, name: name.trim() || `CAM-${Date.now().toString().slice(-4)}` });
    setUrl('');
    setName('');
  };

  const handleDemo = () => {
    setUrl(TEST_STREAM_URL);
    setName('Demo Camera');
    setError('');
  };

  return (
    <div className="add-stream-panel">
      <div className="panel-header">
        <div className="panel-header-left">
          <div className="panel-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="2" fill="currentColor"/>
              <path d="M12 2v4M12 18v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M2 12h4M18 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <div className="panel-title">Add RTSP Stream</div>
            <div className="panel-subtitle">Connect to live camera feeds via RTSP protocol</div>
          </div>
        </div>
        <button className="btn btn--sm btn--teal-ghost" onClick={handleDemo} type="button">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M9.19 6.35a7 7 0 100 11.29M14 11H3M3 11l3-3M3 11l3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Load Demo Stream
        </button>
      </div>

      <div className="panel-body">
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-field">
              <label className="form-label" htmlFor="rtsp-url">
                RTSP Stream URL <span className="form-label-required">*</span>
              </label>
              <div className="input-group">
                <svg className="input-group-icon" width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <input
                  id="rtsp-url"
                  type="text"
                  className={`form-input ${error ? 'error' : ''}`}
                  placeholder="rtsp://localhost:8554/live/stream"
                  value={url}
                  onChange={(e) => { setUrl(e.target.value); setError(''); }}
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>
              {error && (
                <div className="form-error">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8"/>
                    <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                  {error}
                </div>
              )}
            </div>

            <div className="form-field form-field--name">
              <label className="form-label" htmlFor="stream-name">
                Camera Name
              </label>
              <div className="input-group">
                <input
                  id="stream-name"
                  type="text"
                  className="form-input no-icon"
                  placeholder="e.g. Front Door — CAM-01"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn btn--md btn--primary btn--icon" style={{ marginTop: '22px' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Add Stream
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
