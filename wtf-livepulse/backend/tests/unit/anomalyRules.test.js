import test from 'node:test';
import assert from 'node:assert/strict';
import {
  shouldTriggerZeroCheckins,
  shouldTriggerCapacityBreach,
  shouldResolveCapacityBreach,
  shouldTriggerRevenueDrop,
  shouldResolveRevenueDrop
} from '../../src/services/anomalyRules.js';

test('zero check-ins triggers during operating hours after 2 hours', () => {
  const now = new Date('2026-04-17T08:00:00Z');
  assert.equal(shouldTriggerZeroCheckins({
    status: 'active',
    now,
    opensAt: '05:30',
    closesAt: '22:30',
    lastCheckinAt: '2026-04-17T05:30:00Z'
  }), true);
});

test('capacity breach thresholds behave as expected', () => {
  assert.equal(shouldTriggerCapacityBreach({ occupancy: 91, capacity: 100 }), true);
  assert.equal(shouldResolveCapacityBreach({ occupancy: 84, capacity: 100 }), true);
});

test('revenue drop thresholds behave as expected', () => {
  assert.equal(shouldTriggerRevenueDrop({ todayRevenue: 60, sameDayLastWeekRevenue: 100 }), true);
  assert.equal(shouldResolveRevenueDrop({ todayRevenue: 80, sameDayLastWeekRevenue: 100 }), true);
});
