import { pool } from '../pool.js';
import { GYM_SEED_CONFIG, PLAN_PRICES } from '../../config/constants.js';

const FIRST_NAMES = ['Rahul','Priya','Amit','Neha','Arjun','Sneha','Karan','Pooja','Rohan','Ananya','Vikram','Aisha','Nikhil','Isha','Siddharth','Kavya','Aditya','Meera','Harsh','Simran'];
const LAST_NAMES = ['Sharma','Mehta','Verma','Gupta','Patel','Singh','Nair','Iyer','Reddy','Kapoor','Jain','Mishra','Das','Chopra','Malhotra','Joshi','Bose','Khanna','Yadav','Agarwal'];

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pick(arr) {
  return arr[randInt(0, arr.length - 1)];
}
function randomPhone() {
  return `${pick(['9','8','7'])}${Array.from({ length: 9 }, () => randInt(0, 9)).join('')}`;
}
function randomName(index) {
  const first = FIRST_NAMES[index % FIRST_NAMES.length];
  const last = LAST_NAMES[Math.floor(index / FIRST_NAMES.length) % LAST_NAMES.length];
  return `${first} ${last}`;
}
function randomEmail(name, index) {
  const [first, last] = name.toLowerCase().split(' ');
  return `${first}.${last}${index}@gmail.com`;
}
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}
function addMinutes(date, min) {
  return new Date(date.getTime() + min * 60 * 1000);
}
function addDays(date, days) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}
function durationDays(planType) {
  return planType === 'monthly' ? 30 : planType === 'quarterly' ? 90 : 365;
}
function randomTimeOnDate(date, late = false) {
  const d = new Date(date);
  const blocks = late
    ? [[17, 20], [7, 9], [10, 11], [12, 13], [14, 16], [21, 22]]
    : [[7, 9], [17, 20], [5, 6], [10, 11], [12, 13], [14, 16]];
  const [startH, endH] = blocks[randInt(0, blocks.length - 1)];
  d.setHours(randInt(startH, endH), randInt(0, 59), randInt(0, 59), 0);
  return d;
}
function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function insertRows(table, columns, rows) {
  if (!rows.length) return;
  const cols = columns.join(', ');
  const values = [];
  const placeholders = rows.map((row, rowIndex) => {
    const ps = columns.map((_, colIndex) => `$${rowIndex * columns.length + colIndex + 1}`);
    values.push(...columns.map((c) => row[c]));
    return `(${ps.join(', ')})`;
  }).join(', ');
  await pool.query(`INSERT INTO ${table} (${cols}) VALUES ${placeholders}`, values);
}

async function ensureGyms() {
  const { rows: existing } = await pool.query('SELECT id, name FROM gyms');
  if (existing.length === GYM_SEED_CONFIG.length) {
    return Object.fromEntries(existing.map((r) => [r.name, r.id]));
  }
  for (const gym of GYM_SEED_CONFIG) {
    await pool.query(
      `INSERT INTO gyms (name, city, capacity, opens_at, closes_at, status)
       VALUES ($1, $2, $3, $4, $5, 'active')
       ON CONFLICT DO NOTHING`,
      [gym.name, gym.city, gym.capacity, gym.opens_at, gym.closes_at]
    );
  }
  const { rows } = await pool.query('SELECT id, name FROM gyms');
  return Object.fromEntries(rows.map((r) => [r.name, r.id]));
}

function buildMembers(gymIdMap) {
  const members = [];
  let globalIdx = 1;
  for (const gym of GYM_SEED_CONFIG) {
    const activeCount = Math.round(gym.memberCount * gym.activePct);
    const inactiveCount = Math.round(gym.memberCount * 0.08);
    const frozenCount = gym.memberCount - activeCount - inactiveCount;
    const planTypes = [
      ...Array(gym.monthly).fill('monthly'),
      ...Array(gym.quarterly).fill('quarterly'),
      ...Array(gym.annual).fill('annual')
    ];
    for (let i = 0; i < gym.memberCount; i += 1) {
      const name = randomName(globalIdx);
      const status = i < activeCount ? 'active' : i < activeCount + inactiveCount ? 'inactive' : 'frozen';
      const memberType = i % 5 === 0 ? 'renewal' : 'new';
      const joinedAt = status === 'active' ? addMinutes(daysAgo(randInt(1, 89)), randInt(0, 1439)) : addMinutes(daysAgo(randInt(91, 180)), randInt(0, 1439));
      members.push({
        gym_id: gymIdMap[gym.name],
        gym_name: gym.name,
        name,
        email: randomEmail(name, globalIdx),
        phone: randomPhone(),
        plan_type: planTypes[i],
        member_type: memberType,
        status,
        joined_at: joinedAt,
        plan_expires_at: addDays(joinedAt, durationDays(planTypes[i])),
        seed_segment: 'healthy'
      });
      globalIdx += 1;
    }
  }

  const active = members.filter((m) => m.status === 'active');
  active.slice(0, 150).forEach((m) => { m.seed_segment = 'high'; });
  active.slice(150, 230).forEach((m) => { m.seed_segment = 'critical'; });
  return members;
}

