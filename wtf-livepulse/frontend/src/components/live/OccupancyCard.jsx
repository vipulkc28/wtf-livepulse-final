import { occupancyTone } from '../../lib/colors.js';

export function OccupancyCard({ occupancy, capacity }) {
  const pct = capacity ? (occupancy / capacity) * 100 : 0;
  return (
    <section className={`card ${occupancyTone(pct)}`}>
      <h3>Live Occupancy</h3>
      <div className="kpi">{occupancy}</div>
      <div>{pct.toFixed(1)}%</div>
    </section>
  );
}
