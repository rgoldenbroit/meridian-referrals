# AGENTS.md

## What this service does
ReferralHub intake receives specialist referrals over HTTP from the fax intake team and the community physician portal.
It routes each referral to a department worklist and sets the date it must be scheduled by, under policy CL-114.

## Commands
- `npm install` - install dependencies.
- `npm start` - start the server on `PORT` (default 3000).
- `npm test` - run the tests in `test/` with `node --test`.

## Repository map
- `server.js` - entry point; starts the HTTP server.
- `app.js` - Express app: HTTP routes, request handling, loads sample data at startup.
- `lib/validate.js` - required-field checks on incoming referrals.
- `lib/routing.js` - specialty-to-department mapping and schedule-by dates (CL-114).
- `lib/store.js` - in-memory store for the demo; production uses SQL Server.
- `data/` - fake sample referrals loaded at startup.
- `test/` - tests, named `*.test.js`.
- `package.json` / `package-lock.json` - scripts and pinned dependencies.
- `README.md` - overview and run instructions.

## Conventions
- Node 24, CommonJS (`require` / `module.exports`).
- Keep existing public function names (the exports of `lib/*.js`).
- Do not add dependencies, including dev dependencies.
- Tests use the built-in `node:test` and `node:assert`.
- New code uses async/await, not callbacks.

## Policy CL-114
- Urgent referrals: scheduled within 2 business days.
- Routine referrals: scheduled within 14 calendar days.

## Testing rules
- Before changing anything, add characterization tests that pin current behavior, even where it looks wrong.
- Every routing change needs a test showing the behavior before and after.
- Run `npm test` after every change and show the output.

## Safety
- `data/` holds fake records only.
- Never put real patient data (PHI) in code, tests, logs or prompts.
- Never commit secrets.

## Pull requests
- Small commits. Each behavior fix goes in its own commit.
- PR description covers: what changed, patient impact, how it was tested, how to roll back.
