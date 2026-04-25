import { NextRequest, NextResponse } from "next/server";
import { analyzeSafety } from "@/lib/ai/safety";

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json({ error: "No message provided" }, { status: 400 });
    }

    const analysis = await analyzeSafety(message);

    return NextResponse.json({
      riskLevel: analysis.riskLevel,
      response: analysis.interventionPrompt,
      resources: analysis.supportResources,
    });
  } catch {
    return NextResponse.json({
      riskLevel: "low",
      response: "",
      resources: [],
    });
  }
}
