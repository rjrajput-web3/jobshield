# JobShield — Round 2 Design (Build & Implement)

**What it is (exactly as submitted in Round 1):** A free web tool where a user pastes a job post, offer letter text, or a recruiter's message. JobShield analyses it in seconds and returns a simple trust score with clear reasons (fee demands, Telegram/WhatsApp-only contact, salary far above market, free-email domains posing as companies, urgency pressure, company-name/domain mismatch), and checks the company against a crowd-reported database of confirmed scam postings. No sign-up. Works on any phone browser. Plain simple English.

**Design principle for the build:** the rule engine IS the product. No paid APIs, no AI dependency for the MVP — deterministic rules are explainable, demo-proof, and every verdict can show *why*. (Round 1 text mentions an AI model "for context" — that is a stretch item only, see below; the submitted core promise is the score + reasons + scam database, and that is fully delivered by rules.)

---

## 1. MVP scope

### Must-ship (Round 2 is lost without these)
1. **Paste-and-check flow** — one textarea (paste job post / offer letter / recruiter chat), one "Check this offer" button, result in under ~2 seconds, no sign-up, no login.
2. **Trust score + verdict** — 0–100 score, three bands (High Risk / Be Careful / Looks Genuine), big and readable on a phone.
3. **Reasons list** — every triggered signal shown as a plain-English reason ("This post asks for a registration fee. Real companies never charge you to join."). No reason = no deduction; the user always sees *why*.
4. **Scam database check** — pasted text is matched against the crowd-reported scam DB (company name, phone number, UPI id, domain). A match is a hard flag and is shown at the top of the results.
5. **Scam database browse/search page** — searchable list of reported scams (company name, platform, what they ask for), seeded with the samples from `SEED-SCAMS.md`.
6. **Report-a-scam form** — company name, where seen (WhatsApp/Telegram/portal/email), contact number/handle used, what they asked for, short description. New reports appear in the DB list immediately (demo persistence, see §4).
7. **Mobile-first responsive UI** — designed for a cheap Android phone first; desktop is the afterthought.
8. **Live on a public URL** (Vercel) + public GitHub repo — the two links the submission needs.

### Stretch (only if must-ship is done and verified)
- Hindi verdict + reasons toggle (Round 1 said "Hindi support planned" — a toggle on the results page for verdict/reason strings only, not full i18n).
- "Check a company" standalone search (name → all reports + risk summary) separate from the paste flow.
- Share-result button (copies a short warning text for WhatsApp forwarding).
- Score breakdown bar (visual: which signal cost how many points).
- Free-tier LLM second opinion — **skip by default**; only if everything else is done, and never as a dependency of the score.

### Explicitly out of scope
- User accounts, logins, saved history.
- Real moderation/admin panel (reports are shown as "community-reported, unverified" — one disclaimer line handles this honestly).
- Browser extension, WhatsApp bot, native app.
- Any paid API, paid database, or card-gated hosting.

---

## 2. Pages & flows

| Route | Purpose | Key elements |
|---|---|---|
| `/` | Landing + checker (one page, checker above the fold) | Headline in plain English ("Check if a job offer is real — free, 10 seconds"), textarea, Check button, 3 sample-post quick-test chips ("Try a sample scam"), short "How it works" (3 steps), link to scam database |
| `/result` (rendered inline on `/` or as `/check` result state) | Verdict | Score dial/number, band label, hard-flag banner if DB match, reasons list (each: icon + plain-English text), "What to do next" line per band, buttons: *Check another*, *Report this as a scam* (prefills report form), *See reported scams* |
| `/scams` | Scam database | Search box (company / phone / keyword), report cards: company name, platform badge, contact used, what they ask for, date reported, report count. Disclaimer line at top. |
| `/report` | Report-a-scam form | Fields per §4 schema; on submit → success message + the report appears in `/scams`. Simple spam guard: all fields required, min description length, no links needed. |
| `/about` (footer link, one screen) | Trust & honesty | What JobShield is, that scores are guidance not a guarantee, reports are community-submitted and unverified, never pay a fee for a job. |

**Primary flow (the demo flow):** Land on `/` → paste posting → Check → verdict + reasons in ~1s → if scam: one tap to report it → appears in `/scams` → next user pasting the same company gets the hard flag. That loop is the whole story; build it first.

---

## 3. Tech stack (zero-cost only)

