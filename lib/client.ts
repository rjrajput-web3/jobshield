import seedData from "../data/scams.json";
import type { ScamReport } from "./types";

/** Client-side: load seed + community reports from the API, fall back to the bundled seed. */
export async function fetchReports(): Promise<ScamReport[]> {
  try {
    const res = await fetch("/api/reports", { cache: "no-store" });
    if (res.ok) return (await res.json()) as ScamReport[];
  } catch {
    // fall through to seed
  }
  return seedData as ScamReport[];
}
