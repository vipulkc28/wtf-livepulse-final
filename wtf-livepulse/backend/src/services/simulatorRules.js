export function weightedRandom(items) {
  const total = items.reduce((sum, item) => sum + Math.max(0, Number(item.weight || 0)), 0);
  if (total <= 0) return items[0] || null;
  let r = Math.random() * total;
  for (const item of items) {
    r -= Math.max(0, Number(item.weight || 0));
    if (r <= 0) return item;
  }
  return items[items.length - 1] || null;
}

export function getTrafficMultiplier(hour) {
  if (hour < 5.5) return 0;
  if (hour < 7) return 0.6;
  if (hour < 10) return 1.0;
  if (hour < 12) return 0.4;
  if (hour < 14) return 0.3;
  if (hour < 17) return 0.2;
  if (hour < 21) return 0.9;
  if (hour <= 22.5) return 0.35;
  return 0;
}

export function getDayMultiplier(day) {
  const map = {1: 1.0, 2: 0.95, 3: 0.90, 4: 0.95, 5: 0.85, 6: 0.70, 0: 0.45};
  return map[day] ?? 0.8;
}

export function decideSimulatorAction({ occupancy, capacity, trafficMultiplier }) {
  const pct = capacity > 0 ? occupancy / capacity : 0;
  const baseCheckin = trafficMultiplier > 0.6 ? 0.72 : trafficMultiplier > 0 ? 0.55 : 0.05;
  const checkoutBias = pct > 0.8 ? 0.65 : pct > 0.5 ? 0.45 : 0.25;
  const paymentChance = trafficMultiplier > 0 ? 0.08 : 0.02;
  const r = Math.random();
  if (r < paymentChance) return 'payment';
  if (r < paymentChance + (1 - checkoutBias) * baseCheckin) return 'checkin';
  return 'checkout';
}
