# Lost module (Member 1)

Files: `server/src/modules/lost/` (routes, match engine, models, seed) and
`client/src/modules/lost/` (Lost page, report form, report page). Uses the shared
`LostReport` model in `server/src/shared/models/LostReport.js`.

## 1. How it works in 10 lines

1. A student taps **Report lost item** and fills five steps: category, details, where, when, review.
2. The client sends `POST /api/lost/reports`; zod checks the shape (the "to" time must be after "from").
3. The server saves the report with a serial like `PICT-L-000009`.
4. It runs `matchLostReport`: every found item still held is scored against the report.
5. `score()` adds five factors out of 100: category 40, place 15, colour 15, text 20, time 10.
6. Pairs with a different category, or found before the item was lost, are rejected; pairs scoring 45 or more are saved as `Match` documents.
7. A new match sets the report to "matched" and calls `services.notify` with `MATCH_FOUND` and the "why this match" sentence.
8. The other direction: when Found posts an item it calls `services.runMatching`, which the lost module registered in `init()`, so the new item is scored against every open report.
9. The report page (`GET /api/lost/reports/:id`) shows the matches best first, each with its sentence and a bar per factor, using only the found item's public (blurred) photo.
10. **This is mine** opens `/verify/claim/new?foundItemId=…&lostReportId=…`, and the Verify module takes over.

## 2. The 6 most important functions

| Function                          | File                              | What it does                                                                                                                       |
| --------------------------------- | --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `score(lost, found)`              | `services/matching.js`            | Runs the five factor functions, adds the points, and says whether any factor rejected the pair.                                    |
| `scoreTime(from, to, foundAt)`    | `services/matching.js`            | 10 points within 24 hours after the lost window, falling in a straight line to 0 at 72 hours; rejects items found before the loss. |
| `jaccard(a, b)`                   | `services/textSimilarity.js`      | Shared words divided by all words, after `tokenise()` lower-cases the text and drops filler words.                                 |
| `whyThisMatch(breakdown)`         | `services/explain.js`             | Joins the details of the factors that earned points, strongest first, into one sentence.                                           |
| `matchFoundItem({ foundItemId })` | `services/runMatching.js`         | The registered `runMatching` service: scores a new found item against open reports and saves the good pairs.                       |
| `reportFromSaved(saved)`          | `client/.../utils/reportSteps.js` | Fills the report form from a saved item, so a saved bottle is reported in one tap.                                                 |

## 3. Questions a teacher might ask

1. **Why weights 40/15/20/15/10?** Category is the strongest clue, so it carries the most; place and colour are reliable; text varies; time only rules items in or out.
2. **Why is a different category rejected instead of scored low?** A phone is never a wallet. Rejecting avoids silly matches that happen to share a place and time.
3. **What is Jaccard similarity?** The number of words both texts share divided by the number of different words in either. 1 is identical, 0 is nothing in common.
4. **Why remove filler words?** Words like "the", "with" or "lost" appear everywhere and would make unrelated items look similar.
5. **How does the time score fall from 10 to 0?** Between 24 and 72 hours, `points = 10 × (72 − hours) / 48`, a straight line.
6. **Where does the "why this match" sentence come from?** Only from the saved breakdown, so every word is backed by a real number. Nothing is invented.
7. **How do Lost and Found talk without importing each other?** Through the service registry: Lost registers `runMatching` in `init()`, Found calls `services.runMatching(...)`.
8. **Can someone see another student's report?** No. The report route checks that the logged-in user is the owner (or desk staff), otherwise it answers 403.
9. **Why doesn't the owner see the clear photo?** `publicFoundItem()` only copies `publicUrl`, the blurred copy. Private ids never leave the server.
10. **How does the same pair not get saved twice?** The `Match` model has a unique index on `lostReportId + foundItemId`, and `saveMatch` updates an existing pair instead of creating it again.

## 4. Two-minute demo script

1. Log in as **Sneha Patil** (student demo account) and open **Lost**: two reports, one with 3 matches.
2. Open "Green steel water bottle": the top match scores 90, with the reason "Same category, found in the same spot, same colour (green)…" and five bars.
3. Point out that photos are blurred copies and that **This is mine** leads to the owner check.
4. Go back and tap **Report lost item**. Tap the saved item "My earphones": the form fills itself.
5. Walk through Where and When, then **Report lost item**. The page opens with no matches yet.
6. Explain that when anyone posts matching earphones in Found, `runMatching` scores them against this report and Sneha gets an alert.
7. Show `services/matching.js`: five short functions, one per factor, then `score()` adds them up.
