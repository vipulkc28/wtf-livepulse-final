import { Router } from 'express';
import { listGymsController, gymLiveController } from '../controllers/gyms.controller.js';
import { gymAnalyticsController } from '../controllers/analytics.controller.js';

const router = Router();
router.get('/', listGymsController);
router.get('/:id/live', gymLiveController);
router.get('/:id/analytics', gymAnalyticsController);
export default router;
