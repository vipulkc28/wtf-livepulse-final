export function ChurnRiskPanel({ items }) {
  return <section className="card"><h3>Churn Risk</h3><pre>{JSON.stringify(items.slice(0, 5), null, 2)}</pre></section>;
}
