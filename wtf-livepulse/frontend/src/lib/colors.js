export function occupancyTone(pct) {
  if (pct > 85) return 'critical';
  if (pct >= 60) return 'warning';
  return 'healthy';
}
