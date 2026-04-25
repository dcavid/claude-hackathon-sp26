import { GoogleGenerativeAI } from "@google/generative-ai";

export interface SessionSummary {
  themes: string[];
  personalTakeaway: string;
  groupSummary: string;
  nextStep: string;
  nextSession: string;
}

export async function generateSessionSummary(transcript: string): Promise<SessionSummary> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return getMockSummary(transcript);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are a compassionate AI summarizing a peer support circle session.

Transcript:
${transcript}

Generate a session summary in JSON format:
{
  "themes": ["3-4 key emotional themes from the conversation, as short phrases"],
  "personalTakeaway": "A warm, affirming 1-2 sentence personal reflection for the user who participated",
  "groupSummary": "2-3 sentences summarizing what the group explored and any insights that emerged",
  "nextStep": "One concrete, gentle suggested action for the week ahead — specific and doable",
  "nextSession": "Next Thursday, 7:30 PM — Imposter Syndrome Circle"
}

Tone: warm, human, non-clinical. Focus on growth and connection, not problems.
Output ONLY the JSON object.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch { /* fall through to mock */ }

  return getMockSummary(transcript);
}

function getMockSummary(transcript: string): SessionSummary {
  const lower = transcript.toLowerCase();

  const themes = [];
  if (lower.includes("comparison") || lower.includes("comparing")) themes.push("Comparison");
  if (lower.includes("behind") || lower.includes("falling behind")) themes.push("Fear of falling behind");
  if (lower.includes("worth") || lower.includes("achievement") || lower.includes("accomplish")) themes.push("Self-worth tied to achievement");
  if (lower.includes("confident") || lower.includes("imposter") || lower.includes("fake")) themes.push("Social performance");
  if (themes.length === 0) themes.push("Emotional processing", "Peer connection", "Shared experience");

  return {
    themes,
    personalTakeaway:
      "You showed up and shared honestly — that takes courage. The vulnerability you brought to the circle today is exactly what makes this space real.",
    groupSummary:
      "The group found common ground in the invisible weight of comparison and performance anxiety. Several members noted the gap between how they present and how they actually feel. Alex offered a reframe that resonated: other people's highlights aren't the full picture.",
    nextStep:
      "Notice one moment this week where comparison shows up. Pause and reflect: whose standard are you measuring against, and is it actually yours?",
    nextSession: "Next Thursday, 7:30 PM — Imposter Syndrome Circle",
  };
}
