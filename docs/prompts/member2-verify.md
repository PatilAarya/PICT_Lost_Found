# Prompt 2: Member 2 (Claude Code): Verify and Handover

Member 2 starts this after Phase 0 is merged to main. Create the branch with `git checkout -b feat/verify`.

```text
Read CLAUDE.md, DESIGN.md, docs/PROJECT_BRIEF.md, docs/CONTRACT.md and docs/OWNERSHIP.md first. You are Member 2. Edit ONLY paths owned by Member 2: client/src/modules/verify, server/src/modules/verify, server/src/shared/models/Claim.js. Everything else is read-only for you. If you need a change elsewhere, stop and tell me to raise a GitHub Issue. Do not run git commands (see CLAUDE.md). Run npm run format, npm run lint and npm test before saying a task is finished. Keep every file small and easy to explain.

Build the Verify and Handover module, in this order. Finish and test each part before the next.

PART 1 - Custody log (server)
- Model CustodyEntry { itemId, seq, action, actorId, actorRole, note, meta, ts, prevHash, hash }. hash = SHA-256 of prevHash plus the canonical JSON of the entry fields (keys sorted). The first entry of an item uses prevHash "GENESIS".
- Register services.appendCustody in init(). It must be safe when two writes happen at once: use a unique index on itemId+seq and retry on a duplicate key error.
- Routes: GET /api/verify/custody/:itemId (handler, admin, or the item's finder) and GET /api/verify/custody/verify (admin: recompute every chain and return { ok, brokenItems: [{ itemId, seq }] }).
- Script server/scripts/demo-tamper.js that edits one entry directly in the database so we can demo detection.
- Tests: chaining, and tamper detection.

PART 2 - Owner check (server)
- Claim model per the contract. Create a claim: POST /api/verify/claims { foundItemId, lostReportId? } returns the prompts (promptKey and promptText ONLY, never answers or private image ids).
- Answer: POST /api/verify/claims/:id/answer { answers: [{ promptKey, text }] }.
- To read the stored answers you must use .select('+hiddenDetails.answer') on FoundItem. Never return them to claimants.
- Scoring in services/scoring.js (pure functions): normalise the text (lowercase, trim, remove punctuation, collapse spaces). Exact match scores 1. Otherwise use Levenshtein similarity (fastest-levenshtein): at or above 0.8 scores that ratio, below scores 0. The claim passes when the average is at or above 0.7 and no answer scored 0.
- Attempts: MAX_CLAIM_ATTEMPTS (3) per claimant per item. The 3rd failure locks the claimant out of that item for LOCKOUT_MINUTES (30). A second lockout on the same item locks for 24 hours. Record every attempt in a ClaimAttempt model.
- A failed answer returns only { passed: false, attemptsLeft, lockedUntil }. Never say which answer was wrong.
- On pass: status awaiting_handler, services.notify every handler, appendCustody CLAIM_SUBMITTED and VERIFICATION_PASSED. On failure: appendCustody VERIFICATION_FAILED, plus LOCKED_OUT when a lockout starts.
- Tests: scoring, attempts, both lockout durations.

PART 3 - Decision and handover (server)
- Handler routes: GET /api/verify/desk/queue (claims awaiting_handler, with the claimant, the score per prompt, the claimant's answers beside the stored answers, and the private original photos, handler and admin only).
- Private photos: for each image, build a short-lived signed URL with the Cloudinary SDK using the stored privateId (type "authenticated", sign_url true, expires_at about 10 minutes). Never store or return an unsigned private URL.
- PATCH /api/verify/claims/:id/decision { decision: "approve" | "reject", note }.
- On approve: generate a 6-digit code with crypto.randomInt, store only an HMAC-SHA256 hash (key JWT_SECRET) with handoverExpiresAt = now + HANDOVER_CODE_HOURS. Send HANDOVER_READY to the claimant. The plain code can be read once through GET /api/verify/claims/:id/code (claimant only); after it is shown, mark it shown. appendCustody APPROVED. On reject: appendCustody REJECTED and notify the claimant.
- POST /api/verify/handover { claimId, code, idChecked: true } by a handler: compare hashes, check expiry and single use. Set Claim to released, FoundItem to released, LostReport to recovered. appendCustody RELEASED. Notify the finder with thanks.
- If the item's custody.type is "finder": both parties confirm in the app (POST /api/verify/handover/confirm). The item is released once both have confirmed.
- Incoming items: GET /api/verify/incoming (items a finder said were dropped at a desk) and PATCH /api/verify/incoming/:itemId/receive, which records RECEIVED_BY_HANDLER and STORED and sets status in_custody.
- Tests for the whole code lifecycle: wrong code, expired code, reused code.

PART 4 - Lifecycle, flags, analytics (server)
- node-cron job, every hour: desk items in custody longer than HOLD_HOURS_DESK (24) become transferred_admin (appendCustody TRANSFERRED_TO_ADMIN, notify the finder). Items older than DONATE_AFTER_DAYS become donated (DONATED). Send ITEM_EXPIRING to owners with a match 6 hours before the transfer. Keep each rule in its own small function so it can be tested.
- Flag model { userId, reason, details, status: open | dismissed | warned | suspended, createdAt, reviewedBy }. Rules, checked after each claim event: more than 5 claims in 24 hours; 3 or more failed verifications in 7 days; 2 or more lockouts in 7 days. Notify the user with ACCOUNT_FLAGGED only on warn.
- Routes: GET /api/verify/flags (admin), PATCH /api/verify/flags/:id { action } (admin; suspend sets User.status to suspended).
- AuditLog model, written for every handler and admin action.
- Analytics routes (handler and admin, optional ?from&to): by building, by floor, by hour of day, by category, average return time in hours, claims waiting, items released this week. Use simple Mongo aggregations that can be explained.
- seed.js: 40 historic found items with custody entries and 10 claims across the last 30 days, so the dashboard has realistic data. Make it idempotent.

PART 5 - Client, claimant side (client/src/modules/verify)
- routes.jsx and nav.js per the contract. Screens: /verify/claim/new (reads foundItemId and lostReportId from the query string, shows the BLURRED public photo, asks the prompts one at a time with Stepper, shows attempts left and a live lockout countdown with setInterval), and /verify/claim/:id (status Timeline; when approved, the handover code shown once as large digits on a ticket stub, with the instruction to show it and the college ID at the desk).
- Use the shared UI components and DESIGN.md. More visual, less text.

PART 6 - Client, handler and admin side
- /verify/desk: queue of claims; claim detail with answers side by side and a score per prompt, private photos, Approve and Reject with a note; a code entry screen to release an item; the list of incoming items to receive.
- /verify/analytics: hand-built SVG charts using plain maths (functions that scale a value to a pixel position; d3-scale is allowed but explain it): a bar chart for building and category, a histogram for hour of day, large numbers for average return time and claims waiting. Styled with DESIGN.md chart rules.
- /verify/integrity (admin): run the chain check and show each item's chain as linked blocks; highlight a broken block in --berry.
- /verify/flags (admin): list with Dismiss, Warn, Suspend and a confirm step for Suspend.

PART 7 - Docs
- docs/explain/verify.md as described in CLAUDE.md, with a 2-minute demo script that includes the lockout, the code release, and the tamper demo.
- Fill docs/contributions/member2.md.
```
