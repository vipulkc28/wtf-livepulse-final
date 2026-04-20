import { listAnomalies } from '../services/anomalyService.js';
import { dismissWarningAnomaly } from '../repositories/anomalyRepository.js';

export async function listAnomaliesController(req, res, next) {
  try {
    res.json(await listAnomalies(req.query.gym_id || null));
  } catch (error) {
    next(error);
  }
}

export async function dismissAnomalyController(req, res, next) {
  try {
    const updated = await dismissWarningAnomaly(req.params.id);
    if (!updated) {
      const err = new Error('Warning anomaly not found or cannot dismiss critical anomaly');
      err.statusCode = 403;
      throw err;
    }
    res.json(updated);
  } catch (error) {
    next(error);
  }
}
