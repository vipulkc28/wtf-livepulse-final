import { Router } from 'express';
import { dismissAnomalyController, listAnomaliesController } from '../controllers/anomalies.controller.js';

const router = Router();
router.get('/', listAnomaliesController);
router.patch('/:id/dismiss', dismissAnomalyController);
export default router;
