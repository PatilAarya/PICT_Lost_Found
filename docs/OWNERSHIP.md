# Ownership

Rule: edit only your own paths. Frozen files change only through a GitHub Issue,
then a tiny PR by the keeper, the same day.

**Acting keeper and acting Found owner: Member 1.** Member 2 and Member 3 are both away.
The team agreed (28 Oct 2026) that Member 1 acts as keeper of the frozen files and also
maintains the Found module (bug fixes and finishing) until they are back. Member 2 still
owns the Verify module; nobody else edits `modules/verify` or `Claim.js`. Every change made
on someone else's behalf is listed in `docs/contributions/member1.md`, so they can review it.

## Who builds what
| | Member 1 (Claude Code) | Member 2 (Claude Code) | Member 3 (Arena) |
|---|---|---|---|
| Foundation | Design system, location picker, app shell, **acting keeper of frozen files** | Phase 0 (done): skeleton, login, shared contract | None, starts with the module |
| Module | Lost + Notifications (live updates) | Verify and Handover (done, merged) | Found + photo pipeline |
| Branch | feat/lost, plus keeper/* branches for frozen-file fixes | phase0/foundation, then feat/verify | feat/found |
| Special data | locations.json, floor plan images | none | desks.json |

## Folder ownership
| Path | Owner |
|---|---|
| client/src/modules/lost/, server/src/modules/lost/ | Member 1 |
| client/src/modules/notifications/, server/src/modules/notifications/ | Member 1 |
| client/src/modules/devui/ (dev-only component gallery) | Member 1 |
| client/src/shared/ui/, client/src/shared/location-picker/, client/src/styles/, client/public/floorplans/, client/public/icons/, server/src/shared/data/locations.json, server/src/shared/models/LostReport.js | Member 1 |
| client/src/modules/verify/, server/src/modules/verify/, server/src/shared/models/Claim.js | Member 2 |
| Everything frozen after Phase 0 (configs, loaders, auth, registry, constants, User.js) | Member 1 (acting keeper while Member 2 is away) |
| client/src/modules/found/, server/src/modules/found/, server/src/shared/data/desks.json, server/src/shared/models/FoundItem.js | Member 3 (Member 1 maintains it while Member 3 is away) |

## Ownership block (verbatim)
```
=== OWNERSHIP ===
Member 1: client+server modules/lost, modules/notifications, modules/devui; client shared/ui, shared/location-picker, styles, public/floorplans, public/icons; server shared/data/locations.json; shared/models/LostReport.js; ACTING KEEPER of everything frozen while Member 2 is away.
Member 2: modules/verify (client+server); shared/models/Claim.js; keeper of everything frozen when back.
Member 3: modules/found (client+server); shared/data/desks.json; shared/models/FoundItem.js. Maintained by Member 1 while Member 3 is away.
Frozen after Phase 0: package.json, lockfile, .env.example, app.js, server.js, client app/, shared/api, shared/auth, shared/realtime hook signature, registry, constants, middleware, auth module, meta module, configs, User.js.
```

## How a frozen-file change happens now
1. Open a GitHub Issue that says which frozen file and why (Member 3 included).
2. Member 1 makes the change on a separate `keeper/<short-name>` branch, never mixed with
   Lost or Notifications work, and opens a small PR into main.
3. After it is merged, everyone runs `git pull --rebase origin main` on their own branch.
4. Every keeper PR is listed in `docs/contributions/member1.md` under "Keeper changes",
   so Member 2 can see exactly what changed while they were away.

## Service implementations (unchanged, they follow modules)
- notify: notifications (Member 1)
- runMatching: lost (Member 1)
- appendCustody: verify (Member 2)
- getHiddenDetailPrompts: found (Member 3)
