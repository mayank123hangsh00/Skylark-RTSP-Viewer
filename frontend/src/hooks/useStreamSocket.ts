import { useState, useRef, useCallback, useEffect } from 'react';
import { getStreamWsUrl, STREAM_STATUS, RECONNECT } from '../utils/constants';
import { StreamStatusType, UseStreamSocketReturn } from '../types/stream';

export function useStreamSocket(streamId: string, rtspUrl: string): UseStreamSocketReturn {
  const [frame, setFrame] = useState<string | null>(null);
  const [status, setStatus] = useState<StreamStatusType>(STREAM_STATUS.DISCONNECTED);
  const [error, setError] = useState<string | null>(null);
  const [fps, setFps] = useState<number>(0);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef<number>(0);
  const reconnectTimer = useRef<NodeJS.Timeout | number | null>(null);
  const frameCountRef = useRef<number>(0);
  const fpsIntervalRef = useRef<NodeJS.Timeout | number | null>(null);
  const isPlayingRef = useRef<boolean>(false);

  // FPS counter
  useEffect(() => {
    fpsIntervalRef.current = setInterval(() => {
      setFps(frameCountRef.current);
      frameCountRef.current = 0;
    }, 1000);

    return () => {
      if (fpsIntervalRef.current) {
        clearInterval(fpsIntervalRef.current as number);
      }
    };
  }, []);

  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current as number);
      reconnectTimer.current = null;
    }
  }, []);

  const disconnect = useCallback(() => {
    isPlayingRef.current = false;
    clearReconnectTimer();
    if (wsRef.current) {
      wsRef.current.close(1000, 'User disconnected');
      wsRef.current = null;
    }
    setStatus(STREAM_STATUS.DISCONNECTED);
    setFrame(null);
    setFps(0);
    frameCountRef.current = 0;
  }, [clearReconnectTimer]);

  const connect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    clearReconnectTimer();
    setError(null);
    setStatus(STREAM_STATUS.CONNECTING);
    isPlayingRef.current = true;

    const wsUrl = getStreamWsUrl(streamId);
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      reconnectAttempts.current = 0;
      setStatus(STREAM_STATUS.CONNECTED);
      ws.send(JSON.stringify({
        action: 'start',
        url: rtspUrl,
      }));
    };

    ws.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case 'frame':
            setFrame(data.data);
            frameCountRef.current += 1;
            setStatus(STREAM_STATUS.STREAMING);
            setError(null);
            break;

          case 'status':
            setStatus(data.status || STREAM_STATUS.CONNECTED);
            if (data.status === 'stopped') {
              setFps(0);
              frameCountRef.current = 0;
            }
            break;

          case 'error':
            setError(data.message || 'Unknown error occurred.');
            setStatus(STREAM_STATUS.ERROR);
            break;

          default:
            break;
        }
      } catch (e) {
        console.error('Failed to parse WebSocket message:', e);
      }
    };

    ws.onerror = () => {
      setError('WebSocket connection error.');
      setStatus(STREAM_STATUS.ERROR);
    };

    ws.onclose = () => {
      if (!isPlayingRef.current) {
        setStatus(STREAM_STATUS.DISCONNECTED);
        return;
      }

      if (reconnectAttempts.current < RECONNECT.MAX_ATTEMPTS) {
        const delay = Math.min(
          RECONNECT.BASE_DELAY_MS * Math.pow(2, reconnectAttempts.current),
          RECONNECT.MAX_DELAY_MS
        );
        reconnectAttempts.current += 1;
        setStatus(STREAM_STATUS.CONNECTING);
        setError(`Reconnecting... (attempt ${reconnectAttempts.current}/${RECONNECT.MAX_ATTEMPTS})`);

        reconnectTimer.current = setTimeout(() => {
          if (isPlayingRef.current) {
            connect();
          }
        }, delay);
      } else {
        setStatus(STREAM_STATUS.ERROR);
        setError('Connection lost. Max reconnection attempts reached.');
        isPlayingRef.current = false;
      }
    };

    wsRef.current = ws;
  }, [streamId, rtspUrl, clearReconnectTimer]);

  const pause = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action: 'stop' }));
      isPlayingRef.current = false;
      setStatus(STREAM_STATUS.STOPPED);
      setFps(0);
      frameCountRef.current = 0;
    }
  }, []);

  const resume = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action: 'start', url: rtspUrl }));
      isPlayingRef.current = true;
      setStatus(STREAM_STATUS.CONNECTING);
    } else {
      connect();
    }
  }, [rtspUrl, connect]);

  useEffect(() => {
    return () => {
      isPlayingRef.current = false;
      clearReconnectTimer();
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmounted');
      }
    };
  }, [clearReconnectTimer]);

  return {
    frame,
    status,
    error,
    fps,
    connect,
    disconnect,
    pause,
    resume,
    isPlaying: isPlayingRef.current,
  };
}
