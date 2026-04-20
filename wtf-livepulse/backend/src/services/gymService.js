import { listGymsWithLiveSummary, getGymById } from '../repositories/gymRepository.js';
import { pct } from '../utils/math.js';

export async function listGyms() {
  const gyms = await listGymsWithLiveSummary();
  return gyms.map((g) => ({ ...g, capacity_pct: pct(g.current_occupancy, g.capacity) }));
}

export async function getGym(gymId) {
  return getGymById(gymId);
}
