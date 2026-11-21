"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import seedData from "@/data/scams.json";
import { fetchReports } from "@/lib/client";
import type { ScamReport } from "@/lib/types";

const PLATFORM_STYLES: Record<ScamReport["platform"], string> = {
  whatsapp: "bg-green-100 text-green-800",
  telegram: "bg-sky-100 text-sky-800",
  sms: "bg-violet-100 text-violet-800",
  email: "bg-orange-100 text-orange-800",
  portal: "bg-indigo-100 text-indigo-800",
  other: "bg-stone-200 text-stone-700",
};

const PLATFORM_LABELS: Record<ScamReport["platform"], string> = {
  whatsapp: "WhatsApp",
  telegram: "Telegram",
  sms: "SMS",
  email: "Email",
  portal: "Portal",
  other: "Other",
};

function ReportCard({ report }: { report: ScamReport }) {
  return (
    <article className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-[16px] font-bold leading-tight">{report.companyName}</h3>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${PLATFORM_STYLES[report.platform]}`}
        >
          {PLATFORM_LABELS[report.platform]}
        </span>
        {report.source === "community" && (
          <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-800">
            New report
          </span>
        )}
        <span className="ml-auto text-xs text-stone-400">
          {new Date(report.reportedAt + "T00:00:00").toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-stone-600">{report.description}</p>
      <dl className="mt-3 space-y-1 text-sm">
        <div className="flex gap-2">
          <dt className="shrink-0 font-medium text-stone-500">Contact used:</dt>
          <dd className="break-all font-medium">{report.contact}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="shrink-0 font-medium text-stone-500">Reported by:</dt>
          <dd>
            {report.reportCount} {report.reportCount === 1 ? "person" : "people"}
          </dd>
        </div>
      </dl>
      {report.asksFor.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {report.asksFor.map((item) => (
            <span
              key={item}
              className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700"
            >
              Asks for: {item}
            </span>
          ))}
          {report.feeAmount && (
            <span className="rounded-full bg-red-600 px-2.5 py-1 text-xs font-bold text-white">
              {report.feeAmount}
            </span>
          )}
        </div>
      )}
    </article>
  );
}

export default function ScamsPage() {
  const [reports, setReports] = useState<ScamReport[]>(() => seedData as ScamReport[]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let live = true;
    fetchReports().then((r) => {
      if (live) setReports(r);
    });
    return () => {
      live = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return reports;
    return reports.filter((r) =>
      [r.companyName, r.contact, r.description, r.platform, ...r.asksFor]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [reports, query]);

  return (
    <div className="pt-8">
      <h1 className="text-3xl font-extrabold tracking-tight">Reported job scams</h1>
      <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-stone-600">
        Companies and contacts reported by job seekers. If a post you paste matches any of these,
        JobShield flags it instantly.
      </p>
      <p className="mt-3 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2.5 text-sm text-amber-800">
        These are community-reported and not independently verified. A listing here means other job
        seekers reported the same pattern — always do your own check too.
      </p>

      <label htmlFor="scam-search" className="sr-only">
        Search reported scams by company, phone or keyword
      </label>
      <input
        id="scam-search"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by company name, phone number, or keyword like “fee”…"
        className="mt-5 w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-[15px] shadow-sm outline-none placeholder:text-stone-400 focus:border-brand-600 focus:ring-4 focus:ring-brand-600/15"
      />

      <p className="mt-4 text-sm text-stone-500" aria-live="polite">
        {filtered.length} {filtered.length === 1 ? "report" : "reports"}
        {query.trim() && <> matching “{query.trim()}”</>}
      </p>

      <div className="mt-3 grid gap-3">
        {filtered.map((r) => (
          <ReportCard key={r.id} report={r} />
        ))}
        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-4 py-8 text-center">
            <p className="font-semibold">No reports match that search.</p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-stone-500">
              If this company asked you for money or documents, be the first to warn others.
            </p>
            <Link
              href="/report"
              className="mt-4 inline-block rounded-full bg-brand-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-800"
            >
              Report a scam
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
