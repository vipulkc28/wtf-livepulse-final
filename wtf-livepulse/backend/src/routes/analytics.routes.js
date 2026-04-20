import { Router } from 'express';
import { getCrossGymRevenue } from '../services/analyticsService.js';

const router = Router();
router.get('/cross-gym', async (_req, res, next) => {
  try {
    res.json(await getCrossGymRevenue());
  } catch (error) {
    next(error);
  }
});
export default router;
