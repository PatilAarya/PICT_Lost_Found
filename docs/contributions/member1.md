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
