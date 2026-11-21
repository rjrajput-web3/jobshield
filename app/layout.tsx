import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import Logo from "@/components/Logo";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "JobShield — Check if a job offer is real",
  description:
    "Free tool for job seekers: paste a job post or recruiter message and get a trust score with clear reasons. Checks fee demands, fake salaries, and a crowd-reported scam database.",
};

const NAV = [
  { href: "/", label: "Check an offer" },
  { href: "/scams", label: "Scam database" },
  { href: "/report", label: "Report a scam" },
  { href: "/about", label: "About" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-[#faf9f6]/90 backdrop-blur">
          <div className="mx-auto flex w-full max-w-3xl items-center gap-3 px-4 py-3">
            <Link href="/" className="flex items-center gap-2.5" aria-label="JobShield home">
              <Logo size={32} />
              <span className="text-lg font-extrabold tracking-tight">
                Job<span className="text-brand-700">Shield</span>
              </span>
            </Link>
            <nav className="ml-auto flex items-center gap-1 text-sm font-medium text-stone-600">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="hidden rounded-full px-3 py-1.5 transition hover:bg-stone-200/60 hover:text-stone-900 sm:block"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/report"
                className="rounded-full bg-brand-700 px-3.5 py-1.5 font-semibold text-white transition hover:bg-brand-800 sm:hidden"
              >
                Report
              </Link>
            </nav>
          </div>
          <nav className="flex justify-center gap-1 border-t border-stone-200/60 px-2 py-1.5 text-[13px] font-medium text-stone-600 sm:hidden">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className="rounded-full px-2.5 py-1">
                {item.label}
              </Link>
            ))}
          </nav>
        </header>

        <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-16">{children}</main>

        <footer className="border-t border-stone-200 bg-white/60">
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-2 px-4 py-6 text-[13px] text-stone-500 sm:flex-row sm:items-center">
            <p className="font-semibold text-stone-700">
              Never pay a fee for a job. Real companies never charge you to join.
            </p>
            <p className="sm:ml-auto">
              <Link href="/about" className="underline decoration-stone-300 underline-offset-2 hover:text-stone-800">
                How JobShield works
              </Link>{" "}
              · Scores are guidance, not a guarantee.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
