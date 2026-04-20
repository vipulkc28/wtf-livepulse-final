import { pool } from '../db/pool.js';

export async function getTodayRevenue(gymId) {
  const { rows } = await pool.query(
    'SELECT COALESCE(SUM(amount),0)::numeric AS today_revenue FROM payments WHERE gym_id = $1 AND paid_at >= CURRENT_DATE',
    [gymId]
  );
  return Number(rows[0]?.today_revenue || 0);
}

export async function getRevenueStatsForGym(gymId) {
  const { rows } = await pool.query(
    `SELECT
      COALESCE(SUM(amount) FILTER (WHERE paid_at >= CURRENT_DATE), 0)::numeric AS today_revenue,
      COALESCE(SUM(amount) FILTER (
        WHERE paid_at >= date_trunc('day', NOW() - INTERVAL '7 days')
          AND paid_at < date_trunc('day', NOW() - INTERVAL '6 days')
      ), 0)::numeric AS same_day_last_week_revenue
     FROM payments
     WHERE gym_id = $1`,
    [gymId]
  );
  return {
    todayRevenue: Number(rows[0]?.today_revenue || 0),
    sameDayLastWeekRevenue: Number(rows[0]?.same_day_last_week_revenue || 0)
  };
}
