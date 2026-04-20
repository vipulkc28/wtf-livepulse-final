import { startSimulatorService, stopSimulatorService, resetSimulatorService } from '../services/simulatorService.js';

export async function startSimulatorController(req, res, next) {
  try {
    res.json(startSimulatorService(Number(req.body.speed)));
  } catch (error) {
    next(error);
  }
}

export async function stopSimulatorController(_req, res, next) {
  try {
    res.json(stopSimulatorService());
  } catch (error) {
    next(error);
  }
}

export async function resetSimulatorController(_req, res, next) {
  try {
    res.json(resetSimulatorService());
  } catch (error) {
    next(error);
  }
}
