import { create } from 'zustand';

function updateGymSummary(gyms, gymId, updater) {
  return gyms.map((gym) => (gym.id === gymId ? { ...gym, ...updater(gym) } : gym));
}

export const useAppStore = create((set) => ({
  gyms: [],
  selectedGymId: null,
  liveSnapshot: null,
  analytics: null,
  anomalies: [],
  activityFeed: [],
  connectionStatus: 'connecting',
  simulator: { status: 'paused', speed: 1 },
  error: null,
  setGyms: (gyms) => set({ gyms, selectedGymId: gyms[0]?.id ?? null }),
  setSelectedGymId: (selectedGymId) => set({ selectedGymId }),
  setLiveSnapshot: (liveSnapshot) => set({
    liveSnapshot,
    anomalies: liveSnapshot?.active_anomalies ?? [],
    activityFeed: liveSnapshot?.recent_events ?? []
  }),
  setAnalytics: (analytics) => set({ analytics }),
  setConnectionStatus: (connectionStatus) => set({ connectionStatus }),
  setError: (error) => set({ error }),
  applySocketEvent: (event) => set((state) => {
    const next = {
      activityFeed: [event, ...state.activityFeed].slice(0, 20)
    };

    if (event.type === 'CHECKIN_EVENT' || event.type === 'CHECKOUT_EVENT') {
      next.gyms = updateGymSummary(state.gyms, event.gym_id, (gym) => ({
        current_occupancy: event.current_occupancy,
        capacity_pct: gym.capacity ? Number(((event.current_occupancy / gym.capacity) * 100).toFixed(2)) : 0
      }));
      if (state.liveSnapshot?.gym?.id === event.gym_id) {
        next.liveSnapshot = {
          ...state.liveSnapshot,
          live: {
            ...state.liveSnapshot.live,
            current_occupancy: event.current_occupancy,
            capacity_pct: event.capacity_pct ?? state.liveSnapshot.live?.capacity_pct ?? 0
          }
        };
      }
    }

    if (event.type === 'PAYMENT_EVENT') {
      next.gyms = updateGymSummary(state.gyms, event.gym_id, (gym) => ({
        today_revenue: event.today_total ?? gym.today_revenue
      }));
      if (state.liveSnapshot?.gym?.id === event.gym_id) {
        next.liveSnapshot = {
          ...state.liveSnapshot,
          live: {
            ...state.liveSnapshot.live,
            today_revenue: event.today_total ?? state.liveSnapshot.live?.today_revenue ?? 0
          }
        };
      }
    }

    if (event.type === 'ANOMALY_DETECTED') {
      next.anomalies = [{
        id: event.anomaly_id,
        gym_id: event.gym_id,
        gym_name: event.gym_name,
        type: event.anomaly_type,
        severity: event.severity,
        message: event.message,
        resolved: false,
        dismissed: false,
        detected_at: new Date().toISOString()
      }, ...state.anomalies];
      if (state.liveSnapshot?.gym?.id === event.gym_id) {
        next.liveSnapshot = {
          ...state.liveSnapshot,
          active_anomalies: next.anomalies,
          live: {
            ...state.liveSnapshot.live,
            active_anomaly_count: (state.liveSnapshot.live?.active_anomaly_count ?? 0) + 1
          }
        };
      }
    }

    if (event.type === 'ANOMALY_RESOLVED') {
      next.anomalies = state.anomalies.filter((a) => a.id !== event.anomaly_id);
      if (state.liveSnapshot?.gym?.id === event.gym_id) {
        next.liveSnapshot = {
          ...state.liveSnapshot,
          active_anomalies: next.anomalies,
          live: {
            ...state.liveSnapshot.live,
            active_anomaly_count: Math.max(0, (state.liveSnapshot.live?.active_anomaly_count ?? 1) - 1)
          }
        };
      }
    }

    return next;
  })
}));
