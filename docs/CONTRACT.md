# Contract

The contract names modules, not people, so it does not change when ownership changes.
See docs/OWNERSHIP.md for who owns each module.

## A. Constants (identical on server and client)
- ROLES: student, staff, handler, admin.
- CATEGORIES: id_card, phone, laptop, wallet, keys, bottle, bag, earbuds, books, other.
- COLORS: black white grey silver red maroon orange yellow green teal blue navy purple pink brown beige gold multicolor.
- FOUND_STATUS: posted, in_custody, claim_pending, verified, released, transferred_admin, expired, donated.
- LOST_STATUS: open, matched, claim_in_progress, recovered, closed.
- CLAIM_STATUS: answering, locked, awaiting_handler, approved, rejected, released, cancelled.
- CUSTODY_ACTIONS: POSTED, DROPPED_AT_DESK, RECEIVED_BY_HANDLER, STORED, CLAIM_SUBMITTED, VERIFICATION_PASSED, VERIFICATION_FAILED, LOCKED_OUT, APPROVED, REJECTED, RELEASED, TRANSFERRED_TO_ADMIN, EXPIRED, DONATED.
- NOTIFICATION_TYPES: MATCH_FOUND, ITEM_STATUS, CLAIM_UPDATE, HANDOVER_READY, ITEM_EXPIRING, ACCOUNT_FLAGGED.

## B. Location object
Used everywhere: `{ buildingId, floorId, areaId, x, y }` where x,y are 0..1 positions on the floor plan, optional.

locations.json:
```
{ buildings: [{ id, name, floors: [{ id, label, plan: "/floorplans/<buildingId>-<floorId>.svg", areas: [{ id, name }] }] }] }
```

desks.json:
```
{ desks: [{ id, name, type: "security_desk" | "department_office" | "admin_office", buildingId, floorId, hours, nearBuildingIds: [] }] }
```

## C. Core models (shared/models)
Owners add fields to their own file only and announce them in the group chat.
- User: name, email (unique), role, department, year, status (active|suspended), flagged (bool), createdAt.
- LostReport: serial, ownerId, category, title, description, colors[], brand, imageUrl, lastSeen (Location), lostFrom, lostTo, status, savedItemId, createdAt.
- FoundItem: serial, finderId, category, title, description, colors[], brand, images[{ publicUrl, privateId, order }], location (Location), foundAt, custody { type: "desk"|"finder", deskId }, hiddenDetails[{ promptKey, promptText, answer }] (answer has select:false and is NEVER returned by any API except to handlers), aiSuggestion { category, colors[], confidence }, status, expiresAt, createdAt.
- Claim: serial, foundItemId, claimantId, lostReportId, status, score, answers[{ promptKey, text }], attemptsUsed, lockedUntil, handoverCodeHash, handoverExpiresAt, decidedBy, decisionNote, createdAt.

## D. Service registry
File: server/src/shared/services/registry.js. Usage: `services.notify(...)`. A module registers its implementations in its init(). Until registered, a logging stub runs.
- `notify({ userId, type, title, body, link, data }) -> Promise<void>`. Implemented by notifications.
- `runMatching({ foundItemId }) -> Promise<Match[]>`. Implemented by lost. Call after a found item is saved.
- `appendCustody({ itemId, action, actorId, note, meta }) -> Promise<entry>`. Implemented by verify. Call on every status change of a FoundItem.
- `getHiddenDetailPrompts(category) -> [{ promptKey, promptText }]`. Implemented by found.

## E. HTTP surface (all under /api)
auth/* and meta/* (Phase 0). lost/* (reports, matches, saved-items). notifications/* (list, mark read, unread count). found/* (items, images, desks/suggest). verify/* (claims, answer, decision, handover, custody, analytics, flags, desk, incoming). Items created by one module and shown by another are read through shared models.

## F. Realtime
Server emits "notification" to room `user:<userId>` with the Notification document. Client hook `useNotifications()` returns `{ items, unread, markRead, markAllRead }`.

## G. Client shared API (shared/ui)
Keep these props stable; internals may change.
- Button { variant: primary|secondary|quiet|danger, size: md|lg, icon, loading }
- Field { label, hint, error } with TextInput, TextArea, SelectInput, ChipSelect { options, value, onChange, multi }, ColorPicker { value, onChange, multi }
- PropertyTag { item: { kind: lost|found, serial, category, title, status, locationLabel, timeLabel, imageUrl }, onClick, compact }
- Stamp { status }, Pictogram { category, size }, Icon { name, size } (names: arrow-right arrow-left close camera search bell check lock clock pin upload trash plus filter user shield)
  Added later (props of existing components unchanged): Icon names home package ticket inbox chart flag shield-check sign-out caret-down info warning refresh check-circle; StatCard { value, unit, label, hint, icon, tone }; BrandMark { size, light }.
- Sheet { open, onClose, title }, useToast(), EmptyState { title, action, illustration }, Timeline { steps: [{ label, done, at }] }, PageHeader { title, subtitle, actions }, Spinner, Stepper { steps, current }
- shared/location-picker: LocationPicker { value: Location, onChange, mode: "pin" | "area" }
- Hooks: useAuth() -> { user, role, loading, requestCode, verifyCode, logout }

## H. Client module shape
modules/<name>/routes.jsx default-exports `[{ path, element, roles? }]`; modules/<name>/nav.js default-exports `[{ label, path, roles, order }]`. Path prefixes: /lost, /found, /verify (verify also owns /verify/desk, /verify/analytics, /verify/flags).
