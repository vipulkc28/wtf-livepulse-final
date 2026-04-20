import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('benchmark query file includes hot-path queries', () => {
  const sql = readFileSync(new URL('../../src/db/queries/benchmark_queries.sql', import.meta.url), 'utf8');
  assert.match(sql, /SELECT COUNT\(\*\).*checked_out IS NULL/s);
  assert.match(sql, /SUM\(amount\)/s);
  assert.match(sql, /gym_hourly_stats/s);
});
