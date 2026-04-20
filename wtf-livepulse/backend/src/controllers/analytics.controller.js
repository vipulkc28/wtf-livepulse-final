import { getGymAnalytics } from '../services/analyticsService.js';

export async function gymAnalyticsController(req, res, next) {
  try {
    res.json(await getGymAnalytics(req.params.id, req.query.dateRange || '30d'));
  } catch (error) {
    next(error);
  }
}
