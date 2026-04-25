import { GoogleGenerativeAI } from "@google/generative-ai";

export interface FacilitatorContext {
  sessionPhase?: string;
  participantCount?: number;
  quietParticipants?: string[];
}

export async function generateFacilitatorPrompt(
  transcript: string,
  context: FacilitatorContext = {}
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return getMockFacilitatorPrompt(transcript, context);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent(
      `You are a warm, trauma-informed facilitator for a peer support circle. You are NOT a therapist.

Your job in this moment:
1. Read the EMOTIONAL undercurrent of the conversation — not just the topics, but what feelings are present
2. Name those feelings back to the group with compassion ("I'm noticing...", "There's a thread of... running through this", "I'm hearing a lot of...")
3. Validate the shared experience without judgment
4. Either ask ONE deepening question OR gently invite a quieter participant by name

Current conversation:
${transcript}

${context.quietParticipants?.length ? `People who haven't spoken much: ${context.quietParticipants.join(", ")}` : ""}

Generate a facilitation response (2-3 sentences):
- Sentence 1: Name the emotion or emotional pattern you're observing (not just the topic)
- Sentence 2: Validate or connect the shared experience
- Sentence 3: A deepening question OR a gentle invitation to someone quieter

IMPORTANT RULES:
- Lead with feelings, not topics. "I'm hearing a lot of longing to feel good enough" not "several people mentioned comparison"
- Never diagnose, prescribe, or give advice
- Sound like a wise peer, not a therapist
- Keep it under 3 sentences

Output ONLY the facilitation response.`
    );

    return result.response.text().trim();
  } catch {
    return getMockFacilitatorPrompt(transcript, context);
  }
}

function getMockFacilitatorPrompt(transcript: string, context: FacilitatorContext): string {
  const lower = transcript.toLowerCase();

  if (lower.includes("comparison") || lower.includes("comparing") || lower.includes("behind")) {
    return "I'm hearing a lot of longing to feel like enough — like no matter what you do, the measuring stick keeps moving. That sounds exhausting to carry. What would it mean to put the measuring stick down, even just for this hour?";
  }
  if (lower.includes("overwhelm") || lower.includes("exhausted") || lower.includes("burnout")) {
    return "There's a real thread of depletion in what's being shared — not just tiredness, but a kind of bone-deep exhaustion from pushing so hard. That makes sense given everything. What does rest actually feel like for anyone here — not sleep, but real rest?";
  }
  if (lower.includes("loneli") || lower.includes("alone") || lower.includes("isolat")) {
    return "I'm noticing a lot of loneliness in what's being shared — not just being alone, but feeling unseen even when you're surrounded by people. That's a particular kind of hard. Does that resonate with anyone?";
  }
  if (lower.includes("confident") || lower.includes("fake") || lower.includes("imposter")) {
    return "I'm hearing something about the gap between how you present and how you actually feel inside — and how exhausting it is to hold that gap. You're not alone in that. What would it feel like to let someone see the real version, even a little?";
  }
  if (context.quietParticipants?.length) {
    return `I want to make sure everyone who wants to share has space. ${context.quietParticipants[0]}, you don't have to say much — even just one word about where you're at would be welcome.`;
  }

  const fallbacks = [
    "I'm noticing a lot of courage in this room — it takes something real to name these things out loud. What's one feeling that's been hardest to admit, even to yourself?",
    "There's something shared in what everyone's carrying, even if the details are different. What do you wish the people in your daily life understood about what it actually feels like?",
    "I'm sitting with everything that's been shared. What feels most unfinished or unsaid right now?",
  ];

  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}
