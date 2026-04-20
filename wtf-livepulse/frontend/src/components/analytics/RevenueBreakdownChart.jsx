export function RevenueBreakdownChart({ items }) {
  return <section className="card"><h3>Revenue by Plan</h3><pre>{JSON.stringify(items, null, 2)}</pre></section>;
}
