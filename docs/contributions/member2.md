# Member 2 contributions

## Name

Shruti

## Owned paths

client+server modules/verify; shared/models/Claim.js; keeper of everything frozen, including shared/models/User.js

## Features built

### Phase 0: foundation

- npm workspaces, Prettier, ESLint, Vitest, all dependencies installed once.
- Express skeleton with a module auto-loader (`server/src/app.js`) and Socket.IO user rooms.
- Shared contract: constants, User/LostReport/FoundItem/Claim models, service registry with stubs,
  serial numbers, placeholder locations.json and desks.json, `/api/meta/*`.
- Email one-time-code login with JWT cookie, roles, rate limits and the dev user switcher.
- Client shell: router auto-discovery, role-based menu, login page, shared UI stubs, location
  picker stub, design tokens, PWA.

### Phase 1: Verify and Handover

- Tamper-evident custody log: SHA-256 hash chain per item, safe concurrent appends, admin
  integrity check, and `server/scripts/demo-tamper.js` for the demo.
- Owner check: questions only (never answers), Levenshtein scoring, 3 tries, 30-minute then
  24-hour lockouts, every attempt recorded.
- Desk: queue with answers side by side and 10-minute signed links to clear photos, approve or
  reject with a note, receive incoming items.
- Handover: 6-digit code stored as an HMAC hash, shown to the owner once, single use with
  expiry; two-sided confirmation for items the finder kept.
- Hourly lifecycle job (warn, move to admin office after 24 hours, donate after 30 days),
  abuse flags with admin review, audit log, analytics, and demo seed data.
- Screens: my claims, start claim, claim page with Stepper and live lockout countdown, handover
  code stub, handler desk (3 tabs), analytics with hand-built SVG charts, integrity chain
  blocks, flags with a confirm step for Suspend.
- New Claim fields (announced to the group): scores, lockoutCount, itemStatusBefore,
  handoverCodePlain (hidden), handoverShownAt, handoverUsedAt, ownerConfirmedAt,
  finderConfirmedAt, releasedAt.

## Tests

- `server/src/app.test.js`: module loader, meta routes, registry stubs, serials, hidden answers.
- `server/src/modules/auth/auth.test.js`: login flow, role guard, code rate limit, dev switcher.
- `client/src/app/skeleton.test.jsx`: constants match the server, module discovery, UI stubs.
- `server/src/modules/verify/tests/`: custody chain and tamper detection, scoring and both
  lockouts, the full handover code lifecycle, lifecycle rules, flags, analytics, seed.
- `client/src/modules/verify/verify.test.jsx`: chart scale, countdown text, bar chart.

## Demo notes

See docs/explain/auth.md (login) and docs/explain/verify.md (lockout, code release, tamper demo).
