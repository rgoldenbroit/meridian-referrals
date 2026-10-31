// Routes a referral to a department worklist and sets the date it must be scheduled by.
// Policy CL-114: urgent referrals are scheduled within 2 business days,
// routine referrals within 14 calendar days.

const DEPARTMENTS = {
  'cardiology': 'CARD',
  'cardiac surgery': 'CARD',
  'orthopedics': 'ORTHO',
  'sports medicine': 'ORTHO',
  'neurology': 'NEURO',
  'oncology': 'ONC',
  'hematology': 'ONC',
  'dermatology': 'DERM'
};

async function routeReferral(referral) {
  const specialty = (referral.specialty || '').toLowerCase();
  const department = DEPARTMENTS[specialty] || 'GENERAL';
  const received = referral.receivedAt ? new Date(referral.receivedAt) : new Date();
  const due = referral.priority == 'URGENT' ? addBusinessDays(received, 2) : addDays(received, 14);

  const routed = Object.assign({}, referral);
  routed.department = department;
  routed.scheduleBy = due.toISOString().slice(0, 10);
  routed.status = 'ROUTED';
  return routed;
}

function addDays(date, days) {
  const d = new Date(date.getTime());
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

function addBusinessDays(date, days) {
  const d = new Date(date.getTime());
  let added = 0;
  while (added < days) {
    d.setUTCDate(d.getUTCDate() + 1);
    const day = d.getUTCDay();
    if (day !== 0 && day !== 6) added++;
  }
  return d;
}

module.exports = {
  routeReferral,
  addDays,
  addBusinessDays
};
