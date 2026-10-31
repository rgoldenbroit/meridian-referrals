// Basic checks on incoming referrals.
// TODO: check the referring provider against the credentialing list (RH-212, 2017)
async function check(referral) {
  if (!referral) throw new Error('missing body');
  if (!referral.patientMrn) throw new Error('patientMrn is required');
  if (!referral.specialty) throw new Error('specialty is required');
  if (!referral.referringProviderId) throw new Error('referringProviderId is required');
  if (referral.receivedAt && isNaN(new Date(referral.receivedAt).getTime())) {
    throw new Error('receivedAt must be a valid date');
  }
}

module.exports = { check };
