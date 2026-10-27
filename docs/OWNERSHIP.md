# Ownership

Rule: edit only your own paths. Frozen files change only through a GitHub Issue,
then a tiny PR by the keeper (Member 2), the same day.

## Who builds what
| | Member 1 (Claude Code) | Member 2 (Claude Code) | Member 3 (Arena) |
|---|---|---|---|
| Foundation | Design system, location picker, app shell | Phase 0: skeleton, login, shared contract | None, starts with the module |
| Module | Lost + Notifications (live updates) | Verify and Handover | Found + photo pipeline |
| Branch | feat/lost | phase0/foundation, then feat/verify | feat/found |
| Special data | locations.json, floor plan images | none | desks.json |

## Folder ownership
| Path | Owner |
|---|---|
| client/src/modules/lost/, server/src/modules/lost/ | Member 1 |
| client/src/modules/notifications/, server/src/modules/notifications/ | Member 1 |
| client/src/shared/ui/, client/src/shared/location-picker/, client/src/styles/, client/public/floorplans/, client/public/icons/, server/src/shared/data/locations.json, server/src/shared/models/LostReport.js | Member 1 |
| client/src/modules/verify/, server/src/modules/verify/, server/src/shared/models/Claim.js | Member 2 |
| Everything frozen after Phase 0 (configs, loaders, auth, registry, constants, User.js) | Member 2 (keeper) |
| client/src/modules/found/, server/src/modules/found/, server/src/shared/data/desks.json, server/src/shared/models/FoundItem.js | Member 3 |

## Ownership block (verbatim)
```
=== OWNERSHIP ===
Member 1: client+server modules/lost, modules/notifications; client shared/ui, shared/location-picker, styles, public/floorplans, public/icons; server shared/data/locations.json; shared/models/LostReport.js.
Member 2: modules/verify (client+server); shared/models/Claim.js; keeper of everything frozen, including shared/models/User.js.
Member 3: modules/found (client+server); shared/data/desks.json; shared/models/FoundItem.js.
Frozen after Phase 0: package.json, lockfile, .env.example, app.js, server.js, client app/, shared/api, shared/auth, shared/realtime hook signature, registry, constants, middleware, auth module, meta module, configs, User.js.
```

## Service implementations (unchanged, they follow modules)
- notify: notifications (Member 1)
- runMatching: lost (Member 1)
- appendCustody: verify (Member 2)
- getHiddenDetailPrompts: found (Member 3)
