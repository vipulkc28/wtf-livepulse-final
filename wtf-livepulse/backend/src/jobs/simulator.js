import { getSimulatorState, runSimulationTick } from '../services/simulatorService.js';

export function startSimulator() {
  setInterval(async () => {
    try {
      const state = getSimulatorState();
      if (state.status !== 'running') return;
      await runSimulationTick(new Date());
    } catch (error) {
      console.error('simulator loop failed', error);
    }
  }, 2000).unref();
}
