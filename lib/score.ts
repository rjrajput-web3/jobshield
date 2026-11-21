import { extractAll, extractSalaries } from "./extract";
import { findDbMatch, FREE_EMAIL_DOMAINS } from "./match";
import type { CheckResult, ScamReport, SignalHit } from "./types";

const REASONS = {
  fee: "This post asks you to pay money before joining. Real companies never charge a fee to give you a job.",
  dbMatch:
    "This company/contact has been reported as a scam by other job seekers. Do not engage.",
  personalUpi:
    "Payment is asked on a personal UPI/number, not a company account. This is a classic scam pattern.",
  salary:
    "The salary promised is far above the normal market rate for this kind of work. Scammers use big salaries to trap people.",
  messagingOnly:
    "The only way to contact them is Telegram/WhatsApp. Genuine companies use official email or their own website.",
  documents:
    "They ask for your Aadhaar/bank documents before any interview. Never share documents with an unverified recruiter.",
  freeEmail:
    "The recruiter uses a free Gmail/Yahoo email. Real company recruiters write from the company's own email domain.",
  noPresence:
    "No company website or official page is mentioned anywhere. A real company is easy to verify online.",
  mismatch:
    "The website/email domain does not match the company name they claim. Scammers often copy big brand names.",
  noInterview:
    "They promise selection with no interview. Real hiring always has some selection process.",
  urgency:
    "They pressure you to decide immediately. Scammers rush you so you don't get time to check.",
  vague:
    "The post says almost nothing about the actual work, skills needed, or office location. Real job posts are specific.",
  spammy: "The message looks like a mass-forwarded spam post, not a real company announcement.",
  officialEmail: "Good sign: the recruiter's email is on the company's own domain.",
  careersLink: "Good sign: the post links to an official careers page / known job portal.",
  specificJd: "Good sign: the post clearly describes the work, skills needed, and location.",
} as const;

/** Fee keywords that mean money is demanded FROM the candidate. */
const FEE_PATTERNS: RegExp[] = [
  /registration fee/i,
  /joining fee/i,
  /enrol(ment|ment) fee/i,
  /application fee/i,
  /training fee/i,
  /security deposit/i,
  /refundable deposit/i,
  /caution deposit/i,
  /material (kit )?(charges|deposit)/i,
  /kit charges/i,
  /test (package|fee)/i,
  /(fee|deposit|charges?)\s*(of\s*)?₹/i,
  /₹\s?[\d,]+\s*(fee|deposit|charges)/i,
  /pay(ing)?\s+(a\s+|the\s+)?(fee|₹)/i,
  /payment\s+of\s+₹/i,
  /purchase\s+our\s+test/i,
  /(uniform|id card|headset|laptop security|material)[^.\n]{0,40}₹/i,
];

/** Phrases that mean the money flows TO the candidate, or there is no fee at all. */
const FEE_NEGATION_RE =
  /\b(no fee|fee at any stage|no charges|charges for joining|provided free|free by the company|free kit|kit provided free|paid whether|paid to you|we (will )?pay|you (will |can )?receive|no payment|never pay|without any (fee|charge|payment)|zero fee)\b/i;

function hasUpfrontFee(text: string): boolean {
  for (const re of FEE_PATTERNS) {
    const m = re.exec(text);
    if (!m) continue;
    // Negation guard: look at a window around the match.
    const start = Math.max(0, m.index - 60);
    const end = Math.min(text.length, m.index + m[0].length + 60);
    const window = text.slice(start, end);
    if (FEE_NEGATION_RE.test(window)) {
      // A negated mention — only skip this match if the negation is close to it.
      const neg = FEE_NEGATION_RE.exec(window);
      if (neg && Math.abs(neg.index - (m.index - start)) < 45) continue;
    }
    return true;
  }
  return false;
}

type RoleKey = "unskilled" | "bpo" | "delivery" | "sales" | "it" | "unknown";

const ROLE_TOP: Record<RoleKey, number> = {
  unskilled: 18000,
  bpo: 22000,
  delivery: 30000,
  sales: 30000,
  it: 60000,
  unknown: 18000,
};

function detectRole(lower: string): RoleKey {
  if (/delivery (executive|partner|boy|rider|job)|food delivery/.test(lower)) return "delivery";
  if (/telecaller|bpo|voice process|call cent(re|er)|customer support|customer care/.test(lower))
    return "bpo";
  if (/software|developer|engineer|java|programmer|\bit\b/.test(lower)) return "it";
  if (/sales executive|sales role|field sales/.test(lower)) return "sales";
  if (
    /data entry|typing|form filling|packing|back office|clerk|receptionist|assistant|ground staff|billing/.test(
      lower
    )
  )
    return "unskilled";
  return "unknown";
}

