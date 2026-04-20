import { formatCurrency } from '../../lib/formatters.js';

export function RevenueCard({ amount }) {
  return (
    <section className="card">
      <h3>Today's Revenue</h3>
      <div className="kpi">{formatCurrency(amount)}</div>
    </section>
  );
}
