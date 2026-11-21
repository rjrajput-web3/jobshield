import seedData from "../data/scams.json";
import { companyKeyOf } from "./extract";
import type { ScamReport } from "./types";

/**
 * Demo persistence: an in-memory store (seed + session reports) kept on
 * globalThis so it survives hot reloads. Reports reset on redeploy/cold
 * start — acceptable for the demo; swap for a free-tier Postgres/KV later
 * (the ScamReport schema is already shaped for it).
 */
interface Store {
  reports: ScamReport[];
  counter: number;
}

const g = globalThis as unknown as { __jobshieldStore?: Store };

export function getStore(): Store {
  if (!g.__jobshieldStore) {
    g.__jobshieldStore = {
      reports: [...(seedData as ScamReport[])],
      counter: 100,
    };
  }
  return g.__jobshieldStore;
}

export function getReports(): ScamReport[] {
  return getStore().reports;
}

export interface NewReportInput {
  companyName: string;
  platform: ScamReport["platform"];
  contact: string;
  asksFor: string[];
  description: string;
}

export function addReport(input: NewReportInput): ScamReport {
  const store = getStore();
  const companyKey = companyKeyOf(input.companyName);
  const contactLower = input.contact.trim().toLowerCase();

  const existing = store.reports.find(
    (r) => r.companyKey === companyKey && r.contact.trim().toLowerCase() === contactLower
  );
  if (existing) {
    existing.reportCount += 1;
    return existing;
  }

  store.counter += 1;
  const contactType: ScamReport["contactType"] = contactLower.startsWith("@")
    ? "telegram"
    : contactLower.includes("@")
      ? "email"
      : /^[\d\s+-]+$/.test(contactLower)
        ? "phone"
        : contactLower.includes(".")
          ? "url"
          : "phone";

  const report: ScamReport = {
    id: `${companyKey || "report"}-${store.counter}`,
    companyName: input.companyName.trim(),
    companyKey,
    platform: input.platform,
    contact: input.contact.trim(),
    contactType,
    asksFor: input.asksFor,
    description: input.description.trim(),
    reportedAt: new Date().toISOString().slice(0, 10),
    reportCount: 1,
    source: "community",
    verified: false,
  };
  store.reports.unshift(report);
  return report;
}
