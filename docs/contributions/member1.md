# Member 1 contributions

## Name
Vedant Pawar

## Owned paths
client+server modules/lost, modules/notifications; client shared/ui, shared/location-picker, styles, public/floorplans, public/icons; server shared/data/locations.json; shared/models/LostReport.js

## Features built
- Design system (Part A1 to A3): tokens for light and dark mode, the full claim ticket
  (PropertyTag with hole, perforation, notches, stub, serial and barcode), stamps for every
  status with the drop-in motion, 10 hand-drawn category pictograms, 3 empty-state
  illustrations, buttons, fields with errors, category tiles, colour picker with swatches,
  timeline, stepper, sheet and toast styles.
- Dev gallery at /devui (dev builds only) showing every component and stamp.

## Tests
- client/src/shared/ui/ui.test.jsx: serial and barcode helpers, stamp words and inks for
  every contract status, all pictograms, PropertyTag anatomy, EmptyState art.

## Demo notes
- See docs/explain/design-system.md for the 2-minute demo script.

## Keeper changes (acting keeper while Member 2 is away)
Branch keeper/env-and-email:
- server/src/shared/config/index.js: load the root .env by path (the server runs from
  server/, so it never found it); tests never load .env. Default domains ms.pict.edu, pict.edu.
- server/src/shared/utils/mailer.js: real SMTP sending (port 465 or 587), HTML emails,
  one start-up line saying which mode is on, never real email in tests.
- server/src/modules/auth/codeEmail.js (new) and routes.js: ticket-styled HTML code email;
  a failed send returns "We could not send the email. Try again in a minute."
- server/src/modules/auth/loginCodes.js: CODE_MINUTES exported for the email text.
- server/src/modules/auth/codeEmail.test.js (new): email content and domain rule.
- client/src/app/LoginPage.jsx: ms.pict.edu hint and a "check the spam folder" line.
- .env.example: free Brevo and Gmail SMTP instructions, ALLOWED_EMAIL_DOMAINS=ms.pict.edu,pict.edu.
- README.md, docs/explain/auth.md, docs/OWNERSHIP.md, docs/TEAM_PLAN.md updated to match.
- client/src/app/skeleton.test.jsx: the menu test checks the main items and their order
  instead of an exact list, so a module adding a menu item (Found's "Post found item")
  no longer breaks it.

## Found module fixes (acting for Member 3 while she is away)
- routes.js: posting now writes POSTED and DROPPED_AT_DESK to the custody log, sets
  expiresAt for desk items (HOLD_HOURS_DESK) and saves aiSuggestion. Request rules moved to
  itemSchema.js; at least two secret answers are required.
- imageRoutes.js (new): private originals upload to Cloudinary as type "authenticated";
  without Cloudinary keys, photos are saved in server/uploads and only blurred copies are
  served (GET /api/found/files/<name>). server/uploads/ is in .gitignore.
- desk-suggestion.js: ranks every desk and the route returns up to 3.
- Client: toast() fix, secret questions shown as labelled fields, category tiles with
  pictograms, readable place and date labels (utils/format.js), no buttons inside links,
  "ghost" button variant replaced with "quiet", local upload support in uploadImage.js.
- tests/found.test.js (new): desk ranking, prompts, custody log, deadline, two answers,
  and that answers and private ids never leave the server.
- Formatting only (npm run format) on the other found files.

## UI redesign (29 Oct 2026, from the team's screenshot review)
- New look: navy main buttons (red kept for lost, attention and danger), a frost-tinted page
  with white cards, real gaps between buttons, grey disabled buttons, centred dialogs,
  a segmented Stepper that never cuts off step names, light-weight icons.
- App shell (keeper): logo spot (BrandMark), alerts bell, avatar menu (UserMenu) instead of
  the "Act as" dropdown, menu icons, "Desk tools" group. DevUserSwitcher.jsx replaced by
  shared/auth/useDemoAccounts.js and DemoAccounts.jsx.
- Login (keeper): split screen with the college logo, a sample ticket and how it works;
  demo account cards in development.
- Home: action cards and "how it works".
- Found (acting for Member 3): one Found page with numbers, your items and a guide; one
  "Post found item" button; the post flow in step cards with a live ticket preview; photo
  step with choice tiles and labelled photo slots. /found/mine now redirects to /found.
- Verify screens (with the team's agreement, client only): desk tabs, claim rows with a
  score meter, centred claim review with answers side by side; analytics with explained
  number cards, a busiest-hour sentence and readable charts; "History check" page with a
  plain verdict, a how-it-works card, search, and readable timelines (hashes behind a toggle).
- Data: "(placeholder)" removed from building and desk names.

## Lost module (Part C)
- Server: match engine (services/matching.js, textSimilarity.js), "why this match" sentence
  (explain.js), runMatching in both directions (runMatching.js, registered as the
  runMatching service), Match and SavedItem models, routes for reports, matches and saved
  items, zod schemas, and seed data (8 reports, 4 saved items) that produces real matches.
- Rules: different category or found-before-lost rejects a pair; 45 out of 100 to keep it.
- Client: Lost page (numbers, reports with match badges, saved items), 5-step report form
  with saved-item shortcuts and a live ticket preview, report page with timeline, ranked
  matches, factor bars and "This is mine" (to /verify/claim/new).
- StepCard moved from the found module to shared/ui so Lost and Found share it; the form
  page layout (post-layout, review rows) moved to shared/ui/layout.css.
- Tests: tests/matching.test.js (factors, threshold, sentence) and tests/routes.test.js
  (report matching, later found items, owner-only access, private saved items).
- Docs: docs/explain/lost.md.

## Notifications (Part B) and floor-plan picker (Part A5)
- Server: Notification model, the real services.notify (save, Socket.IO emit to
  user:<id>, email for HANDOVER_READY and ITEM_EXPIRING), routes for list, unread count,
  mark read and mark all read, and a seed that adds alerts for matched demo reports.
- Client: real useNotifications (live socket updates, toast in the app shell, bell count,
  copies kept in sync with a browser event), Alerts page with New and Earlier groups.
- LocationPicker: building and floor buttons, tap-to-pin floor plan (pinMaths.js,
  FloorPlan.jsx) and room buttons as a keyboard-friendly fallback. Six placeholder floor
  plans in client/public/floorplans (ids match locations.json; drop in real plans later).
- Match engine: items found inside the lost window now say "found while you were missing
  it"; items found under an hour after the window say "found within an hour of losing it".
- Tests: notifications.test.js (notify and routes), pinMaths.test.js.
- Docs: docs/explain/notifications.md.
