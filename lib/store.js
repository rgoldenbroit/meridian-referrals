// In-memory store for the demo. Production uses the ReferralHub SQL Server database.
var referrals = {};
var nextId = 1000;

function save(referral, callback) {
  setTimeout(function () {
    var copy = {};
    for (var key in referral) copy[key] = referral[key];
    copy.id = referral.id || 'R-' + (nextId++);
    referrals[copy.id] = copy;
    callback(null, copy);
  }, 1);
}

function get(id, callback) {
  setTimeout(function () {
    callback(null, referrals[id] || null);
  }, 1);
}

function byDepartment(department, callback) {
  setTimeout(function () {
    var list = [];
    for (var id in referrals) {
      if (referrals[id].department === department.toUpperCase()) list.push(referrals[id]);
    }
    list.sort(function (a, b) { return a.scheduleBy < b.scheduleBy ? -1 : 1; });
    callback(null, list);
  }, 1);
}

module.exports = { save: save, get: get, byDepartment: byDepartment };
