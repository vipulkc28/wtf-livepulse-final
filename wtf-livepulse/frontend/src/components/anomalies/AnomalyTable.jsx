export function AnomalyTable({ items }) {
  return <section className="card"><h3>Active Anomalies</h3><pre>{JSON.stringify(items, null, 2)}</pre></section>;
}
