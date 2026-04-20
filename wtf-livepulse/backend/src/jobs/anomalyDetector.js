import { runAnomalySweep } from '../services/anomalyService.js';

export function startAnomalyDetector() {
  setInterval(async () => {
    try {
      await runAnomalySweep();
    } catch (error) {
      console.error('anomaly detector failed', error);
    }
  }, 30000).unref();
}
