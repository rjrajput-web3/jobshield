import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="pt-8">
      <h1 className="text-3xl font-extrabold tracking-tight">About JobShield</h1>

      <div className="mt-5 space-y-5 text-[15px] leading-relaxed text-stone-700">
        <section className="rounded-2xl border border-stone-200 bg-white p-5">
          <h2 className="text-lg font-bold text-stone-900">What it is</h2>
          <p className="mt-1.5">
            JobShield is a free tool that checks job posts, offer letters and recruiter messages
            for the warning signs of a scam. Paste the text, and you get a trust score from 0 to
            100 with every reason written in plain, simple words — plus a check against a database
            of scams reported by other job seekers.
          </p>
        </section>

        <section className="rounded-2xl border border-stone-200 bg-white p-5">
          <h2 className="text-lg font-bold text-stone-900">How the score works</h2>
          <p className="mt-1.5">
            Every post starts at 100. Points are taken away for each warning sign: asking for a fee
            or deposit (−35), a match in the scam database (−40), payment to a personal UPI (−25),
            salary far above the market rate (−20), Telegram/WhatsApp-only contact (−20), documents
            demanded before an interview (−20), a free Gmail/Yahoo recruiter email (−15), pressure
            to decide immediately (−10), and more. Good signs add points back: an email on the
            company’s own domain, an official careers link, a complete job description. If a post
            asks for money up front, or matches a reported scam, the score can never go above 39 —
            no polish can hide a fee demand.
          </p>
        </section>

        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-lg font-bold text-amber-900">Honest limits</h2>
          <ul className="mt-1.5 list-disc space-y-1.5 pl-5 text-amber-900/90">
            <li>
              A score is guidance, not a guarantee. A high score means no common scam signs were
              found — always verify the company on its official website yourself.
            </li>
            <li>
              Scam database entries are community-reported and are not independently verified.
            </li>
            <li>
              Reports submitted here are stored for this demo session and may reset when the site
              is redeployed.
            </li>
          </ul>
        </section>

        <section className="rounded-2xl bg-brand-900 p-5 text-white">
          <h2 className="text-lg font-bold">The golden rule</h2>
          <p className="mt-1.5 text-brand-100">
            Never pay any fee for a job. No registration fee, no security deposit, no training fee,
            no kit charges. A real employer pays you — you never pay them.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block rounded-full bg-white px-4 py-2.5 text-sm font-bold text-brand-900 hover:bg-brand-50"
          >
            Check an offer now
          </Link>
        </section>
      </div>
    </div>
  );
}
