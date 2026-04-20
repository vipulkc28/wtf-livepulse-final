import { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore.js';

export function useWebSocket(url) {
  const applySocketEvent = useAppStore((s) => s.applySocketEvent);
  const setConnectionStatus = useAppStore((s) => s.setConnectionStatus);

  useEffect(() => {
    const ws = new WebSocket(url);
    ws.onopen = () => setConnectionStatus('connected');
    ws.onerror = () => setConnectionStatus('error');
    ws.onclose = () => setConnectionStatus('disconnected');
    ws.onmessage = (message) => {
      try {
        applySocketEvent(JSON.parse(message.data));
      } catch {
        // ignore malformed frames
      }
    };
    return () => ws.close();
  }, [url, applySocketEvent, setConnectionStatus]);
}
