import { getGym } from './gymService.js';
import { getLiveOccupancy, getRecentEvents } from '../repositories/checkinRepository.js';
import { getTodayRevenue } from '../repositories/paymentRepository.js';
import { getActiveAnomalies } from '../repositories/anomalyRepository.js';
import { pct } from '../utils/math.js';

export async function getLiveSnapshot(gymId) {
  const gym = await getGym(gymId);
  if (!gym) {
    const err = new Error('Gym not found');
    err.statusCode = 404;
    throw err;
  }

  const [occupancy, todayRevenue, anomalies, recentEvents] = await Promise.all([
    getLiveOccupancy(gymId),
    getTodayRevenue(gymId),
    getActiveAnomalies(gymId),
    getRecentEvents(gymId, 20)
  ]);

  return {
    gym,
    live: {
      current_occupancy: occupancy,
      capacity_pct: pct(occupancy, gym.capacity),
      today_revenue: todayRevenue,
      active_anomaly_count: anomalies.length
    },
    recent_events: recentEvents,
    active_anomalies: anomalies
  };
}
