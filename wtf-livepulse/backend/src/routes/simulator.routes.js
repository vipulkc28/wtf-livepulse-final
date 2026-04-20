import { Router } from 'express';
import { startSimulatorController, stopSimulatorController, resetSimulatorController } from '../controllers/simulator.controller.js';
import { requireSimulatorSpeed } from '../middleware/validateRequest.js';

const router = Router();
router.post('/start', requireSimulatorSpeed, startSimulatorController);
router.post('/stop', stopSimulatorController);
router.post('/reset', resetSimulatorController);
export default router;
