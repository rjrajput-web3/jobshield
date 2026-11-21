"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import type { ScamReport } from "@/lib/types";

const PLATFORM_OPTIONS: { value: ScamReport["platform"]; label: string }[] = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "telegram", label: "Telegram" },
  { value: "sms", label: "SMS" },
  { value: "email", label: "Email" },
  { value: "portal", label: "Job portal / website" },
  { value: "other", label: "Other" },
];

const ASKS_FOR_OPTIONS = [
  "registration fee",
  "security deposit",
  "training fee",
  "kit / material charges",
  "documents",
  "recharge or deposit for tasks",
  "test package fee",
];

const inputCls =
  "w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-[15px] shadow-sm outline-none placeholder:text-stone-400 focus:border-brand-600 focus:ring-4 focus:ring-brand-600/15";

function ReportForm() {
  const params = useSearchParams();
  const [companyName, setCompanyName] = useState(params.get("company") ?? "");
  const [platform, setPlatform] = useState<ScamReport["platform"]>("whatsapp");
  const [contact, setContact] = useState(params.get("contact") ?? "");
  const [asksFor, setAsksFor] = useState<string[]>([]);
  const [otherAsk, setOtherAsk] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  function toggleAsk(item: string) {
    setAsksFor((prev) => (prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const finalAsks = [...asksFor, ...(otherAsk.trim() ? [otherAsk.trim()] : [])];
    setSubmitting(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName, platform, contact, asksFor: finalAsks, description }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setDone(true);
    } catch {
      setError("Could not submit. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="m4.5 12.5 5 5L19.5 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 className="mt-4 text-xl font-bold">Your report now protects the next applicant</h2>
        <p className="mx-auto mt-2 max-w-md text-[15px] leading-relaxed text-stone-600">
          It has been added to the scam database. Anyone who pastes a post from this company or
          contact will now see the warning.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2.5">
          <Link
            href="/scams"
            className="rounded-full bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-stone-700"
          >
            See it in the database
          </Link>
          <Link
            href="/"
            className="rounded-full border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-800 hover:border-stone-400"
          >
            Check another offer
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6" noValidate>
      <div className="space-y-4">
        <div>
          <label htmlFor="company" className="mb-1.5 block text-sm font-semibold">
            Company name (as shown in the post) *
          </label>
          <input
            id="company"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="e.g. QuickKart Services"
            className={inputCls}
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="platform" className="mb-1.5 block text-sm font-semibold">
              Where did you see it? *
            </label>
            <select
              id="platform"
              value={platform}
              onChange={(e) => setPlatform(e.target.value as ScamReport["platform"])}
              className={inputCls}
            >
              {PLATFORM_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="contact" className="mb-1.5 block text-sm font-semibold">
              Phone / handle / email they used *
            </label>
            <input
              id="contact"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="e.g. 98120 44517 or @handle"
              className={inputCls}
              required
            />
          </div>
        </div>

        <fieldset>
          <legend className="mb-1.5 text-sm font-semibold">What did they ask for?</legend>
          <div className="flex flex-wrap gap-2">
            {ASKS_FOR_OPTIONS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => toggleAsk(item)}
                aria-pressed={asksFor.includes(item)}
                className={`rounded-full border px-3 py-1.5 text-[13px] font-medium transition ${
                  asksFor.includes(item)
                    ? "border-red-300 bg-red-50 text-red-700"
                    : "border-stone-300 bg-white text-stone-600 hover:border-stone-400"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
          <input
            value={otherAsk}
            onChange={(e) => setOtherAsk(e.target.value)}
            placeholder="Anything else they asked for (optional)"
            className={`${inputCls} mt-2.5`}
          />
        </fieldset>

        <div>
          <label htmlFor="description" className="mb-1.5 block text-sm font-semibold">
            What happened? *
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="In a few lines: what the post promised, and what they asked you to do or pay."
            className={inputCls}
            required
          />
          <p className="mt-1 text-xs text-stone-400">
            {description.trim().length} characters (minimum 20). Do not share your own personal
            details here.
          </p>
        </div>

        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-brand-700 px-6 py-3 text-[15px] font-bold text-white transition hover:bg-brand-800 disabled:opacity-60 sm:w-auto"
        >
          {submitting ? "Submitting…" : "Submit report"}
        </button>
        <p className="text-[13px] text-stone-500">
          Reports are shown as community-reported and are not independently verified.
        </p>
      </div>
    </form>
  );
}

export default function ReportPage() {
  return (
    <div className="pt-8">
      <h1 className="text-3xl font-extrabold tracking-tight">Report a job scam</h1>
      <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-stone-600">
        Someone tried to charge you for a job, or asked for your documents before any interview?
        Report it here — it takes a minute, and it warns every job seeker who checks the same offer
        after you.
      </p>
      <div className="mt-6">
        <Suspense fallback={<p className="text-sm text-stone-500">Loading the form…</p>}>
          <ReportForm />
        </Suspense>
      </div>
    </div>
  );
}
