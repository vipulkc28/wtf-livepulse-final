export function classifyRisk(lastCheckinAt) {
  if (!lastCheckinAt) return 'UNKNOWN';
  const days = (Date.now() - new Date(lastCheckinAt).getTime()) / (1000 * 60 * 60 * 24);
  if (days > 60) return 'CRITICAL';
  if (days >= 45) return 'HIGH';
  return 'HEALTHY';
}
