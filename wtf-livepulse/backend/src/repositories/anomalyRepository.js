import { pool } from '../db/pool.js';

export async function getActiveAnomalies(gymId = null) {
  const base = `
    SELECT a.*, g.name AS gym_name
    FROM anomalies a
    JOIN gyms g ON g.id = a.gym_id
    WHERE a.resolved = FALSE
      AND a.dismissed = FALSE
  `;
  const query = gymId ? `${base} AND a.gym_id = $1 ORDER BY a.detected_at DESC` : `${base} ORDER BY a.detected_at DESC`;
  const { rows } = await pool.query(query, gymId ? [gymId] : []);
  return rows;
}

export async function getActiveAnomalyByType(gymId, type) {
  const { rows } = await pool.query(
    `SELECT * FROM anomalies WHERE gym_id = $1 AND type = $2 AND resolved = FALSE ORDER BY detected_at DESC LIMIT 1`,
    [gymId, type]
  );
  return rows[0] || null;
}

export async function createAnomaly({ gymId, type, severity, message }) {
  const { rows } = await pool.query(
    `INSERT INTO anomalies (gym_id, type, severity, message, resolved, dismissed, detected_at)
     VALUES ($1, $2, $3, $4, FALSE, FALSE, NOW())
     RETURNING *`,
    [gymId, type, severity, message]
  );
  return rows[0];
}

export async function resolveAnomaly(id) {
  const { rows } = await pool.query(
    `UPDATE anomalies
     SET resolved = TRUE, resolved_at = NOW()
     WHERE id = $1 AND resolved = FALSE
     RETURNING *`,
    [id]
  );
  return rows[0] || null;
}

export async function dismissWarningAnomaly(id) {
  const { rows } = await pool.query(
    `UPDATE anomalies
     SET dismissed = TRUE
     WHERE id = $1 AND severity = 'warning' AND resolved = FALSE
     RETURNING *`,
    [id]
  );
  return rows[0] || null;
}
