import { NextRequest, NextResponse } from "next/server";
import { BOT_PERSONAS, generateBotCheckin, generateBotResponse } from "@/lib/ai/bots";

export async function POST(request: NextRequest) {
  try {
    const { personaId, type, conversationHistory, latestMessage, sessionTheme } =
      await request.json();

    const persona = BOT_PERSONAS.find((p) => p.id === personaId);
    if (!persona) {
      return NextResponse.json({ error: "Unknown persona" }, { status: 400 });
    }

    if (type === "checkin") {
      const response = await generateBotCheckin(persona, sessionTheme || "");
      return NextResponse.json({ response });
    }

    if (type === "response") {
      if (!latestMessage) {
        return NextResponse.json({ error: "latestMessage required" }, { status: 400 });
      }
      const response = await generateBotResponse(
        persona,
        conversationHistory || [],
        latestMessage
      );
      return NextResponse.json({ response });
    }

    return NextResponse.json({ error: "type must be checkin or response" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
