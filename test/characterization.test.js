const { test, before, after } = require('node:test');
const assert = require('node:assert');
const { once } = require('node:events');
const app = require('../app');
const samples = require('../data/sample-referrals.json');

// Expected routing for every sample referral. R-0003 and R-0004 are portal referrals
// marked "urgent" in lower case and must get the CL-114 urgent date.
const EXPECTED = {
  'R-0001': { department: 'CARD', scheduleBy: '2026-11-03' },
  'R-0002': { department: 'ORTHO', scheduleBy: '2026-11-09' },
  'R-0003': { department: 'NEURO', scheduleBy: '2026-11-03' },
  'R-0004': { department: 'ONC', scheduleBy: '2026-10-30' },
  'R-0005': { department: 'DERM', scheduleBy: '2026-11-10' },
  'R-0006': { department: 'ORTHO', scheduleBy: '2026-11-02' }
};

const WORKLISTS = {
  CARD: ['R-0001'],
  ORTHO: ['R-0006', 'R-0002'],
  NEURO: ['R-0003'],
  ONC: ['R-0004'],
  DERM: ['R-0005']
};

let server;
let base;

async function request(method, path, body) {
  const res = await fetch(base + path, {
    method,
    headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  return { status: res.status, body: await res.json() };
}

// Samples are seeded asynchronously when app.js loads, so wait until every one is stored.
async function waitForSamples() {
  const deadline = Date.now() + 2000;
  for (const sample of samples) {
    while ((await request('GET', '/referrals/' + sample.id)).status !== 200) {
      if (Date.now() > deadline) throw new Error('sample ' + sample.id + ' was not seeded');
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
  }
}

before(async () => {
  server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  base = 'http://127.0.0.1:' + server.address().port;
  await waitForSamples();
});

after(async () => {
  server.closeAllConnections();
  server.close();
  await once(server, 'close');
});

test('every sample referral has a pinned expectation', () => {
  assert.deepStrictEqual(samples.map((s) => s.id).sort(), Object.keys(EXPECTED).sort());
});

for (const [id, expected] of Object.entries(EXPECTED)) {
  test(id + ' routes to ' + expected.department + ' with scheduleBy ' + expected.scheduleBy, async () => {
    const res = await request('GET', '/referrals/' + id);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.department, expected.department);
    assert.strictEqual(res.body.scheduleBy, expected.scheduleBy);
    assert.strictEqual(res.body.status, 'ROUTED');
  });
}

for (const [department, ids] of Object.entries(WORKLISTS)) {
  test('worklist ' + department + ' lists ' + ids.join(', ') + ' in scheduleBy order', async () => {
    const res = await request('GET', '/worklists/' + department);
    assert.strictEqual(res.status, 200);
    assert.deepStrictEqual(res.body.map((r) => r.id), ids);
  });
}

test('POST /referrals with an empty body returns 400 patientMrn is required', async () => {
  const res = await request('POST', '/referrals', {});
  assert.strictEqual(res.status, 400);
  assert.deepStrictEqual(res.body, { error: 'patientMrn is required' });
});

test('POST /referrals without specialty returns 400 specialty is required', async () => {
  const res = await request('POST', '/referrals', { patientMrn: 'MRN-DEMO-9001', referringProviderId: 'PRV-DEMO-90' });
  assert.strictEqual(res.status, 400);
  assert.deepStrictEqual(res.body, { error: 'specialty is required' });
});

test('POST /referrals without referringProviderId returns 400 referringProviderId is required', async () => {
  const res = await request('POST', '/referrals', { patientMrn: 'MRN-DEMO-9001', specialty: 'Cardiology' });
  assert.strictEqual(res.status, 400);
  assert.deepStrictEqual(res.body, { error: 'referringProviderId is required' });
});

test('POST /referrals with an invalid receivedAt returns 400 receivedAt must be a valid date', async () => {
  const res = await request('POST', '/referrals', {
    patientMrn: 'MRN-DEMO-9001',
    referringProviderId: 'PRV-DEMO-90',
    specialty: 'Cardiology',
    receivedAt: 'not-a-date'
  });
  assert.strictEqual(res.status, 400);
  assert.deepStrictEqual(res.body, { error: 'receivedAt must be a valid date' });
});

for (const specialty of ['constructor', '__proto__']) {
  test('POST /referrals with specialty ' + JSON.stringify(specialty) + ' routes to GENERAL', async () => {
    const res = await request('POST', '/referrals', {
      patientMrn: 'MRN-DEMO-9003',
      referringProviderId: 'PRV-DEMO-93',
      specialty,
      priority: 'routine',
      receivedAt: '2026-10-28T10:00:00Z'
    });
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.department, 'GENERAL');
  });
}

test('POST /referrals with a valid routine referral returns 201 and stores it', async () => {
  const res = await request('POST', '/referrals', {
    patientMrn: 'MRN-DEMO-9001',
    referringProviderId: 'PRV-DEMO-90',
    specialty: 'Gastroenterology',
    priority: 'routine',
    receivedAt: '2026-10-28T10:00:00Z'
  });
  assert.strictEqual(res.status, 201);
  assert.match(res.body.id, /^R-\d+$/);
  assert.strictEqual(res.body.department, 'GENERAL');
  assert.strictEqual(res.body.scheduleBy, '2026-11-11');
  assert.strictEqual(res.body.status, 'ROUTED');

  const stored = await request('GET', '/referrals/' + res.body.id);
  assert.strictEqual(stored.status, 200);
  assert.deepStrictEqual(stored.body, res.body);
});
