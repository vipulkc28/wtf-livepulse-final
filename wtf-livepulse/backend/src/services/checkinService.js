import { pool } from '../db/pool.js';
import { appendActivityEvent } from '../repositories/activityRepository.js';
import { getLiveOccupancy } from '../repositories/checkinRepository.js';
import { getGym } from './gymService.js';
import { updateMemberLastCheckin } from '../repositories/memberRepository.js';
import { broadcast } from '../websocket/wsBroadcaster.js';
import { EventTypes } from '../types/events.js';
import { nowIso } from '../utils/time.js';
import { pct } from '../utils/math.js';

export async function createCheckin({ memberId, gymId, memberName, timestamp = null }) {
  const client = await pool.connect();
  const effectiveTime = timestamp || new Date();
  try {
    await client.query('BEGIN');
    await client.query('INSERT INTO checkins (member_id, gym_id, checked_in) VALUES ($1, $2, $3)', [memberId, gymId, effectiveTime]);
    await client.query('UPDATE members SET last_checkin_at = $2 WHERE id = $1', [memberId, effectiveTime]);
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }

  await appendActivityEvent({ eventType: 'checkin', gymId, memberId, memberName, payload: { timestamp: effectiveTime.toISOString() } });
  const [current_occupancy, gym] = await Promise.all([getLiveOccupancy(gymId), getGym(gymId)]);
  broadcast({
    type: EventTypes.CHECKIN_EVENT,
    gym_id: gymId,
    member_id: memberId,
    member_name: memberName,
    timestamp: effectiveTime.toISOString(),
    current_occupancy,
    capacity_pct: pct(current_occupancy, gym?.capacity || 0)
  });
}

export async function closeCheckin({ checkinId, memberId, gymId, memberName, timestamp = null }) {
  const effectiveTime = timestamp || new Date();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query(
      `UPDATE checkins
       SET checked_out = $2
       WHERE id = $1
         AND checked_out IS NULL
       RETURNING id`,
      [checkinId, effectiveTime]
    );
    if (!result.rowCount) {
      throw Object.assign(new Error('Open check-in not found'), { statusCode: 404 });
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }

  await updateMemberLastCheckin(memberId);
  await appendActivityEvent({ eventType: 'checkout', gymId, memberId, memberName, payload: { timestamp: effectiveTime.toISOString() } });
  const [current_occupancy, gym] = await Promise.all([getLiveOccupancy(gymId), getGym(gymId)]);
  broadcast({
    type: EventTypes.CHECKOUT_EVENT,
    gym_id: gymId,
    member_id: memberId,
    member_name: memberName,
    timestamp: effectiveTime.toISOString(),
    current_occupancy,
    capacity_pct: pct(current_occupancy, gym?.capacity || 0)
  });
}
