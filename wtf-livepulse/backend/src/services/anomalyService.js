import { listActiveGyms } from '../repositories/gymRepository.js';
import { getLiveOccupancy, getGymLastCheckinAt } from '../repositories/checkinRepository.js';
import { getRevenueStatsForGym } from '../repositories/paymentRepository.js';
import {
  getActiveAnomalies,
  getActiveAnomalyByType,
  createAnomaly,
  resolveAnomaly
} from '../repositories/anomalyRepository.js';
import {
  shouldTriggerZeroCheckins,
  shouldTriggerCapacityBreach,
  shouldResolveCapacityBreach,
  shouldTriggerRevenueDrop,
  shouldResolveRevenueDrop
} from './anomalyRules.js';
import { broadcast } from '../websocket/wsBroadcaster.js';
import { EventTypes } from '../types/events.js';

export async function listAnomalies(gymId = null) {
  return getActiveAnomalies(gymId);
}

async function ensureAnomaly({ gym, type, severity, message, triggered, shouldResolve }) {
  const active = await getActiveAnomalyByType(gym.id, type);

  if (triggered && !active) {
    const anomaly = await createAnomaly({ gymId: gym.id, type, severity, message });
    broadcast({
      type: EventTypes.ANOMALY_DETECTED,
      anomaly_id: anomaly.id,
      gym_id: gym.id,
      gym_name: gym.name,
      anomaly_type: type,
      severity,
      message
    });
    return { detected: 1, resolved: 0 };
  }

  if (!triggered && active && shouldResolve) {
    const anomaly = await resolveAnomaly(active.id);
    if (anomaly) {
      broadcast({
        type: EventTypes.ANOMALY_RESOLVED,
        anomaly_id: anomaly.id,
        gym_id: gym.id,
        resolved_at: anomaly.resolved_at
      });
      return { detected: 0, resolved: 1 };
    }
  }

  return { detected: 0, resolved: 0 };
}

export async function runAnomalySweep(now = new Date()) {
  const gyms = await listActiveGyms();
  let detected = 0;
  let resolved = 0;

  for (const gym of gyms) {
    const [occupancy, lastCheckinAt, revenue] = await Promise.all([
      getLiveOccupancy(gym.id),
      getGymLastCheckinAt(gym.id),
      getRevenueStatsForGym(gym.id)
    ]);

    const zeroTriggered = shouldTriggerZeroCheckins({
      status: gym.status,
      now,
      opensAt: gym.opens_at,
      closesAt: gym.closes_at,
      lastCheckinAt
    });
    const zeroResult = await ensureAnomaly({
      gym,
      type: 'zero_checkins',
      severity: 'warning',
      message: `No check-ins recorded in the last 2 hours during operating hours at ${gym.name}.`,
      triggered: zeroTriggered,
      shouldResolve: true
    });
    detected += zeroResult.detected;
    resolved += zeroResult.resolved;

    const capacityTriggered = shouldTriggerCapacityBreach({ occupancy, capacity: gym.capacity });
    const capacityResult = await ensureAnomaly({
      gym,
      type: 'capacity_breach',
      severity: 'critical',
      message: `Live occupancy at ${gym.name} exceeds 90% of capacity.`,
      triggered: capacityTriggered,
      shouldResolve: shouldResolveCapacityBreach({ occupancy, capacity: gym.capacity })
    });
    detected += capacityResult.detected;
    resolved += capacityResult.resolved;

    const revenueTriggered = shouldTriggerRevenueDrop({
      todayRevenue: revenue.todayRevenue,
      sameDayLastWeekRevenue: revenue.sameDayLastWeekRevenue
    });
    const revenueResult = await ensureAnomaly({
      gym,
      type: 'revenue_drop',
      severity: 'warning',
      message: `Today's revenue at ${gym.name} is more than 30% below the same day last week.`,
      triggered: revenueTriggered,
      shouldResolve: shouldResolveRevenueDrop({
        todayRevenue: revenue.todayRevenue,
        sameDayLastWeekRevenue: revenue.sameDayLastWeekRevenue
      })
    });
    detected += revenueResult.detected;
    resolved += revenueResult.resolved;
  }

  return { scanned: gyms.length, detected, resolved };
}
