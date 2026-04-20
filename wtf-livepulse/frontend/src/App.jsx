import { useEffect } from 'react';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { useWebSocket } from './hooks/useWebSocket.js';
import { fetchGyms } from './api/gyms.js';
import { useAppStore } from './store/useAppStore.js';

export default function App() {
  const setGyms = useAppStore((s) => s.setGyms);
  const setError = useAppStore((s) => s.setError);
  useWebSocket(`${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.hostname}:3001/ws`);

  useEffect(() => {
    fetchGyms().then(setGyms).catch((err) => setError(err.message));
  }, [setGyms, setError]);

  return <DashboardPage />;
}
