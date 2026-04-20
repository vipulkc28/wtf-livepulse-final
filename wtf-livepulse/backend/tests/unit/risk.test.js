import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyRisk } from '../../src/utils/risk.js';

test('classifyRisk marks critical beyond 60 days', () => {
  const dt = new Date();
  dt.setDate(dt.getDate() - 61);
  assert.equal(classifyRisk(dt.toISOString()), 'CRITICAL');
});

test('classifyRisk marks high beyond 45 days', () => {
  const dt = new Date();
  dt.setDate(dt.getDate() - 50);
  assert.equal(classifyRisk(dt.toISOString()), 'HIGH');
});
