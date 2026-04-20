export function isWithinOperatingHours(now, opensAt, closesAt) {
  const current = now.getHours() * 60 + now.getMinutes();
  const [openH, openM] = String(opensAt).split(':').map(Number);
  const [closeH, closeM] = String(closesAt).split(':').map(Number);
  const open = openH * 60 + openM;
  const close = closeH * 60 + closeM;
  return current >= open && current <= close;
}

export function shouldTriggerZeroCheckins({ status, now = new Date(), opensAt, closesAt, lastCheckinAt }) {
  if (status !== 'active') return false;
  if (!isWithinOperatingHours(now, opensAt, closesAt)) return false;
  if (!lastCheckinAt) return true;
  const hoursSince = (now.getTime() - new Date(lastCheckinAt).getTime()) / (1000 * 60 * 60);
  return hoursSince >= 2;
}

export function shouldTriggerCapacityBreach({ occupancy, capacity }) {
  if (!capacity) return false;
  return occupancy / capacity > 0.9;
}

export function shouldResolveCapacityBreach({ occupancy, capacity }) {
  if (!capacity) return true;
  return occupancy / capacity < 0.85;
}

export function shouldTriggerRevenueDrop({ todayRevenue, sameDayLastWeekRevenue }) {
  if (sameDayLastWeekRevenue <= 0) return false;
  return todayRevenue < sameDayLastWeekRevenue * 0.7;
}

export function shouldResolveRevenueDrop({ todayRevenue, sameDayLastWeekRevenue }) {
  if (sameDayLastWeekRevenue <= 0) return true;
  return todayRevenue >= sameDayLastWeekRevenue * 0.8;
}
