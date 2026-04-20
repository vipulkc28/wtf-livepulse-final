export function CrossGymRevenueChart({ items }) {
  return <section className="card"><h3>Cross-Gym Revenue</h3><pre>{JSON.stringify(items.slice(0, 5), null, 2)}</pre></section>;
}