function buildPayments(memberRows) {
  const payments = [];
  for (const member of memberRows) {
    const amount = PLAN_PRICES[member.plan_type];
    const paidAt = addMinutes(new Date(member.joined_at), randInt(-5, 5));
    payments.push({
      member_id: member.id,
      gym_id: member.gym_id,
      amount,
      plan_type: member.plan_type,
      payment_type: 'new',
      paid_at: paidAt,
      notes: 'seed:new'
    });

    if (member.member_type === 'renewal') {
      const renewalAt = addDays(paidAt, durationDays(member.plan_type));
      if (renewalAt < new Date()) {
        payments.push({
          member_id: member.id,
          gym_id: member.gym_id,
          amount,
          plan_type: member.plan_type,
          payment_type: 'renewal',
          paid_at: renewalAt,
          notes: 'seed:renewal'
        });
      }
    }
  }
  return payments;
}

function buildHistoricalCheckins(memberRows) {
  const checkins = [];
  for (const member of memberRows) {
    let visits;
    let latestAgeMin;
    let latestAgeMax;

    if (member.status !== 'active') {
      visits = randInt(4, 10);
      latestAgeMin = 30;
      latestAgeMax = 90;
    } else if (member.seed_segment === 'critical') {
      visits = randInt(8, 18);
      latestAgeMin = 61;
      latestAgeMax = 90;
    } else if (member.seed_segment === 'high') {
      visits = randInt(18, 30);
      latestAgeMin = 45;
      latestAgeMax = 60;
    } else {
      visits = randInt(50, 75);
      latestAgeMin = 1;
      latestAgeMax = 44;
    }

    const latestVisit = randomTimeOnDate(daysAgo(randInt(latestAgeMin, latestAgeMax)), member.seed_segment === 'healthy');
    const historicalVisits = Math.max(1, visits - 1);
    for (let i = 0; i < historicalVisits; i += 1) {
      const visitDate = randomTimeOnDate(daysAgo(randInt(Math.min(latestAgeMax + 1, 2), 90)));
      const duration = randInt(45, 90);
      checkins.push({
        member_id: member.id,
        gym_id: member.gym_id,
        checked_in: visitDate,
        checked_out: addMinutes(visitDate, duration)
      });
    }
    checkins.push({
      member_id: member.id,
      gym_id: member.gym_id,
      checked_in: latestVisit,
      checked_out: addMinutes(latestVisit, randInt(45, 90))
    });
  }
  return checkins;
}

function selectOpenCheckinMembers(memberRows) {
  const byGym = new Map();
  for (const member of memberRows) {
    if (member.status === 'active' && member.seed_segment === 'healthy') {
      if (!byGym.has(member.gym_name)) byGym.set(member.gym_name, []);
      byGym.get(member.gym_name).push(member);
    }
  }
  return byGym;
}

function buildOpenCheckins(memberRows) {
  const byGym = selectOpenCheckinMembers(memberRows);
  const openRows = [];
  const now = new Date();
  const targets = {
    'WTF Gyms — Bandra West': 280,
    'WTF Gyms — Powai': 30,
    'WTF Gyms — Lajpat Nagar': 20,
    'WTF Gyms — Connaught Place': 18,
    'WTF Gyms — Indiranagar': 20,
    'WTF Gyms — Koramangala': 18,
    'WTF Gyms — Banjara Hills': 17,
    'WTF Gyms — Sector 18 Noida': 12,
    'WTF Gyms — Salt Lake': 10,
    'WTF Gyms — Velachery': 0
  };

  for (const [gymName, count] of Object.entries(targets)) {
    const members = byGym.get(gymName) || [];
    for (let i = 0; i < Math.min(count, members.length); i += 1) {
      const checkedIn = addMinutes(now, -randInt(10, 90));
      openRows.push({
        member_id: members[i].id,
        gym_id: members[i].gym_id,
        checked_in: checkedIn,
        checked_out: null
      });
    }
  }

  // Make Velachery explicitly stale.
  const velacheryPool = (byGym.get('WTF Gyms — Velachery') || []).slice(0, 3);
  for (const member of velacheryPool) {
    const checkedIn = addMinutes(now, -(130 + randInt(1, 30)));
    openRows.push({
      member_id: member.id,
      gym_id: member.gym_id,
      checked_in: checkedIn,
      checked_out: addMinutes(checkedIn, randInt(45, 90))
    });
  }

  return openRows;
}

async function buildActivityFromOpenCheckins(openRows, memberMap) {
  const events = openRows.slice(0, 100).map((row) => ({
    event_type: row.checked_out ? 'checkout' : 'checkin',
    gym_id: row.gym_id,
    member_id: row.member_id,
    member_name: memberMap.get(row.member_id)?.name || null,
    amount: null,
    plan_type: null,
    payload: JSON.stringify({ seeded: true }),
    occurred_at: row.checked_in
  }));
  for (const batch of chunk(events, 500)) {
    await insertRows('activity_events', ['event_type','gym_id','member_id','member_name','amount','plan_type','payload','occurred_at'], batch);
  }
}

