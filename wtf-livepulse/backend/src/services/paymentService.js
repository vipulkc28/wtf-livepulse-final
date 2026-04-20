import { pool } from '../db/pool.js';
import { appendActivityEvent } from '../repositories/activityRepository.js';
import { getTodayRevenue } from '../repositories/paymentRepository.js';
import { broadcast } from '../websocket/wsBroadcaster.js';
import { EventTypes } from '../types/events.js';
import { pct } from '../utils/math.js';
import { getGym } from './gymService.js';

export async function createPayment({ memberId, gymId, amount, planType, memberName, paymentType = 'new', timestamp = null }) {
  const effectiveTime = timestamp || new Date();
  await pool.query(
    `INSERT INTO payments (member_id, gym_id, amount, plan_type, payment_type, paid_at)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [memberId, gymId, amount, planType, paymentType, effectiveTime]
  );
  await appendActivityEvent({
    eventType: 'payment',
    gymId,
    memberId,
    memberName,
    amount,
    planType,
    payload: { paymentType, timestamp: effectiveTime.toISOString() }
  });
  const [today_total, gym] = await Promise.all([getTodayRevenue(gymId), getGym(gymId)]);
  broadcast({
    type: EventTypes.PAYMENT_EVENT,
    gym_id: gymId,
    amount,
    plan_type: planType,
    member_name: memberName,
    timestamp: effectiveTime.toISOString(),
    today_total,
    capacity_pct: pct(0, gym?.capacity || 0)
  });
}
