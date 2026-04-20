import { pool } from '../db/pool.js';

export async function appendActivityEvent({ eventType, gymId, memberId = null, memberName = null, amount = null, planType = null, payload = {} }) {
  await pool.query(
    `INSERT INTO activity_events (event_type, gym_id, member_id, member_name, amount, plan_type, payload, occurred_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
    [eventType, gymId, memberId, memberName, amount, planType, JSON.stringify(payload)]
  );
}
