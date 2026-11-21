"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { SAMPLES } from "@/data/samples";
import seedData from "@/data/scams.json";
import { fetchReports } from "@/lib/client";
import { scorePosting } from "@/lib/score";
import { BAND_ACTION, BAND_LABEL, HONESTY_LINE, type CheckResult, type ScamReport } from "@/lib/types";

const CHIP_IDS = ["S1", "S18", "G1"] as const;
const CHIP_LABELS: Record<(typeof CHIP_IDS)[number], string> = {
  S1: "Try a sample scam",
  S18: "Try a repeat offender",
  G1: "Try a genuine job post",
};

const BAND_STYLES: Record<CheckResult["band"], { ring: string; text: string; bg: string; pill: string }> = {
  "high-risk": {
    ring: "#dc2626",
    text: "text-red-700",
    bg: "bg-red-50 border-red-200",
    pill: "bg-red-600 text-white",
  },
  caution: {
    ring: "#d97706",
    text: "text-amber-700",
    bg: "bg-amber-50 border-amber-200",
    pill: "bg-amber-500 text-white",
  },
  "likely-genuine": {
    ring: "#059669",
    text: "text-emerald-700",
    bg: "bg-emerald-50 border-emerald-200",
    pill: "bg-emerald-600 text-white",
  },
};

function ScoreRing({ score, band }: { score: number; band: CheckResult["band"] }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const filled = (score / 100) * c;
  const color = BAND_STYLES[band].ring;
  return (
    <div className="relative h-32 w-32 shrink-0" role="img" aria-label={`Trust score ${score} out of 100`}>
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#e7e5e4" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${c}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-extrabold tabular-nums leading-none">{score}</span>
        <span className="mt-1 text-[11px] font-medium uppercase tracking-wide text-stone-500">
          out of 100
        </span>
      </div>
    </div>
  );
}

