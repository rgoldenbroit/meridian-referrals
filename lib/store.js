// In-memory store for the demo. Production uses the ReferralHub SQL Server database.
const referrals = {};
let nextId = 1000;

async function save(referral) {
  const copy = Object.assign({}, referral);
  copy.id = referral.id || 'R-' + nextId++;
  referrals[copy.id] = copy;
  return copy;
}

async function get(id) {
  return referrals[id] || null;
}

async function byDepartment(department) {
  const list = [];
  for (const id in referrals) {
    if (referrals[id].department === department.toUpperCase()) list.push(referrals[id]);
  }
  list.sort((a, b) => (a.scheduleBy < b.scheduleBy ? -1 : 1));
  return list;
}

module.exports = { save, get, byDepartment };
