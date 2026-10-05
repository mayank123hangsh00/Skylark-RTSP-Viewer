export interface Stream {
  id: string;
  url: string;
  name?: string;
  createdAt?: string;
  addedAt?: string;
}

export type StreamStatusType = 
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'streaming'
  | 'stopped'
  | 'error';

export interface UseStreamSocketReturn {
  frame: string | null;
  status: StreamStatusType;
  error: string | null;
  fps: number;
  connect: () => void;
  disconnect: () => void;
  pause: () => void;
  resume: () => void;
  isPlaying: boolean;
}
