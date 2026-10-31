# ReferralHub intake service

Receives specialist referrals from the fax intake team and (since 2021) the community physician portal. It routes each referral to a department worklist and sets the date it must be scheduled by.

Meridian Health, Integration Engineering. Written in 2014. Maintained by two engineers.

## Run

    npm install
    npm start

Then POST referrals to http://localhost:3000/referrals and read worklists at http://localhost:3000/worklists/<DEPT> (CARD, ORTHO, NEURO, ONC, DERM, GENERAL).

## Scheduling policy CL-114

- Urgent referrals: scheduled within 2 business days.
- Routine referrals: scheduled within 14 calendar days.

## Notes

- Run `npm test` before and after any change. Check with the integration team before changing routing.
- Demo note: Meridian Health is fictional. Everything in data/ is made up. There is no real patient information here.
