export function RenewalDonut({ data }) {
  return <section className="card"><h3>New vs Renewal</h3><div>New {data.new_pct}% · Renewal {data.renewal_pct}%</div></section>;
}
