import { startSimulator, stopSimulator, resetSimulator } from '../../api/simulator.js';

export function SimulatorControlPanel() {
  return (
    <section className="card">
      <h3>Simulator</h3>
      <div className="row gap-sm">
        <button onClick={() => startSimulator(1)}>Start 1x</button>
        <button onClick={() => startSimulator(5)}>Start 5x</button>
        <button onClick={() => stopSimulator()}>Pause</button>
        <button onClick={() => resetSimulator()}>Reset</button>
      </div>
    </section>
  );
}
