# Member 3 contributions

## Name

Samiksha

## Owned paths

client+server modules/found; shared/data/desks.json; shared/models/FoundItem.js

## Features built

### Found module

- `FoundItem` model: images (public URL + private, hidden Cloudinary id), colours, hidden-detail
  answers (hidden by default), location, custody (desk or finder-held), AI colour suggestion,
  status lifecycle, indexes on finder+status and building+floor.
- Hidden-detail prompts per category (ID card, phone, laptop, wallet, keys, bottle, bag, earbuds,
  books, other), never returning the answer through normal queries.
- Desk suggestion: same floor and building, then same building, then configured nearby
  buildings, then any desk, as a fallback chain.
- Routes: create/list/get found items, server-signed Cloudinary uploads (separate public and
  private folders), desk suggestion, hidden-detail prompts — all behind `requireAuth`.
- Camera capture with `getUserMedia` and a file-picker fallback when no camera is available.
- On-device colour suggestion: Canvas pixel downsampling and nearest-colour matching, with a
  multicolor fallback, deliberately skipping machine-learning category detection since no such
  dependency exists in the frozen package.json.
- Hand-written box blur (real pixel rewrite, not a CSS filter) with a drag-to-select rectangle
  editor, stepping through all photos before upload.
- Full "Post a found item" flow: category, photos, blur, describe, hidden detail, location, desk,
  review and submit, built as one multi-step page with the shared Stepper component.
- "My found items" page: lists the logged-in user's posted items as claim-ticket cards using the
  shared PropertyTag and Stamp components.
- Demo seed data: 6 found items across categories, locations and statuses, tied to existing
  seeded users, safe to re-run.

## Tests

Not yet written. Planned before defense: a route test for `POST /found/items` (serial assigned,
hidden answer not returned by `GET /found/items/:id`), a unit test for `suggestDesk()`'s fallback
order, and a client test for `detectColors()` against a known solid-colour test image.

## Demo notes

See docs/explain/found.md for the data flow, key functions, likely questions and the 2-minute
demo script.