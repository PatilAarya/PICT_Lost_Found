# Prompt 1: Member 1 (Claude Code): design system, Lost, Notifications

Branch feat/lost. Start after Phase 0 is merged to main.

```text
Read CLAUDE.md, DESIGN.md, docs/PROJECT_BRIEF.md, docs/CONTRACT.md and docs/OWNERSHIP.md first. You are Member 1. Edit ONLY the paths owned by Member 1. If you need a change outside your paths, stop and tell me to raise a GitHub Issue; do not edit it yourself. Run npm run format, npm run lint and npm test before saying a task is finished. Do not run git commands (see CLAUDE.md).

PART A - Design system (finish this first so teammates get real styling)
1. Use the identity in DESIGN.md exactly (colours, fonts, ticket anatomy, stamps, pictograms). Do not invent a new palette. Put the tokens in client/src/styles/tokens.css, with a dark theme through prefers-color-scheme.
2. Replace every stub in client/src/shared/ui with the real implementation, KEEPING THE PROPS IN THE CONTRACT. PropertyTag is the hero component: punched hole, perforated edge, serial number on a stub, item pictogram or photo, rubber-stamp status. Stamp has distinct looks for every status value in constants.
3. Pictogram: hand-draw 10 category pictograms as inline SVG (id_card, phone, laptop, wallet, keys, bottle, bag, earbuds, books, other) in one consistent style (same grid, stroke and one accent shape). Also 3 empty-state illustrations (no reports, no matches, no notifications). Do not use any icon library for these. Icon uses Phosphor thin only for the listed control names.
4. App shell: header with the notification bell (from useNotifications) and a mobile bottom navigation built from modules/*/nav.js. Add a dev-only page modules/devui/routes.jsx that shows every component and all stamps.
5. LocationPicker (client/src/shared/location-picker): final version. mode "pin": choose building, then floor, then tap the floor plan image to drop a pin; value is a full Location including x,y. mode "area": tap an area on the plan. Floor plans are SVGs in client/public/floorplans/<buildingId>-<floorId>.svg with each area as an element whose id matches the area id. Until real plans arrive, draw simple placeholder plans; keep the file naming so real ones drop in. Provide a fallback list when there is no plan.

PART B - Notifications module (server/src/modules/notifications, client modules/notifications)
- Notification model (userId, type, title, body, link, data, readAt, createdAt). Register services.notify: save, emit "notification" to room user:<userId> over Socket.IO (authenticate the socket with the JWT cookie), and send an email for HANDOVER_READY and ITEM_EXPIRING only.
- Routes: GET /api/notifications, GET /api/notifications/unread-count, PATCH /api/notifications/:id/read, PATCH /api/notifications/read-all.
- Client: real useNotifications() with the same return shape, a notification list page /notifications, and a toast when one arrives live.

PART C - Lost module
Server (server/src/modules/lost) and client (client/src/modules/lost):
1. Report a lost item: category (pictogram tiles), title, description, colours, brand, optional photo (Cloudinary signed upload via an endpoint you add inside your module), last-seen place using LocationPicker mode "pin", lost time window (from, to). Saved to the shared LostReport model.
2. Saved items: model SavedItem (userId, label, category, colors, brand, description, stickers). CRUD routes. In the report form, a row of saved items; tapping one pre-fills the form.
3. Match engine (server/src/modules/lost/services/matching.js). Pure, unit-tested functions. score(lostReport, foundItem) returns { total, breakdown: [{ key, points, max, detail }] }. Weights out of 100: category 40 (a mismatch rejects the pair unless one side is "other"), colour overlap 15, text similarity 20 (tokenise title, description and brand; use cosine over TF-IDF or token Jaccard), place 15 (same area 15, same floor 10, same building 6, else 0), time 10 (found after the lost window start; full points within 24 hours of the window, decaying to 0 at 72 hours). Keep pairs with total at or above 45. Save the Match model: lostReportId, foundItemId, total, breakdown, createdAt, seen flag. Never invent: every number comes from real data.
4. Register services.runMatching: called by Found after posting, runs the item against all open LostReports, saves matches, sets LostReport.status to matched, and calls services.notify with MATCH_FOUND. Also run matching for a new LostReport against existing found items in status posted, in_custody.
5. "Why this match": a function that builds a plain-language sentence from the breakdown, for example "Same category, same building, found 2 hours after you lost it." Show it on the match card together with a small bar per factor.
6. Screens: lost home with my reports as PropertyTags, report flow (Stepper), match results page (ranked matches, found-item photo shown as the BLURRED public copy only, never the private original), report detail with Timeline of status, and a "This is mine" button that goes to /verify/claim/new?foundItemId=...&lostReportId=... (built by Member 2).
7. Seed (modules/lost/seed.js): 8 realistic lost reports and 4 saved items for the seeded students.
8. Tests for matching, explanation and routes. Add docs/contributions/member1.md entries as you go.

Order of work: A1 to A4, then B, then A5, then C.

Write docs/explain/lost.md and docs/explain/design-system.md as specified in CLAUDE.md. Hand-write the pin placement on the floor plan with pointer events and SVG coordinates, and the match explanation builder, so they can be explained line by line.
```
