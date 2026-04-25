import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: NextRequest) {
  try {
    const { transcript, topics, preferences } = await request.json();

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(getMockMatch(transcript, topics));
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `Analyze this peer support onboarding reflection and extract matching data.

Reflection transcript: "${transcript || ""}"
Selected topics: ${JSON.stringify(topics || [])}
Support preferences: ${JSON.stringify(preferences || [])}

Return JSON:
{
  "themes": ["3-5 short theme phrases extracted from the reflection"],
  "supportStyle": "listening" | "advice" | "accountability" | "mixed",
  "podName": "A warm, specific pod name based on the themes",
  "matchScore": 0.85,
  "matchReason": "One sentence explaining why this pod fits"
}

Output ONLY the JSON object.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return NextResponse.json(JSON.parse(jsonMatch[0]));
    }

    return NextResponse.json(getMockMatch(transcript, topics));
  } catch {
    return NextResponse.json(getMockMatch("", []));
  }
}

function getMockMatch(transcript: string, topics: string[]) {
  const lower = (transcript || "").toLowerCase();
  const allTopics = [...(topics || []), ...(lower.includes("imposter") || lower.includes("comparison") ? ["Imposter Syndrome"] : [])];

  return {
    themes: allTopics.length > 0
      ? allTopics.slice(0, 4).map((t: string) => t.toLowerCase())
      : ["comparison", "academic pressure", "feeling behind", "self-worth"],
    supportStyle: "listening",
    podName: "Imposter Syndrome Circle",
    matchScore: 0.91,
    matchReason: "Multiple people in this circle share themes of comparison and feeling behind.",
  };
}
