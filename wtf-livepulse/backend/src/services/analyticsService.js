import { pool } from '../db/pool.js';
import { getChurnRiskMembers } from '../repositories/memberRepository.js';
import { classifyRisk } from '../utils/risk.js';

function intervalFor(dateRange) {
  return dateRange === '7d' ? '7 days' : dateRange === '90d' ? '90 days' : '30 days';
}

export async function getGymAnalytics(gymId, dateRange = '30d') {
  const interval = intervalFor(dateRange);

  const [heatmapRes, revenueRes, renewalRes, crossGymRes] = await Promise.all([
    pool.query(
      'SELECT day_of_week, hour_of_day, checkin_count FROM gym_hourly_stats WHERE gym_id = $1 ORDER BY day_of_week, hour_of_day',
      [gymId]
    ),
    pool.query(
      `SELECT plan_type, SUM(amount)::numeric AS total_amount
       FROM payments
       WHERE gym_id = $1 AND paid_at >= NOW() - $2::interval
       GROUP BY plan_type
       ORDER BY total_amount DESC`,
      [gymId, interval]
    ),
    pool.query(
      `SELECT payment_type, COUNT(*)::int AS total_count
       FROM payments
       WHERE gym_id = $1 AND paid_at >= NOW() - $2::interval
       GROUP BY payment_type`,
      [gymId, interval]
    ),
    getCrossGymRevenue()
  ]);

  const churn = await getChurnRiskMembers(gymId);
  const paymentTypeMap = Object.fromEntries(renewalRes.rows.map((r) => [r.payment_type, Number(r.total_count)]));
  const newCount = paymentTypeMap.new || 0;
  const renewalCount = paymentTypeMap.renewal || 0;
  const total = newCount + renewalCount || 1;

  return {
    heatmap: heatmapRes.rows.map((r) => ({ ...r, checkin_count: Number(r.checkin_count) })),
    revenue_by_plan: revenueRes.rows.map((r) => ({ ...r, total_amount: Number(r.total_amount) })),
    churn_risk_members: churn.map((m) => ({ ...m, risk_level: classifyRisk(m.last_checkin_at) })),
    new_vs_renewal: {
      new_count: newCount,
      renewal_count: renewalCount,
      new_pct: Number(((newCount / total) * 100).toFixed(2)),
      renewal_pct: Number(((renewalCount / total) * 100).toFixed(2))
    },
    cross_gym: crossGymRes
  };
}

export async function getCrossGymRevenue() {
  const { rows } = await pool.query(
    `SELECT
      g.id AS gym_id,
      g.name AS gym_name,
      SUM(p.amount)::numeric AS total_revenue,
      DENSE_RANK() OVER (ORDER BY SUM(p.amount) DESC) AS rank
     FROM payments p
     JOIN gyms g ON g.id = p.gym_id
     WHERE p.paid_at >= NOW() - INTERVAL '30 days'
     GROUP BY g.id, g.name
     ORDER BY total_revenue DESC`
  );
  return rows.map((r) => ({ ...r, total_revenue: Number(r.total_revenue) }));
}
