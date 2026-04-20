import { useEffect } from 'react';
import { fetchGymAnalytics } from '../api/analytics.js';
import { useAppStore } from '../store/useAppStore.js';

export function useAnalytics(gymId, dateRange = '30d') {
  const setAnalytics = useAppStore((s) => s.setAnalytics);
  const setError = useAppStore((s) => s.setError);

  useEffect(() => {
    if (!gymId) return;
    fetchGymAnalytics(gymId, dateRange).then(setAnalytics).catch((err) => setError(err.message));
  }, [gymId, dateRange, setAnalytics, setError]);
}
