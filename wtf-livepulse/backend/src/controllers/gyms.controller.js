import { listGyms } from '../services/gymService.js';
import { getLiveSnapshot } from '../services/liveSnapshotService.js';

export async function listGymsController(_req, res, next) {
  try {
    res.json(await listGyms());
  } catch (error) {
    next(error);
  }
}

export async function gymLiveController(req, res, next) {
  try {
    res.json(await getLiveSnapshot(req.params.id));
  } catch (error) {
    next(error);
  }
}
