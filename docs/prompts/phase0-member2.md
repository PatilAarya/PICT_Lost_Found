# Prompt 0: foundation (Member 2, Claude Code)

Run this in an empty clone of the repo, with CLAUDE.md and DESIGN.md already in the root.
The DESIGN.md text, docs/PROJECT_BRIEF.md, docs/CONTRACT.md and docs/OWNERSHIP.md in this
repo are the exact texts referenced below.

```text
First read CLAUDE.md and DESIGN.md. DESIGN.md is already at the repo root; keep it in version control.

You are setting up the foundation of "PICT Lost and Found", a lost-and-found web app for one college (MERN, JavaScript ES modules, Node 20). Three people will build three modules IN PARALLEL afterwards, so your most important job is a skeleton where each module lives in its own folders and nobody ever needs to edit a shared file. Do NOT build any module features. Build only what is listed below.

STEP 1 - Repo and tooling
- Monorepo with npm workspaces: /client (Vite + React PWA) and /server (Express). ESM everywhere.
- Root scripts: dev (runs both), lint, format, test, seed, build.
- Prettier (single quotes, semicolons, 100 cols), ESLint, .editorconfig, .gitattributes (eol=lf), .gitignore, Vitest on both sides.
- .gitignore must ignore .env and .env.* (except .env.example). Do not list CLAUDE.md there; each member hides it locally.
- Install EVERY dependency now so package.json and package-lock.json are never edited again:
  server: express mongoose zod jsonwebtoken cookie-parser cors helmet express-rate-limit dotenv socket.io cloudinary multer sharp node-cron nodemailer fastest-levenshtein nanoid; dev: vitest supertest mongodb-memory-server
  client: react react-dom react-router-dom axios socket.io-client @tensorflow/tfjs @tensorflow-models/coco-ssd tesseract.js browser-image-compression d3-scale d3-shape @phosphor-icons/react @fontsource-variable/archivo @fontsource-variable/source-sans-3; dev: vite @vitejs/plugin-react vite-plugin-pwa vitest @testing-library/react jsdom
- Import both fonts once in client/src/main.jsx.
- .env.example listing every variable (MONGODB_URI, JWT_SECRET, CLIENT_URL, CLOUDINARY_*, SMTP_*, ALLOWED_EMAIL_DOMAINS=pict.edu, DEV_AUTH=true, ALLOW_ANY_EMAIL=true, HOLD_HOURS_DESK=24, DONATE_AFTER_DAYS=30, HANDOVER_CODE_HOURS=24, MAX_CLAIM_ATTEMPTS=3, LOCKOUT_MINUTES=30). Never create or commit .env.

STEP 2 - Server skeleton (server/src)
  app.js, server.js (http + socket.io; calls each module's init)
  shared/config, shared/db, shared/middleware (requireAuth, requireRole, errorHandler, rateLimit),
  shared/services/registry.js, shared/constants.js, shared/utils/serial.js,
  shared/models/{User,LostReport,FoundItem,Claim}.js, shared/data/{locations.json,desks.json}
  modules/{auth,meta,lost,notifications,found,verify}/  (lost, notifications, found, verify contain only an index.js with an empty router and an empty seed.js)
- Auto-loader: app.js scans modules/*/index.js. Each exports default { name, router, init({ io, services }) } and is mounted at /api/<name>. Adding a module must never require editing app.js.
- scripts/seed.js runs every modules/*/seed.js in alphabetical order. Seeds must be idempotent.
- Error format: { error: { code, message } }. Pagination: ?page&limit.
- Serial numbers: PICT-L-000045 (lost), PICT-F-000123 (found), PICT-C-000007 (claim), using an atomic counters collection.

STEP 3 - Auth (real, finished)
- POST /api/auth/request-code {email}: only emails ending with ALLOWED_EMAIL_DOMAINS (ignored when ALLOW_ANY_EMAIL=true in dev). 6-digit code, stored hashed, 10-minute expiry, max 5 requests per hour per email. Sent via nodemailer; in dev also log it to the console.
- POST /api/auth/verify-code: creates the user on first login (role student), sets an httpOnly JWT cookie (7 days), returns the user.
- GET /api/auth/me, POST /api/auth/logout.
- Dev switcher: when NODE_ENV=development and DEV_AUTH=true, the header x-dev-user: <email> authenticates as that seeded user. The client shows a small DevUserSwitcher (hidden in production).
- modules/auth/seed.js: 6 students, 1 staff, 2 handlers, 1 admin with realistic Indian names.
- Tests: full login flow, role guard, rate limit.

STEP 4 - Contract layer (write EXACTLY as specified in docs/CONTRACT.md)
- constants, the four core models, registry with working STUB implementations that log and return harmless values, locations.json and desks.json with PLACEHOLDER data (2 buildings, 3 floors each, areas with ids; 3 desks), and /api/meta/locations and /api/meta/desks (module meta, public).

STEP 5 - Client skeleton (client/src)
  app/ (App.jsx, router, providers) - the router auto-discovers modules/*/routes.jsx using import.meta.glob and builds the nav from modules/*/nav.js. Never needs editing again.
  shared/api (axios instance with credentials), shared/auth (AuthProvider, useAuth, RequireRole, DevUserSwitcher), shared/realtime (useNotifications stub), shared/constants.js (same values as the server), shared/ui (STUB components with the exact props in the CONTRACT; plain but functional), shared/location-picker (stub with cascading selects, same props as the final one), styles/tokens.css with the real DESIGN.md colour tokens (light and dark).
  modules/{lost,found,verify,notifications}/ each with routes.jsx (default export array of { path, element, roles? }) and nav.js (array of { label, path, roles, order }), each showing a placeholder page.
- PWA manifest and service worker via vite-plugin-pwa. Mobile-first, 360px minimum.

STEP 6 - Docs
- docs/PROJECT_BRIEF.md, docs/CONTRACT.md, docs/OWNERSHIP.md already exist; leave them as they are.
- docs/contributions/member1.md, member2.md, member3.md already exist as templates.
- docs/explain/ folder with a README explaining the repo layout, the module auto-loader, and the service registry, written for students who must explain it in a viva.
- README.md: setup in under 10 commands.

STEP 7 - Verify and finish
Run lint, tests, and boot both apps; confirm: the module loader mounts all 6 modules, GET /api/meta/locations works, the dev switcher logs in as a handler, and every stub registry function can be called. Do NOT run any git command. Tell me the list of files you created and I will commit them myself.

=== OWNERSHIP ===
Member 1: client+server modules/lost, modules/notifications; client shared/ui, shared/location-picker, styles, public/floorplans, public/icons; server shared/data/locations.json; shared/models/LostReport.js.
Member 2: modules/verify (client+server); shared/models/Claim.js; keeper of everything frozen, including shared/models/User.js.
Member 3: modules/found (client+server); shared/data/desks.json; shared/models/FoundItem.js.
Frozen after Phase 0: package.json, lockfile, .env.example, app.js, server.js, client app/, shared/api, shared/auth, shared/realtime hook signature, registry, constants, middleware, auth module, meta module, configs, User.js.
```

When Phase 0 is done, Member 2 tells the group. Everyone pulls main and starts their own prompt.
