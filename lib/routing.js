// Routes a referral to a department worklist and sets the date it must be scheduled by.
// Policy CL-114: urgent referrals are scheduled within 2 business days,
// routine referrals within 14 calendar days.

var DEPARTMENTS = {
  'cardiology': 'CARD',
  'cardiac surgery': 'CARD',
  'orthopedics': 'ORTHO',
  'sports medicine': 'ORTHO',
  'neurology': 'NEURO',
  'oncology': 'ONC',
  'hematology': 'ONC',
  'dermatology': 'DERM'
};

function routeReferral(referral, callback) {
  // the old scheduling lookup was a network call, so this stayed async
  setTimeout(function () {
    var specialty = (referral.specialty || '').toLowerCase();
    var department = DEPARTMENTS[specialty] || 'GENERAL';
    var received = referral.receivedAt ? new Date(referral.receivedAt) : new Date();
    var due;
    if (referral.priority == 'URGENT') {
      due = addBusinessDays(received, 2);
    } else {
      due = addDays(received, 14);
    }

    var routed = {};
    for (var key in referral) routed[key] = referral[key];
    routed.department = department;
    routed.scheduleBy = due.toISOString().slice(0, 10);
    routed.status = 'ROUTED';
    callback(null, routed);
  }, 5);
}

function addDays(date, days) {
  var d = new Date(date.getTime());
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

function addBusinessDays(date, days) {
  var d = new Date(date.getTime());
  var added = 0;
  while (added < days) {
    d.setUTCDate(d.getUTCDate() + 1);
    var day = d.getUTCDay();
    if (day !== 0 && day !== 6) added++;
  }
  return d;
}

module.exports = {
  routeReferral: routeReferral,
  addDays: addDays,
  addBusinessDays: addBusinessDays
};
