# PICT Lost and Found: Design Guide

Single source of truth for look and feel. Every screen follows this file.

## 1. Concept: the claim ticket
The app looks like a real lost-property claim ticket: a paper tag with a punched
hole, a perforated edge, a serial number on a tear-off stub, and a rubber stamp
showing the item's status. Every item, in every module, is shown as this ticket.
Use the ticket only for items. Screens and forms stay plain and quiet so the
ticket is the one memorable thing.

## 2. Colour palette (the only five brand colours)
| Token | Name | Hex | Role |
|---|---|---|---|
| --paper | Honeydew | #f1faee | Page background, ticket paper, text on dark |
| --ink | Deep Space Blue | #1d3557 | All body text, ticket outlines, header, dark-mode background |
| --frost | Frosted Blue | #a8dadc | Secondary surfaces, perforation and dividers, selected states, chart fill |
| --steel | Steel Blue | #457b9d | Found items, links, secondary buttons, focus ring |
| --berry | Strawberry Red | #e63946 | Lost items, rubber stamps, primary action, urgent or destructive |

Derived values (allowed, nothing else):
- --berry-ink: #b02a37 for small red text on light backgrounds (plain red fails contrast).
- --paper-deep: color-mix(in srgb, var(--paper) 92%, var(--ink)) for raised surfaces.
- --ink-soft: color-mix(in srgb, var(--ink) 65%, var(--paper)) for secondary text and disabled states.
- Tints of --frost and --steel for hover and pressed states.

Usage ratio on a typical screen: Honeydew and frost-tinted surfaces 65%, Deep Space 20% (text, top bar, main buttons), Frosted 8%,
Steel 7%, Strawberry 3%. Red stays rare so it keeps its meaning.

Meaning of colour (never break it):
- Red means lost or needs attention. Steel blue means found.
- Deep Space filled means finished (released). Frosted means in progress.
- Never use colour alone: a status always has a stamp word or a pictogram too.

Contrast (approximate, verify with a script before merging):
- ink on paper about 11.5:1 (text). ink on frost about 8:1 (text).
- white on steel about 4.6:1 (ok). steel on paper about 4.3:1 (large text and graphics only).
- paper on berry about 4:1 (large or bold 18px+ only). berry on paper about 3.9:1 (graphics and stamps only).
- Small red text uses --berry-ink on paper (about 6:1).

## 3. Dark mode
Switch on `prefers-color-scheme: dark`. Background becomes --ink, text becomes
--paper, raised surfaces use color-mix(in srgb, var(--ink) 85%, var(--paper)).
Red is used only as fills, stamps and borders in dark mode, never as small text.
Frost becomes the accent for links and selected states.

## 4. Typography (self-hosted, no CDN)
- Headings, stamps, serial numbers: Archivo Variable (@fontsource-variable/archivo).
  Use its width axis: normal width for headings, narrow width for serials and stamps.
- Body and forms: Source Sans 3 Variable (@fontsource-variable/source-sans-3).
- Scale: 13, 15, 17 (body), 21, 28, 38 px. Body line-height 1.5, headings 1.15.
- Line length max 65 characters. Sentence case everywhere. No all-caps labels
  except inside rubber stamps.
- Tabular numbers for serials, counts and times.

## 5. Layout, shape, spacing
- Mobile first, 360px minimum. Desktop max content width 1180px, left-aligned next to the menu.
- Mobile: bottom navigation with icon and label. Desktop (900px and up): a left rail, with the
  staff-only pages grouped under "Desk tools".
- Page background is a light frost tint (--page); content sits in near-white cards (--card)
  with a 1px hairline border and 10px corners. Every page is a header plus a stack of cards,
  so no screen is a blank field. Side panels (guides, previews) fill wide screens.
- Spacing scale: 4, 8, 12, 16, 24, 32, 48. Radius: 6px for fields and buttons, 10px for cards;
  ticket corners are square with semicircle notches.
- Borders do the work, not shadows: 2px solid --ink for tickets, hairlines for cards and
  dividers. No blurred shadows, no glass effects, no gradients.
  One allowed lift: `box-shadow: 0 3px 0 var(--ink)` on a pressed or hovered ticket or card.
- Buttons placed side by side always have a 12px gap (.button-row). In forms, Back sits on the
  left and the main action on the right.
- Touch targets at least 44px.

