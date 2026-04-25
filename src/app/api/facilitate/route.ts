import { NextRequest, NextResponse } from "next/server";
import { generateFacilitatorPrompt } from "@/lib/ai/facilitator";

export async function POST(request: NextRequest) {
  try {
    const { transcript, sessionPhase, quietParticipants, participantCount } = await request.json();

    if (!transcript) {
      return NextResponse.json({ error: "No transcript provided" }, { status: 400 });
    }

    const prompt = await generateFacilitatorPrompt(transcript, {
      sessionPhase,
      quietParticipants,
      participantCount,
    });

    return NextResponse.json({ prompt });
  } catch {
    return NextResponse.json({
      prompt: "Several people mentioned comparison and feeling behind. Would the group like to focus there today?",
    });
  }
}
