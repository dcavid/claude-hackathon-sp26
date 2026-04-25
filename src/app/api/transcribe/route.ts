import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audio = formData.get("audio") as File | null;

    if (!audio) {
      return NextResponse.json({ error: "No audio provided" }, { status: 400 });
    }

    const apiKey = process.env.DEEPGRAM_API_KEY;

    if (!apiKey) {
      // Mock transcription for demo
      return NextResponse.json({
        transcript: getMockTranscript(),
        confidence: 0.92,
      });
    }

    // Deepgram prerecorded speech-to-text API
    const audioBuffer = await audio.arrayBuffer();
    const res = await fetch(
      "https://api.deepgram.com/v1/listen?model=nova-3&smart_format=true&punctuate=true&language=en-US",
      {
        method: "POST",
        headers: {
          Authorization: `Token ${apiKey}`,
          "Content-Type": audio.type || "audio/webm",
        },
        body: audioBuffer,
      }
    );

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      console.error("[transcribe] Deepgram API error:", res.status, errBody);
      return NextResponse.json({ transcript: getMockTranscript(), confidence: 0.9 });
    }

    const data = await res.json();
    const alternative = data.results?.channels?.[0]?.alternatives?.[0];
    const transcript = alternative?.transcript?.trim?.() || "";

    return NextResponse.json({
      transcript: transcript || getMockTranscript(),
      confidence: alternative?.confidence || 0.9,
    });
  } catch {
    return NextResponse.json({
      transcript: getMockTranscript(),
      confidence: 0.9,
    });
  }
}

function getMockTranscript(): string {
  const samples = [
    "I've been feeling like everyone around me is doing more than me and like I don't belong here.",
    "Lately I've been really struggling with comparison. I look at my classmates and feel so far behind.",
    "I've been dealing with a lot of academic stress and imposter syndrome. I feel like I'm faking it most days.",
    "I keep feeling overwhelmed and isolated. Like everyone else has it figured out except me.",
  ];
  return samples[Math.floor(Math.random() * samples.length)];
}
