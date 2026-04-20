SELECT * FROM gym_hourly_stats WHERE gym_id = $1 ORDER BY day_of_week, hour_of_day;
