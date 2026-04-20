import { useAppStore } from '../../store/useAppStore.js';
import { formatCurrency } from '../../lib/formatters.js';

export function SummaryBar() {
  const gyms = useAppStore((s) => s.gyms);
  const totalOccupancy = gyms.reduce((sum, gym) => sum + Number(gym.current_occupancy || 0), 0);
  const totalRevenue = gyms.reduce((sum, gym) => sum + Number(gym.today_revenue || 0), 0);
  return (
    <section className="card row gap-lg">
      <div><strong>Total Live Occupancy</strong><div>{totalOccupancy}</div></div>
      <div><strong>Total Today's Revenue</strong><div>{formatCurrency(totalRevenue)}</div></div>
      <div><strong>Gyms</strong><div>{gyms.length}</div></div>
    </section>
  );
}