function hasUnrealisticSalary(text: string): boolean {
  const lower = text.toLowerCase();
  const role = detectRole(lower);
  const top = ROLE_TOP[role];
  const figures = extractSalaries(text);

  for (const f of figures) {
    if (f.period === "day") {
      // Per-day bait for unskilled/unknown work: ₹1,500+/day is far above market.
      if (f.rawAmount >= 1500 && role !== "it") return true;
    }
    if (f.period === "month" || f.period === "unknown") {
      // Amounts with no stated period are read as monthly when they are large;
      // small unknown amounts are usually fees/deposits, not salary.
      if (f.period === "unknown" && f.amount < 27000) continue;
      if (role !== "unknown") {
        if (f.amount > 1.5 * top) return true;
      } else {
        // No matched role: flag only clearly extreme claims.
        const passMarker = /1[02]th pass|no experience|students? welcome|fresher/.test(lower);
        if (f.amount > 45000) return true;
        if (f.amount > 1.5 * top && passMarker) return true;
      }
    }
  }
  // "Earn lakhs from home, no experience" style claims.
  if (/earn(ing)?\s+(lakhs|₹?\s?\d+\s?lakhs)/.test(lower) && /no experience/.test(lower)) {
    return true;
  }
  return false;
}

const JD_MARKERS: { name: string; re: RegExp }[] = [
  { name: "responsibilities", re: /responsibilit|duties|you('| wi)ll (write|build|work|handle)/i },
  { name: "skills", re: /skills|requirements|must (share|have|know)|proficien/i },
  { name: "experience", re: /experience|freshers? (may|can) also apply|yrs? (of )?exp/i },
  { name: "location", re: /office|walk[- ]?in|address|remote|work from home|wfh|location|zone|hub|\b(bengaluru|bangalore|mumbai|delhi|pune|hyderabad|chennai|kolkata|noida|gurugram|gurgaon|jaipur|lucknow|ahmedabad|kochi|indore)\b/i },
  { name: "shift", re: /shift|timings|working hours|days\/week|day week|hours/i },
];

function jdMarkerCount(text: string): number {
  return JD_MARKERS.filter((m) => m.re.test(text)).length;
}

export function scorePosting(text: string, reports: ScamReport[]): CheckResult {
  const trimmed = text.trim();
  const lower = trimmed.toLowerCase();
  const extracted = extractAll(trimmed);
  const hits: SignalHit[] = [];
  const add = (signalId: string, points: number, reason: string) =>
    hits.push({ signalId, points, reason });

  const dbMatch = findDbMatch(trimmed, extracted, reports);

  const fee = hasUpfrontFee(trimmed);

  // 2 — Scam-database match (−40, hard cap, banner)
  if (dbMatch) add("db-match", -40, REASONS.dbMatch);

  // 1 — Upfront fee (−35, hard cap)
  if (fee) add("upfront-fee", -35, REASONS.fee);

  // 3 — Payment to a personal UPI / number (−25)
  const payToNumber =
    /(pay|payment|paid|transfer|deposit)[^.\n]{0,50}(number\s+)?[6-9]\d{4}\s?\d{5}/i.test(trimmed) ||
    /(on|to)\s+(number\s+)?[6-9]\d{4}\s?\d{5}\s?\((gpay|phonepe|paytm)/i.test(trimmed);
  if (extracted.upis.length > 0 && (fee || /pay|payment/i.test(trimmed))) {
    add("personal-upi", -25, REASONS.personalUpi);
  } else if (fee && payToNumber) {
    add("personal-upi", -25, REASONS.personalUpi);
  }

  // 4 — Unrealistic salary (−20)
  if (hasUnrealisticSalary(trimmed)) add("unrealistic-salary", -20, REASONS.salary);

  // Domains that count as a real company presence (free-email domains do not).
  const realDomains = extracted.domains.filter((d) => !FREE_EMAIL_DOMAINS.has(d));

  // 5 — Telegram/WhatsApp-only contact (−20)
  const hasMessaging =
    /whatsapp/i.test(trimmed) || /telegram/i.test(trimmed) || /t\.me\//i.test(trimmed);
  const officialEmail = extracted.emails.some(
    (e) => !FREE_EMAIL_DOMAINS.has(e.split("@")[1] ?? "")
  );
  const hasOfficialChannel =
    officialEmail || realDomains.length > 0 || /portal|indeed|naukri|linkedin/i.test(trimmed);
  if (hasMessaging && !hasOfficialChannel) add("messaging-only", -20, REASONS.messagingOnly);

  // 6 — Documents demanded up front (−20)
  const docMention =
    /aadhaar|pan card|passbook|passport|marksheet|bank (details|statement|cheque)/i.test(trimmed);
  const atInterview = /at the interview|for verification at|carry .{0,40}verification/i.test(trimmed);
  if (docMention && !atInterview) add("documents-upfront", -20, REASONS.documents);

  // 7 — Free-email recruiter (−15)
  const freeEmail = extracted.emails.some((e) => FREE_EMAIL_DOMAINS.has(e.split("@")[1] ?? ""));
  if (freeEmail) add("free-email", -15, REASONS.freeEmail);

  // 8 — No verifiable company presence (−15)
  const hasAddress = /address\s*:|main market|road,|nagar|sector[- ]?\d|sec[- ]?\d/i.test(trimmed);
  const hasPresence =
    realDomains.length > 0 ||
    officialEmail ||
    extracted.landlines.length > 0 ||
    hasAddress ||
    /apply through|partner app|portal listing|on this portal/i.test(trimmed);
  if (!hasPresence) add("no-presence", -15, REASONS.noPresence);

  // 9 — Company/domain mismatch (−15): claims a government identity but the domain is not official.
  const govClaim = /sarkari|government job|govt\.? job|government vacancy/i.test(trimmed);
  const officialGovDomain = realDomains.some((d) => /\.gov\.in$|\.nic\.in$/.test(d));
  if (govClaim && realDomains.length > 0 && !officialGovDomain) {
    add("domain-mismatch", -15, REASONS.mismatch);
  }

  // 10 — No interview / guaranteed selection (−15)
  if (
    /no interview|direct joining|direct selection|100%\s?selection|guaranteed (job|selection)/i.test(
      trimmed
    )
  ) {
    add("no-interview", -15, REASONS.noInterview);
  }

  // 11 — Urgency pressure (−10)
  if (
    /only \d+ (seats|positions|vacancies) left|apply (with)?in \d+ hours|offer (valid|expires) today|valid today only|last date (is )?today|within \d+ hours|limited batch|joining this week|urgent hiring|join fast|hurry/i.test(
      trimmed
    )
  ) {
    add("urgency", -10, REASONS.urgency);
  }

  // 12 — Vague job description (−10)
  const markers = jdMarkerCount(trimmed);
  if (trimmed.length < 400 && markers <= 1) add("vague-jd", -10, REASONS.vague);

  // 13 — Spammy formatting (−5)
  const emojiCount = (trimmed.match(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu) ?? []).length;
  const spammy =
    emojiCount >= 3 ||
    /💰/.test(trimmed) ||
    /forward(ed)?\s+(to|this)/i.test(trimmed) ||
    /share (with|to) (all )?(your )?(\d+ )?groups/i.test(trimmed) ||
    /100%\s?genuine/i.test(trimmed) ||
    /\bearn .{0,25}(daily|per day)/i.test(trimmed);
  if (spammy) add("spammy", -5, REASONS.spammy);

  // 14 — Official-domain email (+10)
  if (officialEmail) add("official-email", 10, REASONS.officialEmail);

  // 15 — Official careers / portal link (+10)
  const careersLink = /careers/i.test(trimmed) && realDomains.length > 0;
  const portalLink = /apply (via|through) (the )?(listing|portal|partner app)|on this portal/i.test(
    trimmed
  );
  if (careersLink || portalLink) add("careers-link", 10, REASONS.careersLink);

  // 16 — Specific, complete JD (+5)
  if (markers >= 3) add("specific-jd", 5, REASONS.specificJd);

  // Arithmetic, clamp, hard caps.
  let score = 100 + hits.reduce((sum, h) => sum + h.points, 0);
  score = Math.max(0, Math.min(100, score));
  if (fee || dbMatch) score = Math.min(score, 39);

  const band: CheckResult["band"] =
    score <= 39 ? "high-risk" : score <= 69 ? "caution" : "likely-genuine";

  // Display order: hard flag first, then deductions by size, then bonuses.
  const ordered = [...hits].sort((a, b) => {
    if (a.signalId === "db-match") return -1;
    if (b.signalId === "db-match") return 1;
    if (a.points < 0 && b.points < 0) return a.points - b.points;
    if (a.points < 0) return -1;
    if (b.points < 0) return 1;
    return b.points - a.points;
  });

  return {
    score,
    band,
    dbMatch,
    hits: ordered,
    extracted: {
      phones: extracted.phones,
      upis: extracted.upis,
      emails: extracted.emails,
      domains: extracted.domains,
    },
  };
}
