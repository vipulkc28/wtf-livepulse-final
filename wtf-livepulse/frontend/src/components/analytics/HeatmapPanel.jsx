export function HeatmapPanel({ items }) {
  return <section className="card"><h3>7-Day Heatmap</h3><pre>{JSON.stringify(items.slice(0, 8), null, 2)}</pre></section>;
}