async function forceSaltLakeRevenueDrop(memberRows) {
  const saltLake = memberRows.filter((m) => m.gym_name === 'WTF Gyms — Salt Lake').slice(0, 12);
  if (saltLake.length < 10) return;
  const gymId = saltLake[0].gym_id;
  await pool.query('DELETE FROM payments WHERE gym_id = $1 AND paid_at >= CURRENT_DATE', [gymId]);

  const lastWeekBase = addMinutes(addDays(new Date(), -7), 9 * 60);
  const todayBase = addMinutes(new Date(), 9 * 60);

  const rows = [];
  for (let i = 0; i < 10; i += 1) {
    rows.push({
      member_id: saltLake[i].id,
      gym_id: gymId,
      amount: i < 5 ? 1499 : 3999,
      plan_type: i < 5 ? 'monthly' : 'quarterly',
      payment_type: 'new',
      paid_at: addMinutes(lastWeekBase, i * 7),
      notes: 'seed:last-week-revenue'
    });
  }
  rows.push({
    member_id: saltLake[10].id,
    gym_id: gymId,
    amount: 1499,
    plan_type: 'monthly',
    payment_type: 'new',
    paid_at: addMinutes(todayBase, 15),
    notes: 'seed:today-revenue-drop'
  });

  for (const batch of chunk(rows, 200)) {
    await insertRows('payments', ['member_id','gym_id','amount','plan_type','payment_type','paid_at','notes'], batch);
  }
}

export async function ensureSeeded() {
  const [{ rows: gymsCountRows }, { rows: memberCountRows }, { rows: checkinCountRows }] = await Promise.all([
    pool.query('SELECT COUNT(*)::int AS count FROM gyms'),
    pool.query('SELECT COUNT(*)::int AS count FROM members'),
    pool.query('SELECT COUNT(*)::int AS count FROM checkins')
  ]);

  const gymsCount = gymsCountRows[0].count;
  const memberCount = memberCountRows[0].count;
  const checkinCount = checkinCountRows[0].count;

  if (gymsCount >= 10 && memberCount >= 5000 && checkinCount >= 200000) {
    return { seeded: false, gymsCount, memberCount, checkinCount };
  }

  console.log('Seeding LivePulse dataset...');
  const gymIdMap = await ensureGyms();

  if (memberCount === 0) {
    console.log('Seeding 5000 members...');
    const members = buildMembers(gymIdMap);
    for (const batch of chunk(members, 500)) {
      await insertRows('members', ['gym_id','name','email','phone','plan_type','member_type','status','joined_at','plan_expires_at'], batch);
    }
  }

  const { rows: memberRows } = await pool.query(`
    SELECT id, gym_id, name, email, phone, plan_type, member_type, status, joined_at, plan_expires_at,
           g.name AS gym_name
    FROM members m
    JOIN gyms g ON g.id = m.gym_id
  `);

  if ((await pool.query('SELECT COUNT(*)::int AS count FROM payments')).rows[0].count === 0) {
    console.log('Seeding payments...');
    const payments = buildPayments(memberRows);
    for (const batch of chunk(payments, 500)) {
      await insertRows('payments', ['member_id','gym_id','amount','plan_type','payment_type','paid_at','notes'], batch);
    }
  }

  if (checkinCount === 0) {
    console.log('Seeding historical check-ins...');
    const historical = buildHistoricalCheckins(memberRows);
    for (const batch of chunk(historical, 2000)) {
      await insertRows('checkins', ['member_id','gym_id','checked_in','checked_out'], batch);
    }
    console.log(`Seeded ${historical.length} historical check-ins.`);
    console.log('Seeding live open sessions and startup anomalies...');
    const openRows = buildOpenCheckins(memberRows);
    for (const batch of chunk(openRows, 1000)) {
      await insertRows('checkins', ['member_id','gym_id','checked_in','checked_out'], batch);
    }
    const memberMap = new Map(memberRows.map((m) => [m.id, m]));
    await buildActivityFromOpenCheckins(openRows, memberMap);
  }

  console.log('Syncing member last_checkin_at...');
  await pool.query(`
    UPDATE members m
    SET last_checkin_at = sub.max_checkin
    FROM (
      SELECT member_id, MAX(checked_in) AS max_checkin
      FROM checkins
      GROUP BY member_id
    ) sub
    WHERE m.id = sub.member_id
  `);

  console.log('Applying Salt Lake revenue-drop scenario...');
  await forceSaltLakeRevenueDrop(memberRows);

  console.log('Refreshing materialized view...');
  await pool.query('REFRESH MATERIALIZED VIEW gym_hourly_stats');
  const counts = await Promise.all([
    pool.query('SELECT COUNT(*)::int AS count FROM gyms'),
    pool.query('SELECT COUNT(*)::int AS count FROM members'),
    pool.query('SELECT COUNT(*)::int AS count FROM checkins'),
    pool.query('SELECT COUNT(*)::int AS count FROM payments')
  ]);

  return {
    seeded: true,
    gymsCount: counts[0].rows[0].count,
    memberCount: counts[1].rows[0].count,
    checkinCount: counts[2].rows[0].count,
    paymentCount: counts[3].rows[0].count
  };
}
