export interface ScamReport {
  id: string;
  companyName: string;
  companyKey: string;
  platform: "whatsapp" | "telegram" | "sms" | "email" | "portal" | "other";
  contact: string;
  contactType: "phone" | "telegram" | "email" | "upi" | "url";
  asksFor: string[];
  feeAmount?: string;
  description: string;
  reportedAt: string; // ISO date
  reportCount: number;
  source: "seed" | "community";
  verified: boolean;
}

export interface SignalHit {
  signalId: string;
  points: number; // negative deduction or positive bonus
  reason: string; // user-facing plain-English text
}

export interface CheckResult {
  score: number; // 0–100 after clamping and hard caps
  band: "high-risk" | "caution" | "likely-genuine";
  dbMatch: ScamReport | null;
  hits: SignalHit[]; // display order: hard flag, deductions by size, bonuses
  extracted: {
    phones: string[];
    upis: string[];
    emails: string[];
    domains: string[];
  };
}

export const BAND_LABEL: Record<CheckResult["band"], string> = {
  "high-risk": "High Risk",
  caution: "Be Careful",
  "likely-genuine": "Looks Genuine",
};

export const BAND_ACTION: Record<CheckResult["band"], string> = {
  "high-risk": "Do not pay any money and do not send your documents.",
  caution: "Verify the company on its official website before you reply.",
  "likely-genuine": "No scam signs found. Still, never pay any fee for a job.",
};

export const HONESTY_LINE =
  "JobShield checks common scam signs. A high score is not a guarantee — always verify the company yourself.";
