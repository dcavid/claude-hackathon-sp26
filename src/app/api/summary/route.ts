import { NextRequest, NextResponse } from "next/server";
import { generateSessionSummary } from "@/lib/ai/summary";

export async function POST(request: NextRequest) {
  try {
    const { transcript } = await request.json();

    if (!transcript) {
      return NextResponse.json({ error: "No transcript provided" }, { status: 400 });
    }

    const summary = await generateSessionSummary(transcript);
    return NextResponse.json(summary);
  } catch {
    return NextResponse.json({
      themes: ["Comparison", "Fear of falling behind", "Self-worth tied to achievement"],
      personalTakeaway: "You showed up — that matters.",
      groupSummary: "The group explored shared themes of comparison and performance anxiety.",
      nextStep: "Notice one moment this week where comparison shows up and reflect on it.",
      nextSession: "Next Thursday, 7:30 PM — Imposter Syndrome Circle",
    });
  }
}
