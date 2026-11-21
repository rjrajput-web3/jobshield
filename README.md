# JobShield — Check if a job offer is real

A free web tool for job seekers, built for Indian freshers. Paste a job post, offer letter or
recruiter message and JobShield returns a **trust score (0–100) with clear, plain-English
reasons**, and checks the company/contact against a **crowd-reported scam database**.

Fake recruiters charge lakhs of freshers a “registration fee” or “security deposit” every year.
JobShield exists to catch the offer *before* the money leaves.

**Live demo:** _(Vercel URL added after first deploy)_

## What it does

- **Paste-and-check** — one textarea, one button, a verdict in under a second. No sign-up.
- **16-signal rule engine** — deterministic and explainable. Every point lost or gained comes
  with a reason a first-time internet user can understand:
  - Upfront fee / deposit demand: **−35** and a hard cap of 39
  - Match in the scam database: **−40**, hard cap, and a red banner
  - Payment to a personal UPI/number: −25 · Unrealistic salary: −20
  - Telegram/WhatsApp-only contact: −20 · Documents before interview: −20
  - Free-email recruiter: −15 · No verifiable company presence: −15
  - Domain mismatch: −15 · No-interview / guaranteed selection: −15
  - Urgency pressure: −10 · Vague job description: −10 · Spammy formatting: −5
  - Bonuses: official-domain email +10 · official careers/portal link +10 · complete JD +5
- **Scam database** — searchable list of reported scams, matched by company name, phone, UPI,
  Telegram handle or domain. A repeat offender is caught even with completely new wording.
- **Report-a-scam** — one-minute form; new reports join the database immediately and protect
  the next person who checks the same offer.

Scores are guidance, not a guarantee. Reports are community-submitted and labelled as
unverified. The golden rule the whole product teaches: **never pay a fee for a job.**

## How it works

- `lib/score.ts` — the rule engine (pure TypeScript, no external calls, fully unit-tested).
- `lib/extract.ts` — regex extractors for phones, UPI ids, emails, domains, salaries.
- `lib/match.ts` — scam-database matching (company / phone / UPI / handle / domain).
- `data/scams.json` — seed database of reported scams (all entries invented for the demo).
- `data/samples.ts` + `tests/score.test.ts` — a labelled set of 23 postings (18 scams,
  5 genuine) that the engine must score into the correct band. All 23 pass.
- `app/api/reports` — demo persistence: seed + session reports in an in-memory store.
  **Production path:** swap the store for a free-tier Postgres/KV — the `ScamReport` schema in
  `lib/types.ts` is already shaped for it.

See `docs/DESIGN.md` for the full design and `docs/SEED-SCAMS.md` for the test set.

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # scorer acceptance tests (23 labelled samples)
npm run build      # production build
```

## Tech

Next.js (App Router) + React + Tailwind CSS, deployed on Vercel's free tier. No paid APIs,
no database server, no sign-up — by design.
