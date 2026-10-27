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

## Tests

- `server/src/app.test.js`: module loader, meta routes, registry stubs, serials, hidden answers.
- `server/src/modules/auth/auth.test.js`: login flow, role guard, code rate limit, dev switcher.
- `client/src/app/skeleton.test.jsx`: constants match the server, module discovery, UI stubs.

## Demo notes

See docs/explain/auth.md for the login demo script.
