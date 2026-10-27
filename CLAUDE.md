# Project rules for Claude (PICT Lost and Found)

Read these first: DESIGN.md, docs/PROJECT_BRIEF.md, docs/CONTRACT.md, docs/OWNERSHIP.md.

## Who this is for
College students who must present and defend every line of this code to teachers
in a CLIENT-SIDE SCRIPTING course. Major focus is the frontend. They will be
asked how things work, so every piece of code must be easy to explain.

## Code must be easy to explain
- Plain, readable JavaScript (ES modules). No TypeScript. No clever one-liners,
  no deep abstraction, no metaprogramming. A second-year student should follow it.
- Small files (about 150 lines max) and small functions (about 30 lines max), one job each.
- Clear names (`blurRegions`, not `proc`). Avoid single-letter names except loop counters.
- Every file starts with a 3 to 6 line comment: what the file does, why it exists,
  and how it connects to other files. Every function has a one-line comment.
- Comment the "why" for non-obvious lines (for example Canvas maths or Socket.IO events).
- Prefer the browser's own APIs written by hand over libraries, because the course is
  client-side scripting: DOM events, fetch with async/await, Canvas (blur and compression),
  getUserMedia (camera), FileReader and Blob, Web Storage (draft forms), Touch and Pointer
  events (floor plan pin), IntersectionObserver (lazy images), Service Worker (PWA),
  Socket.IO client (live notifications), form validation, CSS custom properties, media queries.
- Plain CSS with the tokens from DESIGN.md. No Tailwind, no UI kit, no CSS-in-JS.
- React is used simply: function components, useState, useEffect, useRef, and small
  custom hooks. No Redux, no context trickery beyond auth and toasts.
- Do not add dependencies. package.json is frozen.

## Explain-as-you-go
- For every module you build, create docs/explain/<module>.md containing:
  1. How it works in 10 lines (a data-flow sketch in words).
  2. The 6 most important functions and what each does.
  3. 10 questions a teacher might ask, each with a short model answer.
  4. A 2-minute demo script.
- At the end of each task, give me a plain-language summary: what you built, which files,
  and how to explain it in one minute.

## Design
- Follow DESIGN.md exactly: palette, typography, ticket anatomy, stamps, pictograms.
- No emojis. No Lucide, Font Awesome, Heroicons or Material icons. No gradients or glass effects.

## Git rules (strict)
- NEVER run git add, commit, push, pull, merge, rebase, checkout, switch, reset, stash,
  tag or any command that changes git state or history. Read-only commands (git status,
  git diff, git log) are allowed.
- When a task is done, list the files you created or changed so the human can commit them.
- Never create, read, print or edit .env. Only edit .env.example, and only if you are the
  keeper of frozen files. Never put secrets in code.

## Boundaries
- Edit only the paths owned by your member (see docs/OWNERSHIP.md). If you need a change
  elsewhere, stop and tell me to raise a GitHub Issue.
- Run npm run format, npm run lint and npm test before saying a task is finished.
