# JobShield — Seed Samples for Demo & Scorer Testing

Labelled test set for the trust-score engine (see `DESIGN.md` §5). Use these to (a) seed `data/scams.json`, (b) verify the scorer: **scams must land in their target band, genuine posts must score ≥ 70**.

**All company names, phone numbers, handles and UPI ids below are invented for testing.** Number format kept realistic (10-digit mobile style) so the extractors are honestly exercised.

**How to seed the DB:** S1–S18 become `ScamReport` rows (platform/contact/asksFor taken from each entry). G1–G5 are NOT in the DB — they are scorer-only tests.

---

## SCAM SAMPLES (18)

### S1 — WhatsApp forward, data-entry fee scam · Target: High Risk (hard cap)
> 💰💰 WORK FROM HOME 💰💰 Amazon Data Entry Job!! Salary ₹45,000/month. No experience needed. Only smartphone required. Registration fee only ₹850 (fully refundable). Pay on UPI: rahul.pay@okhdfc and send screenshot. Join fast, only 3 seats left!! Contact WhatsApp 98120 44517. Forward to your friends groups 🙏
- **Signals:** upfront fee (−35, cap), personal UPI (−25), unrealistic salary (−20), WhatsApp-only (−20), urgency (−10), spammy formatting (−5)
- **DB row:** QuickKart Services · whatsapp · 9812044517 · asksFor: registration fee

### S2 — Telegram typing job, kit charges · Target: High Risk (hard cap)
> Typing work available. 50 pages per day, earn ₹1,800 daily. Material kit charges ₹1,200 before starting, kit will be couriered. DM on Telegram @typingwork_india. No interview, direct joining after kit payment.
- **Signals:** upfront fee (−35, cap), unrealistic salary (−20), Telegram-only (−20), no interview (−15)
- **DB row:** TypingWork India · telegram · @typingwork_india · asksFor: kit charges

### S3 — Recruiter email from Gmail, security deposit · Target: High Risk (hard cap)
> Dear Candidate, You are selected for Back Office Executive at Sharma Logistics Pvt Ltd. Salary ₹32,000 per month. To confirm your seat, pay a refundable security deposit of ₹2,500 within 24 hours. Reply to this email (hr.sharmalogistics88@gmail.com) with your Aadhaar copy and bank passbook photo.
- **Signals:** upfront fee (−35, cap), documents up front (−20), free-email recruiter (−15), urgency (−10)
- **DB row:** Sharma Logistics Pvt Ltd · email · hr.sharmalogistics88@gmail.com · asksFor: security deposit, documents

### S4 — "Bank job" SMS, training fee · Target: High Risk (hard cap)
> Congratulations! Your resume is shortlisted for HDFC-style Bank Assistant job, salary ₹38,500. Attend training after paying training fee ₹1,499 on number 90041 77230. Call immediately, offer valid today only.
- **Signals:** upfront fee (−35, cap), personal-number payment (−25), urgency (−10), salary high for role (−20), no verifiable presence (−15)
- **DB row:** National Bank Recruitment Cell · sms · 9004177230 · asksFor: training fee
- *(Note: uses a "bank-style" claim without a real bank domain — also tests signal 9 mismatch logic if a fake domain is added in a variant.)*

### S5 — Instagram/WhatsApp "review products, earn daily" · Target: High Risk
> Earn ₹3,000–₹5,000 daily by giving 5-star reviews to products. Work 30 minutes on phone. First task free, then VIP tasks need small recharge to unlock bigger commission. WhatsApp 87654 20918 to start now.
- **Signals:** unrealistic salary (−20), WhatsApp-only (−20), vague JD (−10), spammy (−5); fee appears only later in chat, so no hard cap — still deep red on points
- **DB row:** StarReview Earning · whatsapp · 8765420918 · asksFor: recharge for VIP tasks

### S6 — Fake airport job, uniform + ID card charges · Target: High Risk (hard cap)
> Airport Ground Staff vacancy, 12th pass, salary ₹41,000. Uniform and ID card charges ₹3,200 payable before document verification. Send Aadhaar, PAN and photo on WhatsApp 74589 33120. Joining this week only.
- **Signals:** upfront fee (−35, cap), documents (−20), WhatsApp-only (−20), salary high (−20), urgency (−10)
- **DB row:** SkyPort Aviation Services · whatsapp · 7458933120 · asksFor: uniform charges, ID card charges, documents

### S7 — Telegram "crypto task" job · Target: High Risk
> Simple online task job. Like videos and complete tasks, earn ₹800–₹2,500 per day. Tasks given only on Telegram @dailytask_earn. Bigger tasks after first deposit. 100% genuine, lakhs of members already earning.
- **Signals:** unrealistic salary (−20), Telegram-only (−20), vague JD (−10), no presence (−15), spammy (−5)
- **DB row:** DailyTask Earn · telegram · @dailytask_earn · asksFor: deposit for bigger tasks

