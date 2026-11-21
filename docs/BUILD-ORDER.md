# JobShield — Round 2 Build Order (hour by hour)

**Window:** Sat 21 Nov 2026, 19:00 IST → Sun 22 Nov 2026, 17:00 IST (22 hours, solo build).
**Inputs:** `DESIGN.md` (scope, data model, scoring table) + `SEED-SCAMS.md` (test set) in this folder.
**Rule for the whole window:** must-ship list first, in this order. A stretch item is touched only when every must-ship item above it is verified working on the live URL. Commit + push after every block — Vercel auto-deploys, so every push is a live checkpoint.

---

## Phase 0 — Setup (19:00–20:00)
- [ ] 19:00 — Create public GitHub repo `jobshield` under `rjrajput-web3`; clone locally.
- [ ] Scaffold: `npx create-next-app@latest` (TypeScript, App Router, Tailwind, ESLint). First commit.
- [ ] Link repo to Vercel (free tier, GitHub login), confirm the placeholder page deploys to a live URL. **Checkpoint: live URL exists before any feature work.**
- [ ] Add favicon + inline SVG shield-check logo, page title/meta ("JobShield — Check if a job offer is real").
- [ ] Copy `DESIGN.md` + `SEED-SCAMS.md` into repo `/docs` (judges can read the thinking).

