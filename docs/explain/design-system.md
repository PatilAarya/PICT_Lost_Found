# Design system (Member 1)

Files: `client/src/styles/tokens.css`, `client/src/styles/base.css`, everything in
`client/src/shared/ui/`, and the dev gallery in `client/src/modules/devui/` (open `/devui`
while running `npm run dev`).

## 1. How it works in 10 lines

1. `tokens.css` defines the 5 brand colours from DESIGN.md as CSS custom properties (`--paper`, `--ink`, `--frost`, `--steel`, `--berry`).
2. It also defines role variables (`--bg`, `--text`, `--line`, `--accent`) that say what each colour is for.
3. A `prefers-color-scheme: dark` media query swaps only the role variables, so every component switches to dark mode by itself.
4. Components never use hex codes; they use the variables. Changing one token restyles the whole app.
5. Each component in `shared/ui` is a small React function that takes the props fixed in docs/CONTRACT.md section G.
6. `index.js` is the single import point and loads the shared CSS files once.
7. `PropertyTag` draws an item as a claim ticket: hole, photo or pictogram, text, stamp, perforation and a stub with the serial number.
8. `Stamp` turns a status value into words and an ink colour (red = attention, steel = in progress, dark = finished).
9. `Pictogram` draws one of 10 hand-made SVGs. Colours come from CSS classes, so a parent can change the detail colour with one variable (`--pg-detail`).
10. Other modules (Lost, Found, Verify) only import from `shared/ui/index.js`, so the look stays the same everywhere.

## 2. The 6 most important functions

| Function                     | File                        | What it does                                                                                                                                                                                     |
| ---------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `PropertyTag`                | `shared/ui/PropertyTag.jsx` | Builds the ticket. Uses `<button>` when clickable and `<article>` otherwise, so the keyboard works. Says "Lost item" or "Found item" in hidden text, so the kind is not shown by colour alone.   |
| `splitSerial`                | `shared/ui/ticketParts.js`  | Splits `PICT-L-000045` into `PICT`, `L` and `000045` for the stub. Falls back to the item kind if the serial is missing.                                                                         |
| `barcodeBars`                | `shared/ui/ticketParts.js`  | Turns each digit into a bar 1, 2 or 3 units wide (`digit % 3 + 1`) with a gap after it, so every ticket gets its own decorative barcode.                                                         |
| `Stamp` / `inkFor`           | `shared/ui/Stamp.jsx`       | `inkFor` picks red, steel or dark ink from lists of statuses. `Stamp` remembers its first status in `useRef` and adds the drop-in class only when the status changes later.                      |
| `Pictogram`                  | `shared/ui/Pictogram.jsx`   | Looks up the shape function for a category in `PICTOGRAM_SHAPES` and draws it in a 48x48 SVG with an `aria-label`. Unknown categories become "other".                                            |
| `ChipSelect` (`toggleValue`) | `shared/ui/ChipSelect.jsx`  | `toggleValue` adds or removes a value from the array for multi-select, or replaces it for single select. Options with `category` become category tiles; options with `swatch` show a colour dot. |

## 3. Questions a teacher might ask

1. **Why CSS custom properties instead of hard-coded colours?** One place to change the palette, and dark mode only redefines variables inside a media query, with no JavaScript.
2. **How does dark mode work?** `@media (prefers-color-scheme: dark)` on `:root` changes `--bg`, `--text`, `--line` and similar. Components read those variables, so they update automatically.
3. **How are the notches on the ticket made?** A 16px circle in the page colour sits on the ticket edge and hides the border there. Only two of its four border sides are coloured, and `rotate(45deg)` turns them into the half-circle inside the ticket.
4. **Why is the stamp blended with `mix-blend-mode: multiply`?** Multiply darkens what is underneath, like real ink on paper. In dark mode it would make ink invisible, so the token `--stamp-blend` switches it to `normal`.
5. **How does the stamp animate only when the status changes?** `useRef` keeps the first status. If the current one is different, the class `stamp-drop` is added, and a new React `key` creates a fresh element so the CSS animation restarts.
6. **How do you respect reduced motion?** `base.css` has `@media (prefers-reduced-motion: reduce)`, which turns off all animations and transitions.
7. **Why are the pictograms not an icon library?** DESIGN.md asks for one custom style. They are plain SVG shapes on a 48x48 grid, and colours come from three CSS classes (`pg-line`, `pg-fill`, `pg-dot`).
8. **How is accessibility handled?** Labels are tied to inputs with `useId`, errors use a pin icon and text (not colour alone), focus has a 3px outline, touch targets are at least 44px, and SVGs have `role="img"` and `aria-label`.
9. **Why does red text use `--berry-ink`?** Plain red (#e63946) on honeydew is about 3.9:1, which fails WCAG for small text. The darker red is about 6:1.
10. **What does the barcode encode?** Only the serial's digits, as bar widths. It is decorative and not meant to be scanned.

## Update: the redesign

- Main buttons are navy (`--action`), not red. Red now only means lost, attention or danger,
  so it still stands out when it appears. **Why?** If every button is red, red means nothing.
- Pages are built from cards (`.card`) on a tinted background (`--page`), so a page is never a
  blank field. `StatCard` shows a number with one line saying what it means.
- `Stepper` is a segmented bar plus "Step 2 of 8, Photos, Next: Blur", so step names never get
  cut off on a phone.
- `Sheet` is a bottom sheet on phones and a centred window from 700px (one media query).
- `BrandMark` shows `/brand/pict-logo.png`; its `onError` handler switches to a drawn badge
  when the file is missing, so there is never a broken image.

## 4. Two-minute demo script

1. Run `npm run dev`, log in, and open `http://localhost:5173/devui`.
2. Point to the three tickets: red edge = lost, steel edge = found, a photo replacing the pictogram, and the stub with PICT, the letter and the serial. Hover a ticket to show the one allowed lift.
3. Scroll to the compact tickets: 72px tall, with the status as a small word.
4. Show the row of stamps for every status, then press "Change status" to show the 250ms drop-in.
5. Show the 10 pictograms and the 16 Phosphor thin icons.
6. Show a field with an error (pin icon and text), the category tiles and the colour chips with swatches.
7. Switch the operating system to dark mode: everything changes with no reload, because only the CSS variables change.
8. Show the timeline, the stepper, and the three empty states with their actions.
