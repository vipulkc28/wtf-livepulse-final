import { pool } from '../db/pool.js';

export async function getLiveOccupancy(gymId) {
  const { rows } = await pool.query(
    'SELECT COUNT(*)::int AS current_occupancy FROM checkins WHERE gym_id = $1 AND checked_out IS NULL',
    [gymId]
  );
  return rows[0]?.current_occupancy || 0;
}

export async function getRecentEvents(gymId, limit = 20) {
  const { rows } = await pool.query(
    `SELECT * FROM activity_events WHERE gym_id = $1 ORDER BY occurred_at DESC LIMIT $2`,
    [gymId, limit]
  );
  return rows;
}

export async function getRandomEligibleMemberForCheckin(gymId) {
  const { rows } = await pool.query(
    `SELECT m.id, m.name, m.plan_type, m.member_type
     FROM members m
     WHERE m.gym_id = $1
       AND m.status = 'active'
       AND NOT EXISTS (
         SELECT 1 FROM checkins c
         WHERE c.member_id = m.id AND c.checked_out IS NULL
       )
     ORDER BY random()
     LIMIT 1`,
    [gymId]
  );
  return rows[0] || null;
}

export async function getRandomOpenCheckin(gymId) {
  const { rows } = await pool.query(
    `SELECT c.id, c.member_id, m.name AS member_name
     FROM checkins c
     JOIN members m ON m.id = c.member_id
     WHERE c.gym_id = $1
       AND c.checked_out IS NULL
     ORDER BY random()
     LIMIT 1`,
    [gymId]
  );
  return rows[0] || null;
}

export async function getGymLastCheckinAt(gymId) {
  const { rows } = await pool.query(
    `SELECT MAX(checked_in) AS last_checkin_at
     FROM checkins
     WHERE gym_id = $1`,
    [gymId]
  );
  return rows[0]?.last_checkin_at || null;
}