- **Framework:** Next.js (App Router) + React, single repo.
- **Styling:** Tailwind CSS. No component library, no paid UI kit.
- **Hosting:** Vercel free tier (GitHub-connected, auto-deploy on push). **No** Render/Railway/Fly/AWS — card-gated hosts are banned by standing rule.
- **Data:** static seed JSON in-repo (`data/scams.json`) + demo-persistence for new reports (see §4). No database server, no paid DB.
- **Scoring:** pure TypeScript module (`lib/score.ts`), no external calls — runs client-side or in a route handler; deterministic and unit-testable against the seed samples.
- **Extraction:** regex-based extractors (`lib/extract.ts`) for phone numbers, UPI ids, URLs/domains, email addresses, salary figures.
- **Repo:** public GitHub repo under `rjrajput-web3` (matches the profile link submitted in Round 1).
- **Assets:** inline SVG logo (shield + check), no stock photos, no external fonts beyond system/Google Fonts free.

---

## 4. Data model — scam-report database

Demo persistence decision (be honest in the demo, don't fake a backend): Vercel serverless has no durable file storage, so for Round 2 the DB is:
- **Seed data:** `data/scams.json` bundled in the repo (the labelled samples from `SEED-SCAMS.md`, marked `source: "seed"`).
- **Session reports:** reports submitted during a demo session are kept in an in-memory store behind a route handler (`/api/reports`, GET + POST) and merged with the seed for display. They reset on redeploy/cold start — acceptable for judging; the About page does not claim otherwise.
- **Production path (one line in README):** swap the store for a free-tier Postgres/KV later; schema below is already shaped for it.

```ts
// ScamReport — one row in the crowd database
interface ScamReport {
  id: string;               // slug + counter, e.g. "quickhire-services-003"
  companyName: string;      // as shown in the posting, e.g. "QuickHire Services"
  companyKey: string;       // normalised for matching: lowercase, no spaces/punct
  platform: "whatsapp" | "telegram" | "sms" | "email" | "portal" | "other";
  contact: string;          // phone / Telegram handle / email used by the poster
  contactType: "phone" | "telegram" | "email" | "upi" | "url";
  asksFor: string[];        // e.g. ["registration fee", "security deposit", "documents"]
  feeAmount?: string;       // e.g. "₹850" if mentioned
  description: string;      // 1–3 lines, reporter's words
  reportedAt: string;       // ISO date
  reportCount: number;      // duplicates increment this instead of new rows
  source: "seed" | "community";
  verified: boolean;        // always false in demo — label says "community-reported"
}

// CheckResult — output of the scorer for one pasted text
interface CheckResult {
  score: number;            // 0–100 after clamping
  band: "high-risk" | "caution" | "likely-genuine";
  dbMatch: ScamReport | null;
  hits: SignalHit[];        // every triggered signal, in display order
  extracted: { phones: string[]; upis: string[]; emails: string[]; domains: string[] };
}

interface SignalHit {
  signalId: string;         // e.g. "upfront-fee"
  points: number;           // negative deduction or positive bonus applied
  reason: string;           // user-facing plain-English text (from §5)
}
```

**Matching rule:** normalise the pasted text (lowercase, strip punctuation) and check: companyKey substring, any extracted phone/UPI equal to a report's contact, any extracted domain equal to a reported domain. Any one match → `dbMatch` set, hard flag (§5).

---

## 5. Trust-score rule engine

**Mechanics:** start at **100**. Apply deductions and bonuses from the table. Clamp to **0–100**.
**Bands:** **0–39 = High Risk** (red, "Do not pay or share documents"), **40–69 = Be Careful** (amber, "Check the company yourself before you continue"), **70–100 = Looks Genuine** (green, "No scam signs found — still never pay any fee").
**Hard caps (override the arithmetic):**
- Upfront-fee signal OR database match → final score can never exceed **39**.
- Database match alone also forces the hard-flag banner regardless of other signals.
**Display order of reasons:** hard flag first, then deductions by size, then positive signs.

| # | Signal | Detection (concrete) | Points | User-facing reason text |
|---|---|---|---|---|
| 1 | **Upfront fee demand** | keywords: registration fee, security deposit, refundable deposit, training fee, kit/material charges, "pay ₹… to start", joining fee | **−35** + hard cap | "This post asks you to pay money before joining. Real companies never charge a fee to give you a job." |
| 2 | **Scam-database match** | companyKey / phone / UPI / domain match vs `ScamReport[]` | **−40** + hard cap + banner | "This company/contact has been reported as a scam by other job seekers. Do not engage." |
| 3 | **Payment to a personal UPI / number** | UPI id or "pay on this number" pattern where the payee is a personal handle (not a company domain/name match) | **−25** | "Payment is asked on a personal UPI/number, not a company account. This is a classic scam pattern." |
| 4 | **Unrealistic salary** | salary figure parsed vs role baseline table (data entry/typing/back-office: > ₹25,000/mo or any "₹X per day" ≥ ₹1,500/day for unskilled roles; "earn lakhs from home, no experience") | **−20** | "The salary promised is far above the normal market rate for this kind of work. Scammers use big salaries to trap people." |
| 5 | **Telegram/WhatsApp-only contact** | telegram link/handle or WhatsApp number present AND no official email/domain/portal apply link | **−20** | "The only way to contact them is Telegram/WhatsApp. Genuine companies use official email or their own website." |
| 6 | **Documents demanded up front** | Aadhaar, PAN, bank passbook/cheque, passport, photos "send on WhatsApp before interview" | **−20** | "They ask for your Aadhaar/bank documents before any interview. Never share documents with an unverified recruiter." |
| 7 | **Free-email recruiter** | email from gmail/yahoo/outlook/hotmail/rediff while claiming a company identity | **−15** | "The recruiter uses a free Gmail/Yahoo email. Real company recruiters write from the company's own email domain." |
| 8 | **No verifiable company presence** | company name given but no website/domain anywhere in the text, and no portal listing reference | **−15** | "No company website or official page is mentioned anywhere. A real company is easy to verify online." |
| 9 | **Company/domain mismatch** | a domain IS given but its name doesn't resemble the claimed company name | **−15** | "The website/email domain does not match the company name they claim. Scammers often copy big brand names." |
| 10 | **No interview / guaranteed selection** | "no interview", "direct joining", "100% selection", "guaranteed job" | **−15** | "They promise selection with no interview. Real hiring always has some selection process." |
| 11 | **Urgency pressure** | "apply within 2 hours", "only 3 seats left", "offer expires today", "immediate joining or lose the job" | **−10** | "They pressure you to decide immediately. Scammers rush you so you don't get time to check." |
| 12 | **Vague job description** | text length short AND none of: responsibilities, skills, experience, work location, shift — for a posting claiming to be a full job ad | **−10** | "The post says almost nothing about the actual work, skills needed, or office location. Real job posts are specific." |
| 13 | **Spammy formatting** | excessive emojis/caps, "💰💰", repeated exclamation, forwarded-message markers ("Forwarded", "share to 10 groups") | **−5** | "The message looks like a mass-forwarded spam post, not a real company announcement." |
| 14 | **Official-domain email** (bonus) | email domain matches claimed company name | **+10** | "Good sign: the recruiter's email is on the company's own domain." |
| 15 | **Official careers/portal link** (bonus) | link to the company's own careers page or a recognised job portal listing | **+10** | "Good sign: the post links to an official careers page / known job portal." |
| 16 | **Specific, complete JD** (bonus) | responsibilities + skills + location all present | **+5** | "Good sign: the post clearly describes the work, skills needed, and location." |

**Role salary baselines (for signal 4, monthly INR, fresher level):** data entry / typing / back office ₹8,000–18,000 · telecaller/BPO ₹12,000–22,000 · delivery ₹18,000–30,000 (incl. incentives) · sales executive ₹15,000–30,000 · software/IT fresher ₹25,000–60,000. Flag when promised pay > ~1.8× the top of the matched role's range, or when a per-day figure implies more than that monthly. If no role matches, only flag extreme claims ("₹5,000/day", "lakhs per month, no experience").

**Sanity targets (from `SEED-SCAMS.md`):** every labelled scam must land ≤ 39 except deliberately borderline ones (marked in the seed file, target 40–55); every genuine sample must land ≥ 70. The build is not done until the scorer passes all seed cases.

---

## 6. Copy rules (user-facing text)

- Plain English a first-time internet user understands. Short sentences. No jargon ("fraudulent" → "fake/scam", "remuneration" → "salary").
- Every verdict ends with one action line: High Risk → "Do not pay any money and do not send your documents." · Caution → "Verify the company on its official website before you reply." · Genuine → "No scam signs found. Still, never pay any fee for a job."
- One honesty line under every result: "JobShield checks common scam signs. A high score is not a guarantee — always verify the company yourself."
- Reports labelled "Community-reported — not independently verified."

## 7. Definition of done (Round 2)

Live Vercel URL loads on a phone browser → paste each of 3 demo postings (1 obvious scam, 1 DB-match scam, 1 genuine) → correct band + reasons each time → report flow adds a scam → re-pasting that company triggers the hard flag → `/scams` search finds it. Repo public, README explains problem/solution/how to run. Then submit (see `BUILD-ORDER.md`).
