const express = require('express');
const bodyParser = require('body-parser');
const validate = require('./lib/validate');
const routing = require('./lib/routing');
const store = require('./lib/store');
const samples = require('./data/sample-referrals.json');

const app = express();
app.use(bodyParser.json());

async function loadSample(referral) {
  let routed;
  try {
    routed = await routing.routeReferral(referral);
  } catch {
    console.log('could not route sample ' + referral.id);
    return;
  }
  try {
    await store.save(routed);
  } catch {
    // Save failures for samples have never been reported.
  }
}

// Load last week's referrals so the worklists aren't empty on startup
samples.forEach(loadSample);

app.post('/referrals', async (req, res) => {
  const referral = req.body;
  try {
    await validate.check(referral);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  let routed;
  try {
    routed = await routing.routeReferral(referral);
  } catch {
    return res.status(500).json({ error: 'routing failed' });
  }

  let saved;
  try {
    saved = await store.save(routed);
  } catch {
    return res.status(500).json({ error: 'save failed' });
  }
  res.status(201).json(saved);
});

app.get('/referrals/:id', async (req, res) => {
  let referral;
  try {
    referral = await store.get(req.params.id);
  } catch {
    return res.status(500).json({ error: 'lookup failed' });
  }
  if (!referral) return res.status(404).json({ error: 'not found' });
  res.json(referral);
});

app.get('/worklists/:department', async (req, res) => {
  let list;
  try {
    list = await store.byDepartment(req.params.department);
  } catch {
    return res.status(500).json({ error: 'lookup failed' });
  }
  res.json(list);
});

module.exports = app;
