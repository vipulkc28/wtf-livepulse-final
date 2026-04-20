-- Run with:
-- EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT) <query>;

-- Q1 Live Occupancy — Single Gym
SELECT COUNT(*)
FROM checkins
WHERE gym_id = '<GYM_UUID>'
  AND checked_out IS NULL;

-- Q2 Today's Revenue — Single Gym
SELECT SUM(amount)
FROM payments
WHERE gym_id = '<GYM_UUID>'
  AND paid_at >= CURRENT_DATE;

-- Q3 Churn Risk Members
SELECT id, name, last_checkin_at
FROM members
WHERE status = 'active'
  AND last_checkin_at < NOW() - INTERVAL '45 days'
  AND gym_id = '<GYM_UUID>';

-- Q4 Peak Hour Heatmap (7d)
SELECT *
FROM gym_hourly_stats
WHERE gym_id = '<GYM_UUID>';

-- Q5 Cross-Gym Revenue Comparison
SELECT gym_id, SUM(amount)
FROM payments
WHERE paid_at >= NOW() - INTERVAL '30 days'
GROUP BY gym_id
ORDER BY SUM(amount) DESC;

-- Q6 Active Anomalies
SELECT *
FROM anomalies
WHERE gym_id = '<GYM_UUID>'
  AND resolved = FALSE
ORDER BY detected_at DESC;
