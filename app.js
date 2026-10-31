var express = require('express');
var bodyParser = require('body-parser');
var validate = require('./lib/validate');
var routing = require('./lib/routing');
var store = require('./lib/store');
var samples = require('./data/sample-referrals.json');

var app = express();
app.use(bodyParser.json());

// Load last week's referrals so the worklists aren't empty on startup
samples.forEach(function (referral) {
  routing.routeReferral(referral, function (err, routed) {
    if (err) return console.log('could not route sample ' + referral.id);
    store.save(routed, function () {});
  });
});

app.post('/referrals', function (req, res) {
  var referral = req.body;
  validate.check(referral, function (err) {
    if (err) return res.status(400).json({ error: err.message });
    routing.routeReferral(referral, function (err, routed) {
      if (err) return res.status(500).json({ error: 'routing failed' });
      store.save(routed, function (err, saved) {
        if (err) return res.status(500).json({ error: 'save failed' });
        res.status(201).json(saved);
      });
    });
  });
});

app.get('/referrals/:id', function (req, res) {
  store.get(req.params.id, function (err, referral) {
    if (err) return res.status(500).json({ error: 'lookup failed' });
    if (!referral) return res.status(404).json({ error: 'not found' });
    res.json(referral);
  });
});

app.get('/worklists/:department', function (req, res) {
  store.byDepartment(req.params.department, function (err, list) {
    if (err) return res.status(500).json({ error: 'lookup failed' });
    res.json(list);
  });
});

module.exports = app;