## Phase 1 — Scoring engine (20:00–22:00) — build the brain before the face
- [ ] 20:00 — `lib/extract.ts`: extractors for phones, UPI ids, emails, domains/URLs, salary figures (₹…/month, /day, LPA).
- [ ] 20:30 — `lib/score.ts`: implement all 16 signals from DESIGN §5 exactly (weights, hard caps, band thresholds), each hit returns its user-facing reason string.
- [ ] 21:15 — Negation guards: fee signal must not fire on "no fee", "free kit", "paid test (paid TO candidate)" phrasing (G2/G3/G4 depend on this).
- [ ] 21:30 — `data/scams.json`: seed rows from SEED-SCAMS S1–S18 (S18 reuses S1's row). `lib/match.ts`: companyKey/phone/UPI/domain matching.
- [ ] 21:45 — Quick test script: run scorer over all 23 seed texts, print score vs target band. **Checkpoint: acceptance checklist in SEED-SCAMS.md fully green before moving on.** Fix weights/regexes here, not during UI work.

## Phase 2 — Checker UI (22:00–23:30)
- [ ] 22:00 — `/` landing: headline, sub-line, textarea (large, phone-friendly), "Check this offer" button, 3 sample chips (S1, S18 text, G1) that prefill the box.
- [ ] 22:45 — Result view: score number + band colour, hard-flag banner slot, reasons list (deducts then bonuses), per-band action line, honesty line, buttons: Check another / Report this scam / See reported scams.
- [ ] 23:15 — Empty-input and very-short-input handling ("Paste the full job post or message — more text gives a better check.").
- [ ] **Checkpoint:** push; test the 3 sample chips on the live URL on a phone-sized viewport.

## Phase 3 — Scam database pages (23:30–00:30)
- [ ] `/scams`: search box + report cards from seed JSON (company, platform badge, contact, asksFor chips, date, report count) + "community-reported, not independently verified" disclaimer.
- [ ] `/api/reports`: GET (seed + session reports merged), POST (append to in-memory store; same companyKey+contact → increment reportCount instead of duplicating).
- [ ] Wire DB-match into the checker result (hard-flag banner shows the matched report's summary).
- [ ] **Checkpoint:** push; paste S18's text live → banner fires. Paste a made-up variant of S1 with the same phone → banner fires.

## ⏸ Sleep block (00:30–06:30)
- [ ] Before sleeping: everything committed + pushed, live URL verified once more, tomorrow's list (this file) open. A working live demo already exists at this point — everything after this is improvement, not rescue.

## Phase 4 — Report flow (06:30–08:00)
- [ ] `/report` form per DESIGN §4 fields (company, platform select, contact, asksFor multi-select + free text, description). All required; min description 20 chars.
- [ ] Prefill from checker ("Report this scam" carries company/contact guesses from the pasted text).
- [ ] On submit: success screen ("Your report now protects the next applicant") + report visible in `/scams` and matched by the checker in the same session.
- [ ] `/about` one-screen page (what it is, score honesty, report disclaimer, "never pay a fee for a job").
- [ ] **Checkpoint:** full loop live — paste scam → verdict → report it → paste again → hard flag.

## Phase 5 — Polish (08:00–10:00)
- [ ] Mobile pass: tap targets, textarea size, result readability at 360px width; band colours pass contrast.
- [ ] Copy pass: every string checked against DESIGN §6 (plain English, no jargon).
- [ ] Landing "How it works" 3-step strip + one-line impact statement (from Round 1 text).
- [ ] Stretch, only if all above is green: Hindi toggle for verdict + action lines; share-result WhatsApp text button.
- [ ] README.md: problem, solution, how scoring works (signal table summary), how to run locally, live URL, production-path note for the DB.

## Phase 6 — Full verification (10:00–12:00)
- [ ] Run all 23 seed cases against the **live** URL (not localhost); log score vs target in a scratch table; fix any miss.
- [ ] Fresh-eyes pass: open the live site as a first-time user on a phone viewport; time the full check flow (target < 30 seconds end to end).
- [ ] Check `/scams` search with 3 queries (company name, phone fragment, keyword "fee").
- [ ] Confirm repo is public and the deployed commit == latest commit.

## Phase 7 — Deploy freeze + demo assets (12:00–14:00)
- [ ] 12:00 — **Feature freeze.** Only bug fixes after this point.
- [ ] Final production deploy; verify live URL on an actual phone browser if possible (not just devtools).
- [ ] Screenshots for the submission: (1) landing with a scam pasted, (2) red verdict with reasons, (3) DB-match banner (S18), (4) green verdict (G1), (5) scam database page.
- [ ] Demo script (2 minutes, in this order): the problem in one line → paste S1 → red verdict + fee reason → paste S18 → "same scammer, new words — still caught" banner → paste G1 → green → report a scam → it appears in the DB. Record only if Round 2's submission format asks for a video; otherwise the screenshots + live URL carry it.

## Phase 8 — Submission (14:00–16:00, deadline 17:00)
- [ ] Re-read the Round 2 submission form on Unstop and note every required field **before** filling anything (fields first, answers second).
- [ ] Prepare field answers in a scratch doc: project title (JobShield), one-line summary, problem/solution text (reuse Round 1 wording, updated to "built"), live demo URL, GitHub repo URL, screenshots, team = solo (Rohit Rajput).
- [ ] Verify each URL loads publicly in a private/incognito window (Vercel URL + GitHub repo) before pasting it into the form.
- [ ] Fill the form, attach assets, **submit by 16:00 — one full hour before the deadline.**
- [ ] After submitting: re-open the submission page and verify every field/attachment saved correctly; screenshot the confirmation.

## Buffer (16:00–17:00)
- [ ] Held empty on purpose: form glitches, Vercel hiccups, re-uploads. If unused, spend it on the Hindi toggle — never on a new feature.

---

## If time slips — cut in this order
1. Hindi toggle and share button (stretch, cut first).
2. `/about` page → fold its 4 lines into the landing footer.
3. Report-form prefill (form still works standalone).
4. **Never cut:** scorer correctness on seed cases, DB-match banner, report→DB loop, live URL, submission buffer hour.

## Hard rules for the window
- $0 spend: no paid APIs, no paid tiers, no card-gated hosts (Vercel free + GitHub only).
- No sign-up/login features. No real user data anywhere — seed data is invented (SEED-SCAMS.md).
- Reports are always labelled community-reported/unverified. Scores always carry the "not a guarantee" line.
- Push after every phase; the live URL is the progress report.
