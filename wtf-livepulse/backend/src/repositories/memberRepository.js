import { pool } from '../db/pool.js';

export async function getChurnRiskMembers(gymId) {
  const { rows } = await pool.query(
    `SELECT id, name, last_checkin_at
     FROM members
     WHERE status = 'active'
       AND gym_id = $1
       AND last_checkin_at < NOW() - INTERVAL '45 days'
     ORDER BY last_checkin_at ASC
     LIMIT 100`,
    [gymId]
  );
  return rows;
}

export async function updateMemberLastCheckin(memberId, timestamp = null) {
  const query = timestamp
    ? `UPDATE members SET last_checkin_at = $2 WHERE id = $1`
    : `UPDATE members
       SET last_checkin_at = (
         SELECT MAX(checked_in) FROM checkins WHERE member_id = $1
       )
       WHERE id = $1`;
  const values = timestamp ? [memberId, timestamp] : [memberId];
  await pool.query(query, values);
}

export async function syncAllMemberLastCheckins() {
  await pool.query(`
    UPDATE members m
    SET last_checkin_at = c.max_checkin
    FROM (
      SELECT member_id, MAX(checked_in) AS max_checkin
      FROM checkins
      GROUP BY member_id
    ) c
    WHERE m.id = c.member_id
  `);
}
