import { GoogleGenerativeAI } from "@google/generative-ai";

export type RiskLevel = "low" | "medium" | "high";

export interface SafetyAnalysis {
  riskLevel: RiskLevel;
  interventionPrompt: string;
  supportResources: string[];
}

export async function analyzeSafety(message: string): Promise<SafetyAnalysis> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return getMockSafetyAnalysis(message);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are a safety monitor for a peer support circle. Analyze this message for emotional distress signals.

Message: "${message}"

Classify the risk level:
- "low": Normal emotional expression, frustration, sadness
- "medium": Significant distress, feeling overwhelmed, hopeless language
- "high": Crisis indicators, self-harm language, statements suggesting danger

Respond in JSON format only:
{
  "riskLevel": "low" | "medium" | "high",
  "interventionPrompt": "A warm, supportive 1-2 sentence response from Safety Copilot if needed (null for low risk)",
  "supportResources": ["Resource name if high risk, empty array otherwise"]
}

Important: Never be diagnostic. Be warm and human. Do not overreact to normal emotional expression.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch { /* fall through to mock */ }

  return getMockSafetyAnalysis(message);
}

function getMockSafetyAnalysis(message: string): SafetyAnalysis {
  const lower = message.toLowerCase();

  const highRiskKeywords = ["don't want to be here", "end it", "hurt myself", "self-harm", "suicide", "no point going on"];
  const mediumRiskKeywords = ["overwhelmed", "don't know what to do", "can't cope", "no way through", "hopeless", "pointless"];

  if (highRiskKeywords.some((k) => lower.includes(k))) {
    return {
      riskLevel: "high",
      interventionPrompt:
        "I'm really glad you shared that with us. You don't have to face this alone. If you're in immediate danger, please reach out to a crisis line — in the US, you can call or text 988. Would it be okay if we paused here together for a moment?",
      supportResources: ["988 Suicide & Crisis Lifeline (call or text 988)", "Crisis Text Line (text HOME to 741741)"],
    };
  }

  if (mediumRiskKeywords.some((k) => lower.includes(k))) {
    return {
      riskLevel: "medium",
      interventionPrompt:
        "I'm really glad you shared that. Would grounding support feel helpful right now? Sometimes naming what we're feeling in our body can help when things feel overwhelming.",
      supportResources: [],
    };
  }

  return {
    riskLevel: "low",
    interventionPrompt: "",
    supportResources: [],
  };
}
