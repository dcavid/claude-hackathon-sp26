import { NextRequest, NextResponse } from "next/server";

const DEFAULT_VOICE = "aura-2-thalia-en";

export async function POST(request: NextRequest) {
  try {
    const { text, voice } = await request.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    const apiKey = process.env.DEEPGRAM_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Deepgram API key is not configured" }, { status: 503 });
    }

    const res = await fetch(
      `https://api.deepgram.com/v1/speak?model=${encodeURIComponent(voice || DEFAULT_VOICE)}&encoding=mp3`,
      {
        method: "POST",
        headers: {
          Authorization: `Token ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      }
    );

    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      console.error("[speak] Deepgram API error:", res.status, errBody);
      return NextResponse.json({ error: "Speech generation failed" }, { status: 502 });
    }

    const audioBuffer = await res.arrayBuffer();
    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "Speech generation failed" }, { status: 500 });
  }
}
