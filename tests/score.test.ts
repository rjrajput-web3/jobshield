import { describe, expect, it } from "vitest";
import seedData from "../data/scams.json";
import { SAMPLES } from "../data/samples";
import { scorePosting } from "../lib/score";
import type { ScamReport } from "../lib/types";

const reports = seedData as ScamReport[];

describe("JobShield scorer — SEED-SCAMS acceptance set (23 cases)", () => {
  for (const sample of SAMPLES) {
    it(`${sample.id} (${sample.label}) lands in band ${sample.min}–${sample.max}`, () => {
      const result = scorePosting(sample.text, reports);
      expect(
        result.score,
        `${sample.id} scored ${result.score}, hits: ${result.hits
          .map((h) => `${h.signalId}(${h.points})`)
          .join(", ")}`
      ).toBeGreaterThanOrEqual(sample.min);
      expect(result.score).toBeLessThanOrEqual(sample.max);

      if (sample.label === "scam") {
        expect(result.band).toBe("high-risk");
      } else {
        expect(result.band).toBe("likely-genuine");
      }

      if (sample.expectDbMatch) {
        expect(result.dbMatch, `${sample.id} should match the scam DB`).not.toBeNull();
        expect(result.hits[0]?.signalId).toBe("db-match");
      }
      for (const sig of sample.expectSignals ?? []) {
        expect(
          result.hits.some((h) => h.signalId === sig),
          `${sample.id} should trigger signal "${sig}", got: ${result.hits
            .map((h) => h.signalId)
            .join(", ")}`
        ).toBe(true);
      }
      for (const sig of sample.forbidSignals ?? []) {
        expect(
          result.hits.some((h) => h.signalId === sig),
          `${sample.id} must NOT trigger signal "${sig}"`
        ).toBe(false);
      }
    });
  }

  it("every hit in every result carries a user-facing reason", () => {
    for (const sample of SAMPLES) {
      const result = scorePosting(sample.text, reports);
      for (const hit of result.hits) {
        expect(hit.reason.length).toBeGreaterThan(10);
      }
    }
  });

  it("S17: a polished JD and official email cannot rescue an upfront fee (hard cap 39)", () => {
    const s17 = SAMPLES.find((s) => s.id === "S17")!;
    const result = scorePosting(s17.text, reports);
    const bonus = result.hits.filter((h) => h.points > 0).reduce((a, h) => a + h.points, 0);
    expect(bonus).toBeGreaterThanOrEqual(15); // +10 email, +5 JD
    expect(result.score).toBeLessThanOrEqual(39);
  });

  it("S18: repeat offender is caught by phone match even with mild wording", () => {
    const s18 = SAMPLES.find((s) => s.id === "S18")!;
    const result = scorePosting(s18.text, reports);
    expect(result.dbMatch?.companyName).toBe("QuickKart Services");
    expect(result.score).toBeLessThanOrEqual(39);
  });

  it("a made-up variant of S1 with the same phone still triggers the hard flag", () => {
    const variant =
      "Golden chance for students. Simple mobile work, weekly payment assured. Speak to our team on WhatsApp 98120 44517 for full details.";
    const result = scorePosting(variant, reports);
    expect(result.dbMatch).not.toBeNull();
    expect(result.score).toBeLessThanOrEqual(39);
  });

  it("empty-ish input does not crash and stays cautious", () => {
    const result = scorePosting("job available call now", reports);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });
});
