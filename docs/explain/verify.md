# Verify and Handover (viva notes)

Owner: Member 2. Code: `server/src/modules/verify` and `client/src/modules/verify`.

## How it works in 10 lines

1. A student who thinks a found item is theirs opens `/verify/claim/new?foundItemId=...` and sees the blurred photo.
2. "Start owner check" creates a Claim; the server sends only the questions, never the answers.
3. The student answers one question at a time; the server scores each answer (exact = 1, close typo = similarity, else 0).
4. Pass (average 0.7+, no zero): the claim goes to the desk. Fail: one of 3 tries is used; the 3rd failure locks for 30 minutes, the next lockout for 24 hours.
5. The handler sees answers side by side with the finder's answers, plus clear photos through 10-minute signed links.
6. Approve makes a random 6-digit code; only its HMAC hash is stored, and the owner can view the code once.
7. At the desk, the handler types the code and ticks "college ID checked"; the server checks hash, expiry and single use, then releases.
8. Every step appends a custody entry whose hash includes the previous entry's hash, so the log is a chain.
9. The admin integrity check recomputes every hash; one edited entry breaks its chain and is shown in red.
10. An hourly cron job moves items to the admin office after 24 hours and donates them after 30 days; abuse rules raise flags for the admin.

## The 6 most important functions

| Function            | File                                  | What it does                                                                                          |
| ------------------- | ------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `appendEntry()`     | server/.../services/custodyChain.js   | Adds a custody entry with `hash = SHA-256(prevHash + canonical JSON)`, retrying if two writes collide |
| `checkChain()`      | server/.../services/custodyChain.js   | Recomputes each hash and link; marks the first bad entry and everything after it invalid              |
| `scoreAnswers()`    | server/.../services/scoring.js        | Normalises text, uses Levenshtein similarity, decides pass or fail                                    |
| `recordFailure()`   | server/.../services/lockout.js        | Counts a wrong try and starts a 30-minute or 24-hour lockout                                          |
| `releaseWithCode()` | server/.../services/releaseService.js | Checks the code (HMAC, expiry, single use) and releases claim, item and lost report                   |
| `linearScale()`     | client/.../charts/scale.js            | Turns a number into a pixel length for the hand-built SVG charts                                      |

## 10 questions a teacher might ask

1. **How is the log tamper-evident?** Each entry's hash includes the previous entry's hash. Changing one entry changes its hash, so the next entry's `prevHash` no longer matches, and the check fails from that entry onward.
2. **Why sort the keys before hashing?** JSON key order can change. Sorting gives the same text for the same data, so the same hash every time.
3. **What if two people update the same item at the same moment?** A unique index on `itemId + seq` lets only one write take a number; the other gets a duplicate-key error and retries with the next number.
4. **Why Levenshtein?** People make small typos ("debt" for "debit"). Similarity 0.8+ accepts them; anything less scores 0.
5. **Why never tell which answer was wrong?** Otherwise someone could guess one answer at a time.
6. **Why store a hash of the handover code, not the code?** A database leak would not reveal working codes. HMAC adds a secret key so the hash cannot be rebuilt from a list of all 6-digit codes.
7. **How is the code shown only once?** The plain code is kept hidden (`select: false`) until the owner opens it; then it is deleted and `handoverShownAt` is set. The button press (not page load) avoids wasting it.
8. **How do handlers see clear photos without making them public?** Originals are uploaded as Cloudinary "authenticated"; the server signs a download link that expires in 10 minutes.
9. **How does the lockout countdown work?** `useCountdown` runs `setInterval` every second, computes `lockedUntil - now`, and clears the interval on unmount.
10. **How are the charts drawn without a library?** `linearScale(max, pixels)` returns `value / max * pixels`; each bar is an SVG `rect` with that width (or height, starting at `chartHeight - h` because SVG's y axis points down).

## 2-minute demo script

Set-up: `npm run seed`, then `npm run dev`. Open http://localhost:5173 and use "Act as".

1. **Lockout (30 s).** As a student, open a found item's claim link (`/verify/claim/new?foundItemId=<id>`, an id from the desk Incoming tab or the database). Start the owner check, answer wrongly three times: the tries count down, then the lock icon and live countdown appear.
2. **Pass and decide (30 s).** As another student, answer correctly. Switch to Suresh Pawar (handler): Desk, Claims to decide, open the claim, show the answers side by side with scores, and Approve.
3. **Code release (30 s).** Switch back to the student: open the claim, press "Show my code", show the big digits. Reload: the code is gone ("already shown"). As the handler: Release with code, pick the claim, type the code, tick the ID box, Release. The stamp changes to Released.
4. **Tamper demo (30 s).** As Vikram Rao (admin): Integrity, Run check: all chains intact. In a terminal run `node server/scripts/demo-tamper.js`. Run the check again: one chain is red from the edited block onward. Undo with `node server/scripts/demo-tamper.js --restore`.
5. If time is left: Analytics (busiest building in red) and Flags (Suspend asks to confirm).