function ResultView({ result, onReset }: { result: CheckResult; onReset: () => void }) {
  const style = BAND_STYLES[result.band];
  const deductions = result.hits.filter((h) => h.points < 0);
  const bonuses = result.hits.filter((h) => h.points > 0);
  const totalDeducted = deductions.reduce((a, h) => a - h.points, 0);

  const reportHref = useMemo(() => {
    const params = new URLSearchParams();
    if (result.dbMatch) params.set("company", result.dbMatch.companyName);
    const contact =
      result.extracted.phones[0] ?? result.extracted.emails[0] ?? result.extracted.upis[0] ?? "";
    if (contact) params.set("contact", contact);
    const qs = params.toString();
    return qs ? `/report?${qs}` : "/report";
  }, [result]);

  return (
    <div className="mt-6" aria-live="polite">
      {result.dbMatch && (
        <div className="mb-4 rounded-2xl border-2 border-red-600 bg-red-600 px-4 py-3 text-white shadow-sm">
          <p className="flex items-center gap-2 text-base font-bold">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 3 2.5 20h19L12 3z" fill="#fff" opacity="0.95" />
              <path d="M12 10v4.5" stroke="#dc2626" strokeWidth="2.2" strokeLinecap="round" />
              <circle cx="12" cy="17.2" r="1.3" fill="#dc2626" />
            </svg>
            Reported scam — do not engage
          </p>
          <p className="mt-1 text-sm text-red-50">
            <strong>{result.dbMatch.companyName}</strong> (contact: {result.dbMatch.contact}) has
            been reported by {result.dbMatch.reportCount}{" "}
            {result.dbMatch.reportCount === 1 ? "job seeker" : "job seekers"}.
            {result.dbMatch.asksFor.length > 0 &&
              ` They ask for: ${result.dbMatch.asksFor.join(", ")}.`}
          </p>
        </div>
      )}

      <div className={`rounded-3xl border p-5 sm:p-6 ${style.bg}`}>
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:gap-7">
          <ScoreRing score={result.score} band={result.band} />
          <div className="text-center sm:text-left">
            <span
              className={`inline-block rounded-full px-3 py-1 text-sm font-bold ${style.pill}`}
            >
              {BAND_LABEL[result.band]}
            </span>
            <p className={`mt-3 text-lg font-semibold leading-snug ${style.text}`}>
              {BAND_ACTION[result.band]}
            </p>
            {totalDeducted > 0 && (
              <div className="mx-auto mt-4 max-w-xs sm:mx-0">
                <div className="flex h-2.5 overflow-hidden rounded-full bg-stone-200">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${result.score}%`, background: style.ring }}
                  />
                </div>
                <p className="mt-1.5 text-xs text-stone-500">
                  Score breakdown: started at 100, lost {totalDeducted} points to the warning
                  signs below.
                </p>
              </div>
            )}
          </div>
        </div>

        {result.hits.length > 0 ? (
          <ul className="mt-6 space-y-2.5">
            {deductions.map((hit) => (
              <li
                key={hit.signalId}
                className="flex items-start gap-3 rounded-xl bg-white/80 px-3.5 py-3 text-[15px] leading-snug shadow-sm"
              >
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-700">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                </span>
                <span className="flex-1">{hit.reason}</span>
                <span className="shrink-0 font-bold tabular-nums text-red-700">{hit.points}</span>
              </li>
            ))}
            {bonuses.map((hit) => (
              <li
                key={hit.signalId}
                className="flex items-start gap-3 rounded-xl bg-white/80 px-3.5 py-3 text-[15px] leading-snug shadow-sm"
              >
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="m4.5 12.5 5 5L19.5 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="flex-1">{hit.reason}</span>
                <span className="shrink-0 font-bold tabular-nums text-emerald-700">
                  +{hit.points}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-6 rounded-xl bg-white/80 px-3.5 py-3 text-[15px] shadow-sm">
            No warning signs were found in this text.
          </p>
        )}

        <p className="mt-5 text-[13px] leading-relaxed text-stone-500">{HONESTY_LINE}</p>

        <div className="mt-5 flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={onReset}
            className="rounded-full bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-700"
          >
            Check another offer
          </button>
          <Link
            href={reportHref}
            className="rounded-full border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-800 transition hover:border-stone-400"
          >
            Report this as a scam
          </Link>
          <Link
            href="/scams"
            className="rounded-full border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-800 transition hover:border-stone-400"
          >
            See reported scams
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Checker() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<CheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reports, setReports] = useState<ScamReport[]>(() => seedData as ScamReport[]);

  useEffect(() => {
    let live = true;
    fetchReports().then((r) => {
      if (live) setReports(r);
    });
    return () => {
      live = false;
    };
  }, []);

  const samples = useMemo(() => {
    const map = new Map(SAMPLES.map((s) => [s.id, s]));
    return CHIP_IDS.map((id) => ({ id, label: CHIP_LABELS[id], text: map.get(id)!.text }));
  }, []);

  function runCheck(value: string) {
    const trimmed = value.trim();
    if (trimmed.length < 30) {
      setError("Paste the full job post or message — more text gives a better check.");
      setResult(null);
      return;
    }
    setError(null);
    setResult(scorePosting(trimmed, reports));
  }

  return (
    <div>
      <label htmlFor="job-text" className="sr-only">
        Paste a job post, offer letter or recruiter message
      </label>
      <textarea
        id="job-text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={8}
        placeholder={
          "Paste the job post, offer letter or WhatsApp/Telegram message here…\n\nExample: “Data entry job, salary ₹45,000/month, registration fee ₹850, pay on UPI…”"
        }
        className="w-full resize-y rounded-2xl border border-stone-300 bg-white px-4 py-3.5 text-[15px] leading-relaxed shadow-sm outline-none transition placeholder:text-stone-400 focus:border-brand-600 focus:ring-4 focus:ring-brand-600/15"
      />
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => runCheck(text)}
          className="rounded-full bg-brand-700 px-6 py-3 text-[15px] font-bold text-white shadow-sm transition hover:bg-brand-800 active:scale-[0.98]"
        >
          Check this offer
        </button>
        {samples.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => {
              setText(s.text);
              runCheck(s.text);
            }}
            className="rounded-full border border-stone-300 bg-white px-3.5 py-2 text-[13px] font-medium text-stone-600 transition hover:border-brand-600 hover:text-brand-700"
          >
            {s.label}
          </button>
        ))}
      </div>
      {error && (
        <p className="mt-3 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2.5 text-sm text-amber-800">
          {error}
        </p>
      )}
      {result && <ResultView result={result} onReset={() => { setResult(null); setText(""); }} />}
    </div>
  );
}
