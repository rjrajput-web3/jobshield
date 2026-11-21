import { companyKeyOf, normaliseText, type Extracted } from "./extract";
import type { ScamReport } from "./types";

const FREE_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "yahoo.com",
  "yahoo.in",
  "outlook.com",
  "hotmail.com",
  "rediffmail.com",
  "live.com",
  "proton.me",
  "protonmail.com",
]);

/** Domains a report can be matched on (its URL contact, or a non-free email domain). */
function reportDomains(report: ScamReport): string[] {
  const out: string[] = [];
  if (report.contactType === "url") out.push(report.contact.toLowerCase().replace(/^www\./, ""));
  if (report.contactType === "email") {
    const d = report.contact.split("@")[1]?.toLowerCase();
    if (d && !FREE_EMAIL_DOMAINS.has(d)) out.push(d);
  }
  return out;
}

function reportPhoneDigits(report: ScamReport): string | null {
  if (report.contactType !== "phone") return null;
  const digits = report.contact.replace(/\D/g, "");
  return digits.length >= 10 ? digits.slice(-10) : null;
}

/**
 * Match pasted text against the scam database.
 * Any one of: company name, phone, UPI, Telegram handle, domain → match.
 */
export function findDbMatch(
  text: string,
  extracted: Extracted,
  reports: ScamReport[]
): ScamReport | null {
  const textKey = normaliseText(text);
  const phoneSet = new Set(extracted.phones);
  const upiSet = new Set(extracted.upis.map((u) => u.toLowerCase()));
  const handleSet = new Set(extracted.handles.map((h) => h.toLowerCase()));
  const domainSet = new Set(extracted.domains.map((d) => d.toLowerCase()));

  for (const report of reports) {
    // Company name appears in the pasted text.
    if (report.companyKey && report.companyKey.length >= 5 && textKey.includes(report.companyKey)) {
      return report;
    }
    // Phone number match.
    const digits = reportPhoneDigits(report);
    if (digits && phoneSet.has(digits)) return report;
    // UPI match.
    if (report.contactType === "upi" && upiSet.has(report.contact.toLowerCase())) return report;
    // Telegram handle match.
    if (report.contactType === "telegram" && handleSet.has(report.contact.toLowerCase())) {
      return report;
    }
    // Email contact match.
    if (
      report.contactType === "email" &&
      extracted.emails.includes(report.contact.toLowerCase())
    ) {
      return report;
    }
    // Domain match (never on free-email domains).
    for (const d of reportDomains(report)) {
      if (domainSet.has(d)) return report;
    }
  }
  return null;
}

export { companyKeyOf, FREE_EMAIL_DOMAINS };
