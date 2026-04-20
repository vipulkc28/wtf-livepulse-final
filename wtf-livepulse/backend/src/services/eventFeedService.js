import { pool } from '../db/pool.js';

export async function getLatestGlobalFeed(limit = 20) {
  const { rows } = await pool.query('SELECT * FROM activity_events ORDER BY occurred_at DESC LIMIT $1', [limit]);
  return rows;
}
