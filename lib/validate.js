// Basic checks on incoming referrals.
// TODO: check the referring provider against the credentialing list (RH-212, 2017)
function check(referral, callback) {
  if (!referral) return callback(new Error('missing body'));
  if (!referral.patientMrn) return callback(new Error('patientMrn is required'));
  if (!referral.specialty) return callback(new Error('specialty is required'));
  if (!referral.referringProviderId) return callback(new Error('referringProviderId is required'));
  callback(null);
}

module.exports = { check: check };
