import { useEffect } from 'react';
import { fetchGymLive } from '../api/gyms.js';
import { useAppStore } from '../store/useAppStore.js';

export function useGymData(gymId) {
  const setLiveSnapshot = useAppStore((s) => s.setLiveSnapshot);
  const setError = useAppStore((s) => s.setError);

  useEffect(() => {
    if (!gymId) return;
    fetchGymLive(gymId).then(setLiveSnapshot).catch((err) => setError(err.message));
  }, [gymId, setLiveSnapshot, setError]);
}
