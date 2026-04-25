import { GoogleGenerativeAI } from "@google/generative-ai";

export interface BotPersona {
  id: string;
  name: string;
  initial: string;
  background: string;
  struggles: string;
  style: string;
}

export const BOT_PERSONAS: BotPersona[] = [
  {
    id: "david",
    name: "David",
    initial: "D",
    background: "25, second-year CS grad student",
    struggles: "Constant comparison to peers, feeling like everyone else understands things faster, academic imposter syndrome",
    style: "Thoughtful and a bit intellectual. Deflects with humor sometimes but opens up when others share first. Honest once he feels safe.",
  },
  {
    id: "maya",
    name: "Maya",
    initial: "M",
    background: "22, pre-med senior undergrad",
    struggles: "Feeling behind classmates on LinkedIn, questioning if she belongs in medicine, tying self-worth to grades",
    style: "Open and emotionally available. Asks genuine follow-up questions. Connects quickly. Sometimes overshares but in an endearing way.",
  },
  {
    id: "jordan",
    name: "Jordan",
    initial: "J",
    background: "27, software engineer at a startup",
    struggles: "Performing confidence in a senior role they don't feel ready for, burnout from overcompensating, loneliness at work",
    style: "Brief and direct. Rarely says a lot but what they say lands. Deeply empathetic beneath the surface.",
  },
  {
    id: "priya",
    name: "Priya",
    initial: "P",
    background: "24, first-year medical resident",
    struggles: "Feeling invisible in high-pressure environments, difficulty asking for help, not wanting to be a burden",
    style: "Quiet and thoughtful. Almost always validates before sharing. Often says 'I relate to that' before opening up.",
  },
  {
    id: "alex",
    name: "Alex",
    initial: "A",
    background: "26, freelance creative (art + design)",
    struggles: "Comparing creative work to others, questioning self-worth outside productivity, navigating a non-linear life path",
    style: "Warm, reframing-oriented, sees things from different angles. Offers perspective without being preachy. Asks good questions.",
  },
];

export async function generateBotCheckin(
  persona: BotPersona,
  sessionTheme: string
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) return getMockCheckin(persona);

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent(
      `You are ${persona.name} checking in at the start of a peer support circle.

Background: ${persona.background}
What you struggle with: ${persona.struggles}
How you communicate: ${persona.style}
Session theme: ${sessionTheme || "general support and connection"}

Give a brief, honest check-in (1-2 sentences) about where you're at today.
Be genuine and a little vulnerable — this is a safe space. Draw from your actual struggles.
Write ONLY your check-in, nothing else.`
    );

    return result.response.text().trim();
  } catch {
    return getMockCheckin(persona);
  }
}

export async function generateBotResponse(
  persona: BotPersona,
  conversationHistory: Array<{ name: string; text: string }>,
  latestMessage: { name: string; text: string }
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) return getMockBotResponse(persona);

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const history = conversationHistory
      .slice(-10)
      .map((m) => `${m.name}: ${m.text}`)
      .join("\n");

    const result = await model.generateContent(
      `You are ${persona.name}, a real participant in a peer support circle — not a therapist or chatbot.

Background: ${persona.background}
What you struggle with: ${persona.struggles}
How you communicate: ${persona.style}

Recent conversation:
${history}

${latestMessage.name} just said: "${latestMessage.text}"

Respond as ${persona.name} in 1-3 sentences.
Rules:
- Do NOT give advice or try to fix things unless directly asked
- Respond with empathy: relate, validate, or ask ONE genuine question
- Draw from your own struggles when it fits naturally
- Be brief and human — not polished or therapeutic
- Never start with "I" twice in a row; vary your sentence structure

Write ONLY your response, nothing else.`
    );

    return result.response.text().trim();
  } catch {
    return getMockBotResponse(persona);
  }
}

function getMockCheckin(persona: BotPersona): string {
  const checkins: Record<string, string> = {
    david: "Honestly a bit scattered today — there's stuff I've been avoiding thinking about.",
    maya: "I'm okay, just tired. I've been comparing myself to classmates a lot this week and it's been loud.",
    jordan: "I'm here. It's been a heavy few days.",
    priya: "Grateful to be here. I mostly want to listen today, if that's okay.",
    alex: "I've been thinking a lot about what it actually means to be enough. Still figuring that out.",
  };
  return checkins[persona.id] || "Glad to be here today.";
}

function getMockBotResponse(persona: BotPersona): string {
  const pool: Record<string, string[]> = {
    david: [
      "That resonates — I've been somewhere similar lately and I'm still not sure what to do with it.",
      "Yeah, I know that feeling. It's like you're measuring yourself against some standard nobody actually agreed to.",
      "I appreciate you saying that. I don't always have the right words but I'm glad you shared it.",
    ],
    maya: [
      "Oh wow, I felt that. Can I ask — how long has this been building for you?",
      "I've been there. Honestly still am most days. You're not alone in this at all.",
      "Thank you for saying that out loud — I think a lot of us feel this but don't name it.",
    ],
    jordan: [
      "Yeah. That tracks.",
      "I get it. I've been carrying something similar.",
      "That's real. I don't have anything to add except — I hear you.",
    ],
    priya: [
      "I relate to that more than I'd like to admit.",
      "Thank you for being honest about that. It actually helps to hear I'm not the only one.",
      "I've been sitting with something like that too — I just haven't found the words for it yet.",
    ],
    alex: [
      "I wonder if part of it is that we only ever see each other's finished versions — never the messy middle.",
      "That makes a lot of sense. What does it feel like in your body when it hits?",
      "There's something worth sitting with there, I think. Not fixing — just sitting with.",
    ],
  };
  const responses = pool[persona.id] || ["I hear you.", "That makes sense.", "Thank you for sharing that."];
  return responses[Math.floor(Math.random() * responses.length)];
}
