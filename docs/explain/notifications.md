# Notifications and the floor-plan picker (Member 1)

Files: `server/src/modules/notifications/`, `client/src/shared/realtime/useNotifications.js`,
`client/src/modules/notifications/`, `client/src/shared/location-picker/`,
`client/public/floorplans/`.

## 1. How it works in 10 lines

1. Any module calls `services.notify({ userId, type, title, body, link })` (Lost for matches, Verify for claims and handover codes).
2. The notifications module registered the real `notify` in `init()`, replacing the logging stub.
3. `notify` saves a `Notification` document, so it shows in the Alerts list later.
4. It emits `"notification"` over Socket.IO to the room `user:<id>`; only that person's open tabs receive it.
5. For `HANDOVER_READY` and `ITEM_EXPIRING` it also sends an email, because those need action.
6. In the browser, `useNotifications()` loads the newest alerts and the unread count from `GET /api/notifications`.
7. It listens to the socket's `"notification"` event and adds a new alert to the top at once, with no refresh.
8. The app shell's copy shows a toast and the bell count; marking alerts read fires a browser event so every copy reloads.
9. For places, `LocationPicker` lets you pick a building and floor, then downloads that floor's SVG plan.
10. Tapping the plan turns the tap into x/y fractions with `getBoundingClientRect`, finds the room with `closest('.area')`, and draws a pin.

## 2. The 6 most important functions

| Function                         | File                                             | What it does                                                                                                       |
| -------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| `createNotify(io)`               | `server/.../notifications/notify.js`             | Builds `notify`: save, emit to the user's room, email for two types.                                               |
| `useNotifications({ announce })` | `client/src/shared/realtime/useNotifications.js` | Loads alerts, listens for live ones, and returns `{ items, unread, markRead, markAllRead }`.                       |
| `markRead(id)`                   | same file                                        | `PATCH /:id/read`, then `window.dispatchEvent(new Event('notifications-changed'))` so the bell and the page agree. |
| `timeAgo(value)`                 | `client/.../notifications/timeAgo.js`            | "Just now", "5 min ago", "Yesterday" from plain millisecond maths.                                                 |
| `pointToFraction(x, y, box)`     | `client/src/shared/location-picker/pinMaths.js`  | (tap − box corner) ÷ box size = a 0..1 position that works at any screen size.                                     |
| `areaFromTarget(target, areas)`  | same file                                        | Walks up from the tapped element to the nearest `.area` and checks its id belongs to this floor.                   |

## 3. Questions a teacher might ask

1. **How does the server send to one person only?** Every socket joins the room `user:<id>` when it connects; `io.to(room).emit(...)` reaches only sockets in that room.
2. **How does the socket know who I am?** The same check as the API: the httpOnly login cookie (or the dev demo account), done once in `io.use(...)`.
3. **Why save the alert and also emit it?** The emit is for people looking right now; the saved copy is for everyone else, and for the unread count.
4. **Why email only two types?** Handover codes and expiring items need action even when the app is closed; the rest would be spam.
5. **How do the bell and the Alerts page stay in sync?** After marking read, the hook dispatches a `notifications-changed` browser event; every copy of the hook listens and reloads.
6. **Why does only one place show toasts?** Both the shell and the page use the hook. `{ announce: true }` is passed only in the shell, so each alert shows one toast.
7. **Why store the pin as 0 to 1 instead of pixels?** Pixels depend on the screen. A fraction of the plan means the same spot on a phone and a laptop.
8. **Why is it safe to insert the SVG into the page?** The plans are our own static files in `client/public/floorplans`, never user input.
9. **What if a floor has no plan?** The picker checks the download really is an SVG; if not, it hides the plan and the room buttons still work.
10. **Can I use the picker without a mouse?** Yes. Buildings, floors and rooms are also buttons, so the keyboard and screen readers work.

## 4. Two-minute demo script

1. Log in as **Sneha Patil** and open **Alerts**: two "Possible match" alerts, and the bell shows 2.
2. In a second window, log in as **Aarav Sharma** and post a found item: black JBL earbuds in the Lab building canteen.
3. Back in Sneha's window, without refreshing: a toast appears, the bell goes up, and the new alert with its reason is on top.
4. Press **Open**: it marks the alert read and opens the report with the match.
5. Start **Report lost item**, go to Where, choose Lab building and Ground floor, and tap the canteen: it turns red and a pin appears.
6. Show `pinMaths.js`: two small functions, one subtraction and one division each.
