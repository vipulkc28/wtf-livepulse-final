import { pool } from '../db/pool.js';

export function startMaterializedViewRefresh() {
  setInterval(async () => {
    try {
      await pool.query('REFRESH MATERIALIZED VIEW CONCURRENTLY gym_hourly_stats');
    } catch (error) {
      console.error('materialized view refresh failed', error.message);
    }
  }, 15 * 60 * 1000).unref();
}
