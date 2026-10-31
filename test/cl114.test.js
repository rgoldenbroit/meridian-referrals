const { test } = require('node:test');
const assert = require('node:assert');
const { routeReferral } = require('../lib/routing');

const referral = { patientMrn: 'MRN-DEMO-9100', referringProviderId: 'PRV-DEMO-92', specialty: 'Neurology' };
const WEDNESDAY = '2026-10-28T16:00:00Z';
const FRIDAY = '2026-10-30T15:00:00Z';

for (const priority of ['URGENT', 'urgent', 'Urgent', ' urgent ']) {
  test('priority ' + JSON.stringify(priority) + ' is urgent: due in 2 business days', async () => {
    const routed = await routeReferral(Object.assign({}, referral, { priority, receivedAt: WEDNESDAY }));
    assert.strictEqual(routed.scheduleBy, '2026-10-30');
  });
}

test('urgent referral received on a Friday is due the following Tuesday', async () => {
  const routed = await routeReferral(Object.assign({}, referral, { priority: 'urgent', receivedAt: FRIDAY }));
  assert.strictEqual(routed.scheduleBy, '2026-11-03');
});

test('routine referral is due in 14 calendar days', async () => {
  const routed = await routeReferral(Object.assign({}, referral, { priority: 'routine', receivedAt: WEDNESDAY }));
  assert.strictEqual(routed.scheduleBy, '2026-11-11');
});

test('priority is stored as sent', async () => {
  const routed = await routeReferral(Object.assign({}, referral, { priority: ' urgent ', receivedAt: WEDNESDAY }));
  assert.strictEqual(routed.priority, ' urgent ');
});
