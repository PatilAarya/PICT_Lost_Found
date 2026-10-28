# Demo guide

How to show PICT Lost and Found to the teachers in about 10 minutes, and what to check
the day before. The same story is tested automatically in `server/src/story.test.js`.

## The day before

1. `git pull origin main`, then `npm install`, `npm run seed`, `npm test`. All tests must pass.
2. In `.env`: fill the free SMTP settings (see `.env.example`) and send yourself one login code.
   Check it arrives and is not in spam.
3. Optional: put the official logo at `client/public/brand/pict-logo.png`.
4. Open the app on a phone on the same Wi-Fi (`npm run dev -w client -- --host`, then the
   "Network" address). The live camera needs https; the "Upload photos" tile works anyway.
5. Decide: demo accounts on (`DEV_AUTH=true`, fast switching) or a real-looking login
   (`DEV_AUTH=false`, `ALLOW_ANY_EMAIL=false`, real `@ms.pict.edu` emails).

## Two browser windows

Use one normal window and one private window, so two people are logged in at once.

- Window A: **Sneha Patil** (student, the owner).
- Window B: **Aarav Sharma** (student, the finder), later **Suresh Pawar** (security desk) and
  **Vikram Rao** (admin).

## The story (about 10 minutes)

1. **Login** (A). Show the split-screen login. Log in with an email code, or the Student card.
2. **Report lost** (A). Lost, then Report lost item. Category Bottle, "Blue steel bottle",
   colour blue, tap A1 building on the campus map, Ground floor, tap the Central Library on the plan (the pin drops),
   time window "the last two hours". Report it: "No matches yet".
3. **Post found** (B, Aarav). Found, then Post found item. Bottle, upload a photo, drag over
   any sticker to blur it, title "Steel bottle", colour blue, two secret answers
   (for example "dent near the cap" and "NASA sticker"), Library, the suggested desk. Post.
4. **Live match** (A). Without refreshing, a toast and the bell: "Possible match". Open it:
   the score out of 100, "Why this match", and a bar per factor.
5. **Desk receives** (B as Suresh). Desk, Incoming items, Received.
6. **Owner check** (A). This is mine. Answer wrongly once ("attempts left: 2"), then right.
   Mention: 3 wrong answers lock the claim for 30 minutes.
7. **Decision** (B as Suresh). Desk, Claims to decide, Review: the answers side by side.
   Approve and send code.
8. **Handover** (A). My claims: the 6-digit code on a ticket stub, shown once.
   (B as Suresh) Release with code: type it, tick "college ID checked". Released.
9. **Happy ending** (A). Lost: the bottle moved to "Back with you". Aarav's Found page shows
   "Returned to owner".
10. **Trust** (B as Vikram). History check: "All item histories are untouched". Run
    `node server/scripts/demo-tamper.js`, press Check again: the edited item shows "Changed".
    Then Analytics: the numbers and charts, each with one line saying what it means.
    Afterwards run `node server/scripts/demo-tamper.js --restore` to undo the edit.

## If something goes wrong

- **EADDRINUSE on port 4000:** an old server is still running. Close it (Ctrl+C) and retry.
- **No live alert:** check the server terminal says "listening"; the browser reconnects alone.
- **No match:** check the times (found after lost) and that both chose the same category.
- **Photo upload fails:** without Cloudinary keys, photos are stored on this laptop; that is
  expected and fine for the demo.
