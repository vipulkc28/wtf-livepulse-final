import { listActiveGyms } from '../repositories/gymRepository.js';
import { getLiveOccupancy, getRandomEligibleMemberForCheckin, getRandomOpenCheckin } from '../repositories/checkinRepository.js';
import { createCheckin, closeCheckin } from './checkinService.js';
import { createPayment } from './paymentService.js';
import { getTrafficMultiplier, getDayMultiplier, weightedRandom, decideSimulatorAction } from './simulatorRules.js';
import { PLAN_PRICES } from '../config/constants.js';
import { pool } from '../db/pool.js';

let simulatorState = { status: 'paused', speed: 1, ticks: 0 };

export function getSimulatorState() {
  return simulatorState;
}

export function startSimulatorService(speed) {
  simulatorState = { ...simulatorState, status: 'running', speed };
  return simulatorState;
}

export function stopSimulatorService() {
  simulatorState = { ...simulatorState, status: 'paused' };
  return simulatorState;
}

export async function resetSimulatorService() {
  await pool.query(`
    UPDATE checkins
    SET checked_out = NOW()
    WHERE checked_out IS NULL
      AND checked_in >= CURRENT_DATE
      AND gym_id <> (SELECT id FROM gyms WHERE name = 'WTF Gyms — Bandra West' LIMIT 1)
  `);
  simulatorState = { status: 'paused', speed: 1, ticks: 0 };
  return { status: 'reset' };
}

export async function runSimulationTick(now = new Date()) {
  const gyms = await listActiveGyms();
  if (!gyms.length) return { generated: 0 };

  let generated = 0;
  const hour = now.getHours() + now.getMinutes() / 60;
  const dayMultiplier = getDayMultiplier(now.getDay());
  const trafficMultiplier = getTrafficMultiplier(hour);

  for (let i = 0; i < simulatorState.speed; i += 1) {
    const weightedGyms = gyms.map((gym) => ({
      gym,
      weight: Math.max(1, gym.capacity * Math.max(0.1, trafficMultiplier) * dayMultiplier)
    }));
    const selected = weightedRandom(weightedGyms)?.gym;
    if (!selected) continue;

    const occupancy = await getLiveOccupancy(selected.id);
    const action = decideSimulatorAction({
      occupancy,
      capacity: selected.capacity,
      trafficMultiplier
    });

    if (action === 'checkin') {
      const member = await getRandomEligibleMemberForCheckin(selected.id);
      if (member) {
        await createCheckin({ memberId: member.id, gymId: selected.id, memberName: member.name, timestamp: now });
        generated += 1;
      }
      continue;
    }

    if (action === 'checkout') {
      const open = await getRandomOpenCheckin(selected.id);
      if (open) {
        await closeCheckin({
          checkinId: open.id,
          memberId: open.member_id,
          gymId: selected.id,
          memberName: open.member_name,
          timestamp: now
        });
        generated += 1;
      }
      continue;
    }

    const member = await getRandomEligibleMemberForCheckin(selected.id);
    if (member) {
      await createPayment({
        memberId: member.id,
        gymId: selected.id,
        memberName: member.name,
        planType: member.plan_type,
        amount: PLAN_PRICES[member.plan_type],
        paymentType: member.member_type === 'renewal' ? 'renewal' : 'new',
        timestamp: now
      });
      generated += 1;
    }
  }

  simulatorState = { ...simulatorState, ticks: simulatorState.ticks + 1 };
  return { generated };
}
