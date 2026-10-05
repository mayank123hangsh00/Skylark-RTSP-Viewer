import { StreamStatusType } from '../types/stream';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
export const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';

export const getStreamWsUrl = (streamId: string): string => `${WS_BASE_URL}/ws/stream/${streamId}/`;

export const getStreamsApiUrl = (): string => `${API_BASE_URL}/api/streams/`;

export const GRID_CONFIGS: Record<number, { columns: number }> = {
  1: { columns: 1 },
  2: { columns: 2 },
  3: { columns: 3 },
  4: { columns: 2 },
};

export const STREAM_STATUS: Record<string, StreamStatusType> = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  STREAMING: 'streaming',
  STOPPED: 'stopped',
  ERROR: 'error',
};

export const TEST_STREAM_URL = 'rtsp://demo/test_camera';

export const RECONNECT = {
  MAX_ATTEMPTS: 5,
  BASE_DELAY_MS: 1000,
  MAX_DELAY_MS: 30000,
};
