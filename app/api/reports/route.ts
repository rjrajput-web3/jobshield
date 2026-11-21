import { NextRequest, NextResponse } from "next/server";
import { addReport, getReports } from "@/lib/store";
import type { ScamReport } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(getReports());
}

const PLATFORMS = ["whatsapp", "telegram", "sms", "email", "portal", "other"] as const;

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const companyName = typeof b.companyName === "string" ? b.companyName.trim() : "";
  const contact = typeof b.contact === "string" ? b.contact.trim() : "";
  const description = typeof b.description === "string" ? b.description.trim() : "";
  const platform = PLATFORMS.includes(b.platform as (typeof PLATFORMS)[number])
    ? (b.platform as ScamReport["platform"])
    : "other";
  const asksFor = Array.isArray(b.asksFor)
    ? b.asksFor.filter((x): x is string => typeof x === "string").slice(0, 8)
    : [];

  if (companyName.length < 2) {
    return NextResponse.json({ error: "Please enter the company name." }, { status: 400 });
  }
  if (contact.length < 3) {
    return NextResponse.json(
      { error: "Please enter the phone number, handle or email they used." },
      { status: 400 }
    );
  }
  if (description.length < 20) {
    return NextResponse.json(
      { error: "Please describe what happened in at least a few words (20+ characters)." },
      { status: 400 }
    );
  }

  const report = addReport({ companyName, platform, contact, asksFor, description });
  return NextResponse.json(report, { status: 201 });
}
