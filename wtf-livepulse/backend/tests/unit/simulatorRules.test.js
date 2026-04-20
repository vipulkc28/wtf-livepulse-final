import test from 'node:test';
import assert from 'node:assert/strict';
import { getTrafficMultiplier, getDayMultiplier, decideSimulatorAction } from '../../src/services/simulatorRules.js';

test('traffic multiplier peaks in morning rush', () => {
  assert.equal(getTrafficMultiplier(8), 1.0);
  assert.equal(getTrafficMultiplier(23), 0);
});

test('day multiplier recognizes quiet sunday', () => {
  assert.equal(getDayMultiplier(0), 0.45);
  assert.equal(getDayMultiplier(1), 1.0);
});

test('simulator action returns one of expected types', () => {
  const action = decideSimulatorAction({ occupancy: 10, capacity: 100, trafficMultiplier: 1 });
  assert.ok(['checkin', 'checkout', 'payment'].includes(action));
});
