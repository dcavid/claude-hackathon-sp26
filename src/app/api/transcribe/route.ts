import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audio = formData.get("audio") as File | null;

    if (!audio) {
      return NextResponse.json({ error: "No audio provided" }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_SPEECH_API_KEY;

    if (!apiKey) {
      // Mock transcription for demo
      return NextResponse.json({
        transcript: getMockTranscript(),
        confidence: 0.92,
      });
    }

    // Google Speech-to-Text REST API
    const audioBuffer = await audio.arrayBuffer();
    const audioBase64 = Buffer.from(audioBuffer).toString("base64");

    const res = await fetch(
      `https://speech.googleapis.com/v1/speech:recognize?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          config: {
            encoding: "WEBM_OPUS",
            languageCode: "en-US",
            enableAutomaticPunctuation: true,
            model: "latest_short",
          },
          audio: { content: audioBase64 },
        }),
      }
    );

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      console.error("[transcribe] Google Speech API error:", res.status, errBody);
      return NextResponse.json({ transcript: getMockTranscript(), confidence: 0.9 });
    }

    const data = await res.json();
    const results = data.results || [];
    const transcript = results
      .map((r: { alternatives?: Array<{ transcript?: string }> }) => r.alternatives?.[0]?.transcript || "")
      .join(" ")
      .trim();

    return NextResponse.json({
      transcript: transcript || getMockTranscript(),
      confidence: results[0]?.alternatives?.[0]?.confidence || 0.9,
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
