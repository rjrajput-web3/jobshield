import Link from "next/link";
import Checker from "@/components/Checker";
import seedData from "@/data/scams.json";

const seedCount = (seedData as unknown[]).length;

const STEPS = [
  {
    title: "1. Paste the offer",
    body: "Copy any job post, offer letter or recruiter message — WhatsApp, Telegram, email or a job portal.",
  },
  {
    title: "2. See the trust score",
    body: "JobShield checks 16 warning signs — fee demands, unreal salaries, document demands — and shows every reason in plain words.",
  },
  {
    title: "3. Stay safe, help others",
    body: "If it is a scam, report it in one tap. The next person who pastes the same offer gets warned instantly.",
  },
];

export default function HomePage() {
  return (
    <div>
      <section className="pb-2 pt-8 sm:pt-12">
        <p className="inline-flex items-center gap-2 rounded-full border border-brand-600/25 bg-brand-50 px-3 py-1 text-[13px] font-semibold text-brand-800">
          <span className="h-2 w-2 rounded-full bg-brand-600" />
          Free · No sign-up · Works on any phone
        </p>
        <h1 className="mt-4 text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl">
          Check if a job offer is <span className="text-brand-700">real</span> — in 10 seconds.
        </h1>
        <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-stone-600">
          Fake recruiters charge lakhs of freshers a “registration fee” every year. Paste the offer
          here first. JobShield gives it a trust score, shows exactly why, and checks it against{" "}
          {seedCount}+ crowd-reported scams.
        </p>
      </section>

      <section className="mt-6 rounded-3xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
        <Checker />
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-bold tracking-tight">How it works</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {STEPS.map((step) => (
            <div key={step.title} className="rounded-2xl border border-stone-200 bg-white p-4">
              <h3 className="font-bold">{step.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-stone-600">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-3xl bg-brand-900 px-5 py-6 text-white sm:px-7">
        <h2 className="text-lg font-bold">The one rule that stops almost every job scam</h2>
        <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-brand-100">
          A real company will never ask you to pay money to get a job — no registration fee, no
          security deposit, no kit charges. If a post asks for money first, walk away, and{" "}
          <Link href="/report" className="font-semibold text-white underline underline-offset-2">
            report it here
          </Link>{" "}
          so the next job seeker is warned.
        </p>
        <Link
          href="/scams"
          className="mt-4 inline-block rounded-full bg-white px-4 py-2.5 text-sm font-bold text-brand-900 transition hover:bg-brand-50"
        >
          Browse the scam database
        </Link>
      </section>
    </div>
  );
}
