import type { ScamReport } from "./types";

export interface Extracted {
  /** Normalised 10-digit Indian mobile numbers */
  phones: string[];
  /** Landline numbers (kept separate — never used for scam matching) */
  landlines: string[];
  /** UPI ids, lowercased, e.g. "rahul.pay@okhdfc" */
  upis: string[];
  /** Email addresses, lowercased */
  emails: string[];
  /** Domains from URLs, bare domains and email addresses, lowercased, no "www." */
  domains: string[];
  /** Telegram-style handles, lowercased, e.g. "@typingwork_india" */
  handles: string[];
}

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const UPI_RE = /[a-zA-Z0-9._-]{2,}@[a-zA-Z]{2,}/g;
const URL_RE = /(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+\.[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})(?:\/[^\s]*)?/g;
const HANDLE_RE = /@[a-zA-Z0-9_]{4,}/g;

export function extractPhones(text: string): { mobiles: string[]; landlines: string[] } {
  const mobiles = new Set<string>();
  const landlines = new Set<string>();

  // Landlines first (STD code style, e.g. 0522-410 2287) so they are not read as mobiles.
  const landlineRe = /\b0\d{2,4}[\s-]\d{5,8}\b/g;
  let m: RegExpExecArray | null;
  while ((m = landlineRe.exec(text)) !== null) {
    landlines.add(m[0].replace(/[\s-]/g, ""));
  }

  // Indian mobiles, optionally with +91, with or without a space after 5 digits.
  const mobileRe = /(?:\+91[\s-]?)?([6-9]\d{4})[\s-]?(\d{5})\b/g;
  while ((m = mobileRe.exec(text)) !== null) {
    mobiles.add(m[1] + m[2]);
  }
  // Compact 10-digit form.
  const compactRe = /\b([6-9]\d{9})\b/g;
  while ((m = compactRe.exec(text)) !== null) {
    mobiles.add(m[1]);
  }

  return { mobiles: [...mobiles], landlines: [...landlines] };
}

export function extractEmails(text: string): string[] {
  return [...new Set((text.match(EMAIL_RE) ?? []).map((e) => e.toLowerCase()))];
}

/** Remove email addresses so their parts are not misread as UPIs, handles or domains. */
function stripEmails(text: string, emails: string[]): string {
  let out = text;
  for (const e of emails) {
    out = out.split(e).join(" ").split(e.toUpperCase()).join(" ");
  }
  return out.replace(EMAIL_RE, " ");
}

export function extractUpis(text: string, emails: string[]): string[] {
  const clean = stripEmails(text, emails);
  const found = clean.match(UPI_RE) ?? [];
  return [
    ...new Set(
      found
        .map((u) => u.toLowerCase())
        .filter((u) => !u.includes(".com") && !u.includes(".in") && !u.includes(".co"))
    ),
  ];
}

export function extractDomains(text: string, emails: string[]): string[] {
  const domains = new Set<string>();
  const clean = stripEmails(text, emails);
  let m: RegExpExecArray | null;
  const re = new RegExp(URL_RE.source, "g");
  while ((m = re.exec(clean)) !== null) {
    const d = m[1].toLowerCase().replace(/^www\./, "");
    domains.add(d);
  }
  for (const email of emails) {
    const d = email.split("@")[1];
    if (d) domains.add(d);
  }
  return [...domains];
}

export function extractHandles(text: string, emails: string[] = []): string[] {
  const clean = stripEmails(text, emails);
  return [...new Set((clean.match(HANDLE_RE) ?? []).map((h) => h.toLowerCase()))];
}

export function extractAll(text: string): Extracted {
  const { mobiles, landlines } = extractPhones(text);
  const emails = extractEmails(text);
  const upis = extractUpis(text, emails);
  const domains = extractDomains(text, emails);
  const handles = extractHandles(text, emails);
  return { phones: mobiles, landlines, upis, emails, domains, handles };
}

export interface SalaryFigure {
  amount: number; // monthly-equivalent INR when period is month/lpa; raw figure otherwise
  rawAmount: number;
  period: "month" | "day" | "piece" | "unknown";
}

/** Parse salary figures: ₹X/month, ₹X per day, ₹X–₹Y ranges, X LPA, "monthly ₹X". */
export function extractSalaries(text: string): SalaryFigure[] {
  const figures: SalaryFigure[] = [];
  const lower = text.toLowerCase();

  // LPA figures: "₹4.8 LPA" / "4.8 LPA"
  const lpaRe = /(?:₹\s?)?([\d]+(?:\.\d+)?)\s?lpa/g;
  let m: RegExpExecArray | null;
  while ((m = lpaRe.exec(lower)) !== null) {
    const monthly = (parseFloat(m[1]) * 100000) / 12;
    figures.push({ amount: monthly, rawAmount: monthly, period: "month" });
  }

  // ₹ amounts, optionally a range, optionally followed by a period word.
  const amtRe =
    /₹\s?([\d,]*\d|\d)(?:\s?[–—-]\s?₹?\s?([\d,]*\d|\d))?\s?(per month|\/month|monthly|per day|\/day|daily|per article|per form|per piece)?/g;
  while ((m = amtRe.exec(text)) !== null) {
    const a1 = parseInt(m[1].replace(/,/g, ""), 10);
    const a2 = m[2] ? parseInt(m[2].replace(/,/g, ""), 10) : a1;
    const raw = Math.max(a1, a2);
    const periodWord = (m[3] ?? "").toLowerCase();
    let period: SalaryFigure["period"] = "unknown";
    if (periodWord.includes("month")) period = "month";
    else if (periodWord.includes("day") || periodWord.includes("daily")) period = "day";
    else if (periodWord) period = "piece";
    figures.push({ amount: raw, rawAmount: raw, period });
  }

  // Period word before the amount: "monthly ₹35,000", "daily 100 forms = ₹6,000/day" is caught above.
  const beforeRe = /(monthly|per month|daily|per day)\s+(?:₹\s?)?([\d,]+)/g;
  while ((m = beforeRe.exec(lower)) !== null) {
    const raw = parseInt(m[2].replace(/,/g, ""), 10);
    const period = m[1].includes("day") ? "day" : "month";
    if (!figures.some((f) => f.rawAmount === raw && f.period === period)) {
      figures.push({ amount: raw, rawAmount: raw, period });
    }
  }

  return figures;
}

/** Normalise a company name for matching: lowercase, alphanumerics only. */
export function companyKeyOf(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/** Normalise arbitrary pasted text the same way, for substring matching. */
export function normaliseText(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export type { ScamReport };
