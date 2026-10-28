# Auth: email one-time-code login (viva notes)

## How it works in 10 lines

1. The user types their college email on the login page.
2. The client sends `POST /api/auth/request-code { email }`.
3. The server checks the domain (ms.pict.edu or pict.edu) and that fewer than 5 codes were sent this hour.
4. It makes a random 6-digit code, saves only its SHA-256 hash with a 10-minute expiry, and emails the code
   through a free SMTP account (Brevo or Gmail) as a ticket-styled HTML email (`codeEmail.js`).
5. The user types the code; the client sends `POST /api/auth/verify-code { email, code }`.
6. The server hashes the typed code and compares; 5 wrong tries kill the code.
7. On success it creates the user on first login (role student).
8. It signs a JWT with the user id and puts it in an httpOnly cookie for 7 days.
9. Every later request sends the cookie; `requireAuth` reads it and sets `req.user`.
10. In development, the `x-dev-user` header (from the DevUserSwitcher) can act as any seeded user.

## The 6 most important functions

| Function                      | File                                    | What it does                                            |
| ----------------------------- | --------------------------------------- | ------------------------------------------------------- |
| `createLoginCode(email)`      | server/modules/auth/loginCodes.js       | Rate-limits, makes a code, saves its hash, returns it   |
| `checkLoginCode(email, code)` | server/modules/auth/loginCodes.js       | Finds the latest live code, compares hashes, marks used |
| `setLoginCookie(res, userId)` | server/modules/auth/routes.js           | Signs the JWT and sets the httpOnly cookie              |
| `requireAuth(req, res, next)` | server/shared/middleware/requireAuth.js | Turns the cookie (or dev header) into `req.user`        |
| `buildCodeEmail(code, mins)`  | server/modules/auth/codeEmail.js        | Makes the subject, plain text and HTML of the email     |
| `AuthProvider` / `useAuth()`  | client/shared/auth/                     | Keeps the user in React state for every page            |

## 10 questions a teacher might ask

1. **Why no passwords?** Students forget them and they get reused. A code to the college inbox
   also proves the person is from PICT.
2. **Why store a hash of the code?** If the database leaks, the codes are still unknown.
3. **Why an httpOnly cookie instead of localStorage?** JavaScript on the page cannot read an
   httpOnly cookie, so a script injection cannot steal the login.
4. **What stops someone guessing codes?** 1 in a million per guess, only 5 wrong tries per code,
   10-minute expiry, and an IP rate limit on the route.
5. **What stops email spam?** Max 5 codes per email per hour, plus the IP rate limit.
   **How is the email really sent for free?** nodemailer talks SMTP to a free account (Brevo or
   Gmail). The login details live only in `.env`; if they are missing, the code is printed in
   the server console instead, and tests never send email.
6. **What is in the JWT?** Only the user id, signed with JWT_SECRET so it cannot be edited.
7. **How does the client know who is logged in after a refresh?** AuthProvider calls
   `GET /api/auth/me` on load; the cookie is sent automatically.
8. **Is the dev switcher a security hole?** It only works when NODE_ENV is development and
   DEV_AUTH is true, and the client hides it in production builds.
9. **How are roles enforced?** `requireRole('handler')` on the server; `RequireRole` on the
   client only hides pages.
10. **What happens to a suspended user?** requireAuth and verify-code both refuse with 403.

## 2-minute demo script

1. Run `npm run dev`. Open http://localhost:5173.
2. Type your own `@ms.pict.edu` address, press Send code. Open your inbox on the phone and show
   the ticket-styled email with the code (check spam the first time).
3. Type the code, press Log in. The menu shows Lost, Found, My claims and Alerts.
4. Open DevTools > Application > Cookies: show the `token` cookie is HttpOnly.
5. Use the "Act as" dropdown to become Suresh Pawar (handler): the Desk item appears.
6. Become Vikram Rao (admin): Analytics and Flags appear.
7. As a student, type /verify/analytics in the address bar: "No access" page.
