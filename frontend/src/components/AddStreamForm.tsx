import React, { useState, FormEvent } from 'react';
import { TEST_STREAM_URL } from '../utils/constants';

interface AddStreamFormProps {
  onAddStream: (streamData: { url: string; name: string }) => void;
}

export default function AddStreamForm({ onAddStream }: AddStreamFormProps) {
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedUrl = url.trim();

    if (!trimmedUrl) {
      setValidationError('Please enter an RTSP stream URL');
      return;
    }

    if (!trimmedUrl.toLowerCase().startsWith('rtsp://') && !trimmedUrl.toLowerCase().startsWith('rtsps://')) {
      setValidationError('URL must start with rtsp:// or rtsps://');
      return;
    }

    setValidationError('');
    onAddStream({
      url: trimmedUrl,
      name: name.trim() || 'RTSP Stream',
    });

    setUrl('');
    setName('');
  };

  const handleUseDemo = () => {
    setUrl(TEST_STREAM_URL);
    setName('Demo Camera');
    setValidationError('');
  };

  return (
    <div className="add-stream-card glass animate-in">
      <div className="add-stream-header">
        <h2 className="add-stream-title">Add RTSP Stream</h2>
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={handleUseDemo}
        >
          Use Demo Stream
        </button>
      </div>

      <form onSubmit={handleSubmit} className="add-stream-form">
        <div className="form-group">
          <label htmlFor="stream-url" className="form-label">
            RTSP Stream URL <span className="required">*</span>
          </label>
          <div className="input-wrapper">
            <svg className="input-icon" width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M7.5 10.5L10.5 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M9 6L11.25 3.75C12.0784 2.92157 13.4216 2.92157 14.25 3.75V3.75C15.0784 4.57843 15.0784 5.92157 14.25 6.75L12 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M9 12L6.75 14.25C5.92157 15.0784 4.57843 15.0784 3.75 14.25V14.25C2.92157 13.4216 2.92157 12.0784 3.75 11.25L6 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              id="stream-url"
              type="text"
              className={`input ${validationError ? 'input--error' : ''}`}
              placeholder="rtsp://localhost:8554/live/stream or demo URL..."
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (validationError) setValidationError('');
              }}
            />
          </div>
          {validationError && (
            <span className="form-error">{validationError}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="stream-name" className="form-label">
            Stream Name <span className="optional">(optional)</span>
          </label>
          <div className="input-wrapper">
            <input
              id="stream-name"
              type="text"
              className="input"
              placeholder="e.g. Front Door Camera"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>

        <button type="submit" className="btn btn--primary add-stream-btn">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 3.75V14.25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M3.75 9H14.25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Add Stream
        </button>
      </form>
    </div>
  );
}
