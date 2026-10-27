# Team plan

Who owns what is in docs/OWNERSHIP.md. The prompts each member runs are in docs/prompts/.

## Who builds what
| | Member 1 (Claude Code) | Member 2 (Claude Code) | Member 3 (Arena) |
|---|---|---|---|
| Foundation | Design system, location picker, app shell | Phase 0: skeleton, login, shared contract | None, starts with the module |
| Module | Lost + Notifications (live updates) | Verify and Handover | Found + photo pipeline |
| Branch | feat/lost | phase0/foundation, then feat/verify | feat/found |
| Special data | locations.json, floor plan images | none | desks.json |
| Prompt | prompts/member1-lost.md | prompts/phase0-member2.md, prompts/member2-verify.md | prompts/member3-found.md |

## Rules that prevent merge conflicts
- Each person edits only their own folders (docs/OWNERSHIP.md).
- Shared files are frozen after Phase 0: package.json, the lockfile, .env.example, the server and
  client loaders, the constants, User.js. If you need a change, open a GitHub Issue. Member 2
  (keeper) makes a tiny PR the same day.
- All dependencies are installed in Phase 0, so nobody touches package.json.
- Modules load themselves. The server scans modules/* and the client scans modules/*/routes.jsx.
  Adding a module never means editing a shared router.
- Modules talk through a service registry, not imports. For example, Found calls
  services.runMatching(...) without importing Lost's code. Phase 0 provides working stubs, so every
  module runs alone from day 1.
- Core database models live in separate files with one owner each. Everyone can read them from day 1.
- Dev login switcher: act as student, handler or admin without waiting for anyone else's screens.
- Prettier and ESLint are fixed in Phase 0. Run npm run format before every commit, so pasted
  Arena code does not produce formatting noise.
- Contributions are in per-person files (docs/contributions/<name>.md).
- Daily routine: git pull --rebase origin main, work on your branch, open small PRs often.

## Timeline
| Phase | What happens |
|---|---|
| 0: Skeleton | Member 2 runs prompts/phase0-member2.md. Meanwhile Member 1 collects PICT floor plans and the building list, and Member 3 collects the desk list, reads the brief and sets up the Arena chat. |
| 1: Parallel build | Everyone builds on their own branch. Member 1 merges the design system early so everyone gets real styling. |
| 2: Integration | Run the full story (lost, found, match, claim, verify, release) and fix the seams. |
| 3: Polish | Seed realistic demo data, test on real phones, prepare the demo and slides. |

## One-time setup for each member
After pulling main (once Phase 0 is merged), hide CLAUDE.md locally:
```
echo "CLAUDE.md" >> .git/info/exclude
```
Then create CLAUDE.md in the repo root with the shared rules text.

## Git routine for every push
Claude never runs git (CLAUDE.md). The human runs this from the repo root:
```
npm run format
npm run lint
npm test
git status
git add <only your own paths>
git commit -m "<message from the tables below>"
git pull --rebase origin main
git push -u origin <your-branch>
```
Then open a Pull Request into main, get one teammate to review, and merge. Avoid `git add .`.
Check git status before you add anything: your CLAUDE.md and any .env file must not appear.

Paths to add:
- Member 1: client/src/modules/lost server/src/modules/lost client/src/modules/notifications server/src/modules/notifications client/src/shared/ui client/src/shared/location-picker client/src/styles client/public/floorplans client/public/icons server/src/shared/data/locations.json server/src/shared/models/LostReport.js docs/explain/lost.md docs/explain/design-system.md docs/contributions/member1.md
- Member 2: client/src/modules/verify server/src/modules/verify server/src/shared/models/Claim.js docs/explain/verify.md docs/contributions/member2.md
- Member 3: client/src/modules/found server/src/modules/found server/src/shared/data/desks.json server/src/shared/models/FoundItem.js docs/explain/found.md docs/contributions/member3.md

## Commit tables

### Phase 0: Member 2 (branch phase0/foundation)
| Commit after | Message |
|---|---|
| Tooling and dependencies | chore: set up npm workspaces, tooling and dependencies |
| Server skeleton and module loader | feat(server): add express skeleton with module auto-loader |
| Core models and registry | feat(server): add core models, constants and service registry |
| Auth | feat(auth): add email one-time-code login, roles and dev user switcher |
| Client skeleton | feat(client): add app shell, router auto-discovery and PWA setup |
| Design tokens and docs | docs: add DESIGN.md, contract, ownership and explain docs |

### Member 1: Lost, Notifications, design system (branch feat/lost)
| Commit after | Message |
|---|---|
| A1 to A4 | feat(ui): add design tokens, shared components, pictograms and app shell |
| B | feat(notifications): add notifications with live updates and email |
| A5 | feat(ui): add floor plan location picker with pin and area modes |
| C1 to C2 | feat(lost): add lost report flow and saved items |
| C3 to C5 | feat(lost): add match engine and plain-language explanation |
| C6 to C8 | feat(lost): add lost screens, seed data and explain notes |

### Member 2: Verify and Handover (branch feat/verify, after Phase 0 is merged)
```
git checkout main
git pull origin main
git checkout -b feat/verify
```
| Commit after | Message |
|---|---|
| Part 1 | feat(verify): add hash-chain custody log with integrity check |
| Part 2 | feat(verify): add owner check scoring and 3-try lockout |
| Part 3 | feat(verify): add handler decision and one-time handover code |
| Part 4 | feat(verify): add lifecycle jobs, abuse flags and analytics routes |
| Part 5 | feat(verify): add claimant screens and handover code view |
| Part 6 | feat(verify): add handler desk, analytics charts and integrity page |
| Part 7 | docs(verify): add seed data and explain notes |

### Member 3: Found (branch feat/found)
```
git checkout main
git pull origin main
git checkout -b feat/found
```
| Commit after | Message |
|---|---|
| F1 | feat(found): add found item model, hidden-detail prompts and desk suggestion |
| F2 | feat(found): add found item routes and signed image upload |
| F3 | feat(found): add camera capture with retake and image resizing |
| F4 | feat(found): add on-device category and colour suggestion |
| F5 | feat(found): add auto-blur with private original and public copy |
| F6 | feat(found): add post found item flow and success ticket |
| F7 | feat(found): add my found items page, seed data and explain notes |

## Integration checklist (Phase 2, all three together)
1. A student reports a lost bottle by tapping the floor plan.
2. Another student photographs a bottle. Suggestions appear, the photo is blurred, hidden details
   are entered, a desk is suggested, and the item is posted.
3. The owner gets a live notification with the "why this match" sentence.
4. The owner answers the hidden-detail questions, first wrongly to show the 3-try lockout, then correctly.
5. The handler sees the claim, approves it, the owner sees the code, and the handler enters it to release the item.
6. Open the custody log, run the integrity check, run the tamper script, then show the check catching the edit.
7. Show the analytics and the flagged account.
