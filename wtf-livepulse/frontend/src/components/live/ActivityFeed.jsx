export function ActivityFeed({ items }) {
  return (
    <section className="card">
      <h3>Activity Feed</h3>
      <ul className="list">
        {items.map((item, idx) => (
          <li key={item.id || idx}>{item.type || item.event_type || 'EVENT'} {item.member_name ? `· ${item.member_name}` : ''}</li>
        ))}
      </ul>
    </section>
  );
}
