# How the repo is put together (viva notes)

This file explains the Phase 0 skeleton: the folder layout, how modules load
themselves, and how modules talk to each other without importing each other.

## 1. Folder layout

```
package.json          npm workspaces: one repo, two apps (client and server)
scripts/dev.js        starts both apps with one command (npm run dev)
server/
  src/app.js          builds Express and mounts every module automatically
  src/server.js       connects MongoDB, opens the port and Socket.IO, runs init()
  src/shared/         things every module uses (config, db, middleware, models,
                      constants, service registry, serial numbers, mailer)
  src/modules/<name>/ one folder per feature: auth, meta, lost, notifications,
                      found, verify. Each has index.js and seed.js.
  scripts/seed.js     runs every module's seed.js
client/
  src/main.jsx        entry point: fonts, styles, <App />
  src/app/            App, shell, login, and module discovery (never edited again)
  src/shared/         api (axios), auth (login state), realtime (Socket.IO),
                      ui (shared components), location-picker, constants
  src/modules/<name>/ routes.jsx and nav.js per module, plus its pages
```

The rule that keeps three people out of each other's way: **you only edit your
own module folders**. Shared files are frozen after Phase 0 (see docs/OWNERSHIP.md).

## 2. The module auto-loader (server)

1. `app.js` reads the list of folders in `src/modules` with `fs.readdirSync`.
2. For each folder that has an `index.js`, it imports it with `import()`.
3. Each `index.js` exports `{ name, router, init }`.
4. `app.js` mounts the router at `/api/<name>`, for example `/api/verify`.
5. After start-up, `server.js` calls `init({ io, services })` on every module.

So a new module is just a new folder. Nobody edits `app.js`, so there are no merge
conflicts in it.

On Windows, `import()` needs a `file://` URL, not `C:\...`, which is why we use
`pathToFileURL`.

## 3. The module auto-loader (client)

`client/src/app/moduleDiscovery.js` uses Vite's `import.meta.glob` to collect every
`modules/*/routes.jsx` (pages) and `modules/*/nav.js` (menu items). `App.jsx` turns
the routes into `<Route>`s, wrapping a route in `<RequireRole>` when it has a `roles`
list. `AppShell.jsx` shows only the menu items the user's role is allowed to see.

## 4. The service registry

Modules must not import each other's code. Instead, `server/src/shared/services/registry.js`
holds four named functions:

| Service                          | Real version comes from |
| -------------------------------- | ----------------------- |
| `notify(...)`                    | notifications           |
| `runMatching({ foundItemId })`   | lost                    |
| `appendCustody({ itemId, ... })` | verify                  |
| `getHiddenDetailPrompts(cat)`    | found                   |

At start every function is a **stub** that logs and returns a harmless value, so each
module runs on its own from day 1. When a module starts, its `init()` calls
`registerService('appendCustody', realFunction)` and from then on everyone gets the real
one. Always call `services.appendCustody(...)` at the moment you need it; do not copy
the function into a variable early, or you might keep the stub.

## 5. Other shared pieces

- **Errors** always look like `{ error: { code, message } }`. Routes `throw new HttpError(...)`
  and `middleware/errorHandler.js` sends it. Express 5 catches errors from async routes.
- **Serial numbers** (`PICT-F-000123`) come from `utils/serial.js`, which uses one atomic
  `$inc` on a counters collection, so two requests can never get the same number.
- **Secrets in models**: `FoundItem.hiddenDetails.answer` and `Claim.handoverCodeHash` have
  `select: false`, so ordinary queries never load them.
- **Live updates**: every Socket.IO connection joins the room `user:<userId>`, so the server
  can message one person with `io.to('user:' + id).emit('notification', doc)`.

## 6. Questions a teacher might ask

1. **Why npm workspaces?** One install and one lockfile for both apps, and root scripts that
   run both.
2. **How is a module mounted without editing app.js?** app.js scans the modules folder and
   imports each index.js, then mounts its router at /api/<name>.
3. **Why a service registry instead of imports?** So modules stay independent: Found can call
   matching even before Lost exists, and nobody edits another person's files.
4. **What is a stub?** A stand-in function that does nothing harmful, so code that calls it
   works before the real version exists.
5. **What does import.meta.glob do?** Vite finds all files matching a pattern at build time and
   imports them for us.
6. **Why do routes have a roles list and the server check roles again?** The client check only
   hides pages; anyone can call the API directly, so the server must enforce it.
7. **How are serial numbers unique?** One atomic database update increments and returns the
   counter.
8. **How does the server find which socket belongs to which user?** On connect it reads the login
   cookie, finds the user id and joins the room user:<id>.
9. **Where do errors go?** Thrown in a route, caught by the error handler, sent as
   { error: { code, message } }.
10. **How do you add a new module?** Create server/src/modules/<name>/index.js and seed.js, and
    client/src/modules/<name>/routes.jsx and nav.js. Nothing else.
