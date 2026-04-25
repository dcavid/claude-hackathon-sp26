import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

type PodOption = {
  id: string;
  name: string;
  description: string;
  sharedThemes: string[];
  memberCount: number;
  meetingType: string;
  nextSession: string;
  chatDescription: string;
  fitReason: string;
  fitScore: number;
};

type MatchResponse = {
  themes: string[];
  supportStyle: "listening" | "advice" | "accountability" | "mixed";
  recommendedPod: PodOption;
  podOptions: PodOption[];
};

export async function POST(request: NextRequest) {
  try {
    const {
      transcript,
      lifeChallenge,
      topics,
      preferences,
      privacyPreference,
      preferredGroupSize,
      rolePreference,
      communicationStyle,
    } = await request.json();

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(getMockMatch(transcript, topics));
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `Analyze this peer support onboarding reflection for a therapist-led support pod demo.

Reflection transcript: "${transcript || ""}"
Primary life challenge: ${lifeChallenge || ""}
Selected topics: ${JSON.stringify(topics || [])}
Support preferences: ${JSON.stringify(preferences || [])}
Privacy preference: ${privacyPreference || ""}
Preferred group size: ${preferredGroupSize || ""}
Role preference: ${rolePreference || ""}
Communication style: ${JSON.stringify(communicationStyle || [])}

Return JSON:
{
  "themes": ["3-5 short theme phrases extracted from the reflection"],
  "supportStyle": "listening" | "advice" | "accountability" | "mixed",
  "recommendedPod": {
    "id": "string-slug",
    "name": "A warm, specific pod name based on the user's actual context",
    "description": "One sentence describing who this pod is for",
    "sharedThemes": ["3-4 specific themes"],
    "memberCount": 5,
    "meetingType": "Weekly therapist-led pod",
    "nextSession": "Thursday, 7:30 PM ET",
    "chatDescription": "One sentence about the private pod chat between sessions",
    "fitReason": "One sentence explaining why this pod is the strongest fit",
    "fitScore": 0.92
  },
  "podOptions": [
    {
      "id": "string-slug",
      "name": "Option 1 pod name",
      "description": "One sentence",
      "sharedThemes": ["3-4 specific themes"],
      "memberCount": 5,
      "meetingType": "Weekly therapist-led pod",
      "nextSession": "Thursday, 7:30 PM ET",
      "chatDescription": "One sentence",
      "fitReason": "Why it fits",
      "fitScore": 0.92
    },
    {
      "id": "string-slug",
      "name": "Option 2 pod name",
      "description": "One sentence",
      "sharedThemes": ["3-4 specific themes"],
      "memberCount": 5,
      "meetingType": "Weekly therapist-led pod",
      "nextSession": "Wednesday, 6:00 PM ET",
      "chatDescription": "One sentence",
      "fitReason": "Why it fits",
      "fitScore": 0.87
    },
    {
      "id": "string-slug",
      "name": "Option 3 pod name",
      "description": "One sentence",
      "sharedThemes": ["3-4 specific themes"],
      "memberCount": 4,
      "meetingType": "Weekly therapist-led pod",
      "nextSession": "Monday, 8:00 PM ET",
      "chatDescription": "One sentence",
      "fitReason": "Why it fits",
      "fitScore": 0.82
    }
  ]
}

Rules:
- Make pod names specific to the user context. Example: pet loss should not map to burnout.
- If the user mentions grief, loss, trauma, caregiving, or relationship rupture, reflect that directly in at least one pod title.
- The recommended pod must also appear inside podOptions.
- Return exactly 3 podOptions.

Output ONLY the JSON object.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return NextResponse.json(normalizeMatchResponse(JSON.parse(jsonMatch[0])));
    }

    return NextResponse.json(getMockMatch(transcript, topics));
  } catch {
    return NextResponse.json(getMockMatch("", []));
  }
}

function normalizeMatchResponse(input: Partial<MatchResponse>): MatchResponse {
  const fallback = getMockMatch("", []);
  const podOptions = Array.isArray(input.podOptions) && input.podOptions.length > 0
    ? input.podOptions.map(normalizePod)
    : fallback.podOptions;

  const recommended = input.recommendedPod
    ? normalizePod(input.recommendedPod)
    : podOptions[0] || fallback.recommendedPod;

  const recommendedPod = podOptions.find((pod) => pod.id === recommended.id) || recommended;

  return {
    themes: Array.isArray(input.themes) && input.themes.length > 0 ? input.themes.slice(0, 5) : fallback.themes,
    supportStyle: input.supportStyle || fallback.supportStyle,
    recommendedPod,
    podOptions,
  };
}

function normalizePod(input: Partial<PodOption>): PodOption {
  return {
    id: input.id || slugify(input.name || "recommended-pod"),
    name: input.name || "Support Pod",
    description: input.description || "A small therapist-led pod matched to the member's current challenges.",
    sharedThemes: Array.isArray(input.sharedThemes) && input.sharedThemes.length > 0
      ? input.sharedThemes.slice(0, 4)
      : ["support", "processing emotions", "weekly care"],
    memberCount: typeof input.memberCount === "number" ? input.memberCount : 5,
    meetingType: input.meetingType || "Weekly therapist-led pod",
    nextSession: input.nextSession || "Thursday, 7:30 PM ET",
    chatDescription: input.chatDescription || "Private pod chat stays open between sessions for check-ins and support.",
    fitReason: input.fitReason || "Strong overlap with the member's intake reflection and selected topics.",
    fitScore: typeof input.fitScore === "number" ? input.fitScore : 0.85,
  };
}

function getMockMatch(transcript: string, topics: string[]): MatchResponse {
  const lower = (transcript || "").toLowerCase();
  const explicitTopics = (topics || []).filter(Boolean);
  const derivedThemes = inferThemes(lower, explicitTopics);
  const supportStyle = explicitTopics.includes("peer-support") ? "mixed" : "listening";
  const podOptions = buildMockPods(lower, derivedThemes);

  return {
    themes: derivedThemes,
    supportStyle,
    recommendedPod: podOptions[0],
    podOptions,
  };
}

function inferThemes(lower: string, topics: string[]): string[] {
  if (lower.includes("dog") || lower.includes("pet") || lower.includes("puppy")) {
    return ["pet loss grief", "bereavement", "daily routine disruption", "coping with a dog's death"];
  }
  if (lower.includes("mom") || lower.includes("dad") || lower.includes("parent")) {
    return ["grief", "family loss", "bereavement", "identity after loss"];
  }
  if (lower.includes("burnout") || lower.includes("work") || lower.includes("job")) {
    return ["burnout", "work stress", "pressure to perform", "loneliness"];
  }
  if (lower.includes("relationship") || lower.includes("breakup")) {
    return ["relationship grief", "rupture", "loneliness", "moving forward"];
  }

  return topics.length > 0
    ? topics.slice(0, 4).map((topic) => topic.toLowerCase())
    : ["burnout", "loneliness", "life transitions", "support"];
}

function buildMockPods(lower: string, themes: string[]): PodOption[] {
  if (lower.includes("dog") || lower.includes("pet") || lower.includes("puppy")) {
    return [
      createPod(
        "Pet Loss and Grief Pod",
        "A therapist-led pod for people grieving the loss of a dog, cat, or other deeply bonded companion animal.",
        ["pet loss grief", "bereavement", "coping with a dog's death", "routine disruption"],
        "You described grief tied to your dog's death, so this pod is the most emotionally aligned match.",
        0.96,
        "Tuesday, 6:30 PM ET"
      ),
      createPod(
        "Grief and Bereavement Pod",
        "A broader grief pod for members processing recent loss and the emotional disorientation that follows.",
        ["grief", "bereavement", "sadness waves", "life after loss"],
        "This option fits if you want a wider grief-focused group rather than a pet-loss-specific pod.",
        0.89,
        "Thursday, 7:30 PM ET"
      ),
      createPod(
        "Loneliness After Loss Pod",
        "A pod for people whose loss has changed daily routines, connection, and their sense of home.",
        ["loneliness", "after loss", "identity shifts", "rebuilding routines"],
        "This is a relevant alternative if the strongest issue is isolation after the loss rather than grief language itself.",
        0.82,
        "Sunday, 5:00 PM ET"
      ),
    ];
  }

  if (lower.includes("grief") || lower.includes("loss")) {
    return [
      createPod(
        "Grief and Bereavement Pod",
        "A therapist-led pod for people processing meaningful loss and the uneven emotional reality that follows.",
        ["grief", "bereavement", "waves of sadness", "adjusting after loss"],
        "Your intake is centered on grief, so this is the clearest fit.",
        0.94,
        "Thursday, 7:30 PM ET"
      ),
      createPod(
        "Life After Loss Pod",
        "A pod focused on rebuilding routines, relationships, and self-understanding after a major loss.",
        ["identity after loss", "daily routine disruption", "loneliness", "re-entry"],
        "A strong alternative if the practical aftermath of loss feels most central.",
        0.86,
        "Wednesday, 6:00 PM ET"
      ),
      createPod(
        "Support Through Transition Pod",
        "A mixed pod for members navigating loss alongside broader life transitions and isolation.",
        ["life transitions", "grief", "support needs", "coping skills"],
        "Useful if several topics overlap and you want a slightly broader group.",
        0.8,
        "Monday, 8:00 PM ET"
      ),
    ];
  }

  if (lower.includes("burnout") || lower.includes("work") || lower.includes("job")) {
    return [
      createPod(
        "Career Burnout Pod",
        "A recurring small group for people navigating burnout, isolation, and identity shifts tied to work and life transitions.",
        ["burnout", "work stress", "pressure to perform", "life transitions"],
        "This pod is the closest fit for work-linked exhaustion and pressure.",
        0.92,
        "Thursday, 7:30 PM ET"
      ),
      createPod(
        "Overfunctioning and Exhaustion Pod",
        "A pod for people who keep performing on the outside while feeling depleted underneath.",
        ["overfunctioning", "exhaustion", "self-worth", "boundaries"],
        "A strong alternative if the emotional cost of holding everything together feels central.",
        0.86,
        "Tuesday, 8:00 PM ET"
      ),
      createPod(
        "Burnout and Loneliness Pod",
        "A therapist-led pod for people whose stress is entangled with isolation and disconnection.",
        ["burnout", "loneliness", "disconnection", "coping"],
        "A useful alternative when loneliness is as prominent as the burnout itself.",
        0.83,
        "Sunday, 5:00 PM ET"
      ),
    ];
  }

  const baseThemes = themes.slice(0, 4);
  return [
    createPod(
      "Shared Experience Support Pod",
      "A therapist-led pod built around the strongest overlap in your intake reflection and selected topics.",
      baseThemes,
      "This is the best overall fit across your current topics.",
      0.88,
      "Thursday, 7:30 PM ET"
    ),
    createPod(
      "Life Transitions Support Pod",
      "A broader pod for members navigating change, uncertainty, and emotional strain at the same time.",
      dedupeThemes([...baseThemes, "life transitions"]),
      "A good alternative if your needs cut across multiple categories.",
      0.81,
      "Wednesday, 6:00 PM ET"
    ),
    createPod(
      "Peer Support and Processing Pod",
      "A pod for members looking for steady weekly structure and a private between-session support chat.",
      dedupeThemes([...baseThemes, "peer support"]),
      "A relevant option if ongoing connection is as important as the session topic itself.",
      0.78,
      "Monday, 8:00 PM ET"
    ),
  ];
}

function createPod(
  name: string,
  description: string,
  sharedThemes: string[],
  fitReason: string,
  fitScore: number,
  nextSession: string
): PodOption {
  return {
    id: slugify(name),
    name,
    description,
    sharedThemes: dedupeThemes(sharedThemes),
    memberCount: 5,
    meetingType: "Weekly therapist-led pod",
    nextSession,
    chatDescription: "Private pod chat stays open between sessions for lighter check-ins and encouragement.",
    fitReason,
    fitScore,
  };
}

function dedupeThemes(themes: string[]) {
  return Array.from(new Set(themes)).slice(0, 4);
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