### S8 — Data entry with "laptop security" payment to personal number · Target: High Risk (hard cap)
> Urgent hiring: Data Entry Operator, WFH, ₹28,000/month, fresher welcome. Company laptop will be couriered after laptop security payment ₹4,999 on 96501 28847 (GPay). Share payment screenshot and Aadhaar for dispatch.
- **Signals:** upfront fee (−35, cap), personal-number payment (−25), documents (−20), salary high (−20), urgency (−10)
- **DB row:** InfoEdge Data Solutions · whatsapp · 9650128847 · asksFor: laptop security payment, documents

### S9 — Call-centre job via Yahoo email · Target: Caution→High Risk borderline (target 35–45)
> BPO voice process hiring, night shift, salary ₹24,000. Walk-in interview at our office, bring resume. Contact HR: hr.sunrise.bpo@yahoo.com. Candidates must arrange their own headset before joining, headset available at our desk for ₹999.
- **Signals:** free-email (−15), small upfront charge (−35 applies by keyword "available at our desk for ₹999" — borderline by design; if engine scores ≤39 that's acceptable, if 40–45 also acceptable), JD fairly specific (+5)
- **DB row:** Sunrise BPO Services · email · hr.sunrise.bpo@yahoo.com · asksFor: headset charge
- *(Deliberately borderline — tests that the engine doesn't need to be perfect, just safe-side.)*

### S10 — "Part-time form filling" WhatsApp, per-form bait · Target: High Risk
> Form filling job: ₹60 per form, daily 100 forms = ₹6,000/day. Weekly payout. Start today, message "START" on WhatsApp 70114 50982. First week target complete karne par bonus. No charges for joining.
- **Signals:** unrealistic salary (−20), WhatsApp-only (−20), vague JD (−10), no presence (−15)
- **DB row:** FormFill India · whatsapp · 7011450982 · asksFor: (none upfront — hook first, fee later)

### S11 — Fake internship with certificate fee · Target: High Risk (hard cap)
> Paid internship opportunity for students! Marketing intern, stipend ₹15,000. Certificate + LOR included. Enrolment fee ₹499 only. Limited batch, apply in 2 hours. Telegram @internbatch2026.
- **Signals:** upfront fee (−35, cap), Telegram-only (−20), urgency (−10)
- **DB row:** InternBatch Academy · telegram · @internbatch2026 · asksFor: enrolment fee

### S12 — Delivery job, "bike + licence + deposit" · Target: High Risk (hard cap)
> Delivery executive required, earn ₹52,000/month with incentives. Own bike compulsory. Refundable deposit ₹5,000 for delivery bag and uniform. Contact 88990 41276. Joining tomorrow, no interview.
- **Signals:** upfront fee (−35, cap), no interview (−15), salary inflated (−20)
- **DB row:** SwiftDrop Logistics · whatsapp · 8899041276 · asksFor: refundable deposit

### S13 — Content-writing ghost job, "test fee" · Target: High Risk (hard cap)
> Article writers wanted, ₹800 per article, work from home. To check writing quality, first purchase our test package ₹350. After passing, regular work starts. Email: content.desk.hiring@gmail.com.
- **Signals:** upfront fee (−35, cap), free-email (−15), no presence (−15)
- **DB row:** ContentDesk Hiring · email · content.desk.hiring@gmail.com · asksFor: test package fee

### S14 — "Government job" portal clone · Target: High Risk (hard cap)
> Sarkari vacancy: Clerk posts open, salary ₹44,000. Apply on www.govtjobs-portal-india.com and pay application fee ₹750 by UPI. Last date today. Share with all groups.
- **Signals:** upfront fee (−35, cap), domain mismatch vs claimed govt identity (−15), urgency (−10), spammy forward marker (−5)
- **DB row:** GovtJobs Portal India · portal · govtjobs-portal-india.com · asksFor: application fee

### S15 — Receptionist job, documents-first on WhatsApp · Target: High Risk
> Female receptionist required for clinic, salary ₹30,000. Send your photo, Aadhaar and 10th marksheet on WhatsApp 93220 68415 for direct selection. No interview, joining from Monday.
- **Signals:** documents (−20), no interview (−15), WhatsApp-only (−20), salary high for role (−20)
- **DB row:** CityCare Clinic Hiring · whatsapp · 9322068415 · asksFor: documents, photo

### S16 — "Packing work from home", material deposit · Target: High Risk (hard cap)
> Ghar baithe packing ka kaam. Material home delivery hoga. Pehle material deposit ₹2,000 jama karein, kaam complete par wapas. Per piece ₹25, monthly ₹35,000 tak kamayein. WhatsApp 84710 29384.
- **Signals:** upfront fee (−35, cap), unrealistic salary (−20), WhatsApp-only (−20)
- **DB row:** HomePack Enterprises · whatsapp · 8471029384 · asksFor: material deposit

### S17 — Sophisticated one: real-looking JD, fee buried at the end · Target: High Risk (hard cap) — *tests that a polished JD doesn't rescue a fee*
> Hiring: Junior Accountant, Pune office. Responsibilities: Tally entries, GST filing support, vendor payments. Requirements: B.Com, 0–1 yr experience, Tally ERP. Salary ₹22,000/month, PF + ESI. Walk-in Mon–Fri, 11am–4pm, Baner office. Selected candidates pay a one-time refundable caution deposit of ₹10,000 before offer letter release. — HR, accounts@brightledgerca.com
- **Signals:** upfront fee (−35, cap) vs specific JD (+5), official-domain email (+10) — cap must still force ≤ 39
- **DB row:** BrightLedger CA · portal · accounts@brightledgerca.com · asksFor: caution deposit

### S18 — Repeat offender (DB-match test) · Target: hard-flag banner, score ≤ 39 regardless of wording
> Part-time online work, flexible hours, students welcome. Daily payouts, simple mobile tasks. For details contact QuickHire Services on WhatsApp 98120 44517.
- **Signals:** text itself is mild (−20 WhatsApp-only, −10 vague) BUT contact number matches S1's DB row → **database match (−40) + hard cap + banner**. This is the demo's money shot: same scammer, new wording, still caught.
- **DB row:** same as S1 (reportCount increments)

---

## GENUINE SAMPLES (5) — must score ≥ 70

### G1 — IT fresher posting, official domain + careers link · Expected ~100
> We're hiring: Graduate Engineer Trainee (Java), Bengaluru. Responsibilities: build and test REST APIs with the platform team, code reviews, on-call rotation from month 3. Requirements: B.E./B.Tech 2025–26, Java + SQL basics, Git. Salary ₹4.8 LPA, PF, insurance. Apply on our careers page: www.techvista.in/careers or write to careers@techvista.in. Selection: aptitude test → technical interview → HR round.
- **Bonuses:** official-domain email (+10), careers link (+10), specific JD (+5). No deductions.

### G2 — BPO walk-in with full specifics · Expected ≥ 85
> Walk-in drive: Customer Support Associate (Hindi + English), Noida Sec-63 office. Salary ₹18,000–₹21,000/month + PF + ESI, rotational shifts, 6 days/week. Carry resume and original certificates for verification at the interview (no copies retained, no fee at any stage). Queries: hr@sunrisebpo.in. Drive dates: 24–26 Nov, 10am–2pm.
- **Bonuses:** official domain (+10), specific JD (+5). Explicit "no fee" line — engine must NOT trigger the fee signal on negated phrasing ("no fee at any stage"). *Known hard case: keep a negation guard in the fee regex; if it still trips, this sample documents the false positive honestly.*

### G3 — Delivery job, realistic pay, portal listing · Expected ≥ 80
> Delivery Partner — food delivery, Jaipur zone. Earnings ₹22,000–₹28,000/month including delivery incentives, weekly payout. Requirements: two-wheeler, driving licence, smartphone. Joining kit provided free by the company. Apply through the partner app or at the Jaipur hub office, Malviya Nagar. Support: partners@swiftmeals.in.
- **Bonuses:** official domain (+10), specific JD (+5). Pay inside baseline range → no salary flag. "Kit provided free" must not trip fee signal (same negation guard as G2).

### G4 — Startup content role via portal · Expected ≥ 75
> Content Writer (English), remote, 1–3 yrs experience. You'll write product blogs, help-centre articles and release notes for a fintech app. Must share 2 published samples. Salary ₹35,000–₹45,000/month, 5-day week. Apply via the listing on this portal; shortlisted candidates get a paid writing test (₹1,000, paid whether selected or not). Team: hiring@finlytics.co.
- **Bonuses:** official domain (+10), specific JD (+5). "Paid writing test" phrasing is a trap for naive fee detection — money flows TO the candidate; the fee signal must require payment demanded FROM the candidate.

### G5 — Retail store job, newspaper-style ad · Expected ≥ 75
> Required: Billing Assistant for electronics showroom, Lucknow. Timings 10:30am–8:30pm, weekly off Tuesday. Salary ₹14,000/month + Diwali bonus. Experience with billing software preferred; freshers may also apply. Walk in with resume between 12–5pm, or call the store landline 0522-410 2287. Address: Hazratganj main market.
- **Bonuses:** specific JD (+5). Landline + physical address are neutral-positive; no email/domain is fine for a local shop — engine must not over-punish "no presence" when a verifiable address + landline exist. *If signal 8 trips here, score is 85 — still passing; that's the accepted behaviour.*

---

## Scorer acceptance checklist
- [ ] S1–S8, S10–S18 in target band (S9 borderline: ≤ 45 acceptable)
- [ ] S17 ≤ 39 despite +15 of bonuses (hard cap works)
- [ ] S18 shows DB-match banner (hard flag works)
- [ ] G1–G5 all ≥ 70
- [ ] Every deduction in every result has its user-facing reason string attached
