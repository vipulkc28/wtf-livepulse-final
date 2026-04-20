import { pool } from '../db/pool.js';

export async function listGymsWithLiveSummary() {
  const { rows } = await pool.query(`
    SELECT
      g.id,
      g.name,
      g.city,
      g.capacity,
      g.status,
      COALESCE(c.current_occupancy, 0)::int AS current_occupancy,
      COALESCE(p.today_revenue, 0)::numeric AS today_revenue
    FROM gyms g
    LEFT JOIN LATERAL (
      SELECT COUNT(*)::int AS current_occupancy
      FROM checkins c
      WHERE c.gym_id = g.id
        AND c.checked_out IS NULL
    ) c ON TRUE
    LEFT JOIN LATERAL (
      SELECT COALESCE(SUM(amount), 0)::numeric AS today_revenue
      FROM payments p
      WHERE p.gym_id = g.id
        AND p.paid_at >= CURRENT_DATE
    ) p ON TRUE
    ORDER BY g.name ASC
  `);
  return rows.map((row) => ({ ...row, today_revenue: Number(row.today_revenue || 0) }));
}

export async function getGymById(gymId) {
  const { rows } = await pool.query('SELECT * FROM gyms WHERE id = $1', [gymId]);
  return rows[0] || null;
}

export async function listActiveGyms() {
  const { rows } = await pool.query(`SELECT * FROM gyms WHERE status = 'active' ORDER BY name ASC`);
  return rows;
}