## 6. The PropertyTag (the signature component)
```
  ______________________________________________
 /  (o)                          |  PICT        \
|  hole   [pictogram]  Title     |  L           |
|         Place, floor           |  000045      |   <- stub, narrow Archivo,
|         Time label             |  - - - - -   |      rotated 90 degrees
|  [ STAMP: MATCHED ]            |  (barcode    |
 \_______________________________|   bars)_____/
                          perforation (dashed --frost line, semicircle notches)
```
- Paper is --paper with a 2px --ink border. The hole is a circle cut out in the page colour.
- No coloured edge strips anywhere (they look generated). Lost or found shows in the stub
  letter (--berry L, --steel F) and the pictogram's small detail; finished tickets use --ink.
- Photo (when present) replaces the pictogram, with a slight rounded corner and a 1px --ink border.
- Compact version for lists: same anatomy, 72px tall, no stamp, status as a small stamp-word.

## 7. Stamp (status)
- A rectangle with a double border, rotated -4 degrees, text in narrow Archivo bold capitals.
- Ink colour: --berry for lost, matched, rejected, expired. --steel for posted and in custody.
  --ink for verified and released. Use mix-blend-mode: multiply so it looks inked.
- Status words: Posted, In custody, Matched, Claim pending, Verified, Released,
  Moved to admin office, Expired, Donated, Recovered, Closed.
- Signature motion (the only decorative motion): when a status changes, the stamp
  drops in and settles over 250ms. Respect prefers-reduced-motion (no animation, just appear).

## 8. Pictograms (custom SVG, all in one style)
- 48x48 grid, 2px stroke, round caps and joins, stroke --ink, one accent shape
  filled --frost, and one small detail in --berry or --steel depending on lost or found.
- Set: id_card, phone, laptop, wallet, keys, bottle, bag, earbuds, books, other.
- Same family for 3 empty-state illustrations (no reports, no matches, no notifications).
- Interface icons: Phosphor, light weight (thin was too faint at menu size), from this list:
  arrow-right, arrow-left, close, camera, search, bell, check, lock, clock, pin, upload, trash,
  plus, filter, user, shield, plus for the menu and status: home, package, ticket, inbox,
  chart, flag, shield-check, sign-out, caret-down, info, warning, refresh, check-circle.
  No other icon library, no emojis, anywhere.
- College logo: client/public/brand/pict-logo.png when present (BrandMark), otherwise a
  drawn "PICT" badge.

## 9. Components
- Primary button: --ink (navy) fill, white text (frost fill with ink text in dark mode).
  Red is not used for normal actions any more, so it keeps its meaning: lost, attention, danger.
  Secondary: --steel fill, white text. Quiet: card fill with a hairline border.
  Danger: --berry fill, white 18px bold text, plus a confirm step.
  Disabled buttons turn grey, never a faded red.
- Number cards (StatCard): icon, label, big number and one line saying what it means.
- Fields: 2px --ink border, label above, hint below in --ink-soft, error in --berry-ink
  with a pin icon and text that says what to do next.
- Selection chips and category tiles: pictogram on top, name below; selected = --frost fill and 2px --ink border.
- Timeline: a dashed --frost line with punched circle stops; done stops filled --ink.
- Sheet for details and confirmations: a bottom sheet on phones, a centred window from 700px.
  Toast bottom centre.
- Stepper: a segmented progress bar plus one line "Step 2 of 8, Photos, Next: Blur", so no
  step name is ever cut off.
- Login: split screen. Navy half with the logo, one line, a sample ticket and four steps;
  the form in a card on the other half. Demo account cards appear only in development.
- Floor plan: area fills --frost, walls 2px --ink, hover and selected area --berry at
  30% with a --berry outline, pin is a small --berry marker with a --paper centre.
- Charts: hand-built SVG. Main series --ink, secondary --steel, highlight --berry, grid lines --frost.
  Direct labels on bars, no legends where avoidable.

## 10. Copy
- Sentence case, plain verbs, specific. No marketing words (seamless, effortless, reunite).
- Buttons name the action: "Post found item", "Send claim". The same action keeps the same name everywhere.
- Errors say what happened and what to do: "3 wrong answers. Try again in 30 minutes."
- Empty states invite an action. Prefer a visual or number to a sentence.

## 11. Accessibility and performance
- Visible focus: 3px --steel outline with 2px offset (--frost in dark mode).
- All images have alt text; status is never colour only; labels tied to inputs.
- prefers-reduced-motion respected. Lazy-load images. Largest page under 300KB of JS before AI models load.

## 12. Do and don't
Do: ticket anatomy, hard borders, one stamp moment, real data in every visual.
Don't: purple-blue gradients, glassmorphism, rows of identical soft-shadow cards,
hero with a gradient headline, emojis, stock icon packs, lorem ipsum, tooltips as the only explanation.
