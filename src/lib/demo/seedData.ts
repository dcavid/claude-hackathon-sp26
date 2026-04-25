export const DEMO_THERAPIST = {
  id: "therapist",
  name: "Dr. Elena Park",
  initial: "EP",
  title: "Licensed therapist facilitator",
};

export const DEMO_PARTICIPANTS = [
  { id: "david", name: "David", initial: "D", color: "bg-blue-100 text-blue-700" },
  { id: "maya", name: "Maya", initial: "M", color: "bg-purple-100 text-purple-700" },
  { id: "jordan", name: "Jordan", initial: "J", color: "bg-amber-100 text-amber-700" },
  { id: "priya", name: "Priya", initial: "P", color: "bg-rose-100 text-rose-700" },
  { id: "alex", name: "Alex", initial: "A", color: "bg-teal-100 text-teal-700" },
];

export const DEMO_POD = {
  name: "Career Burnout Pod",
  memberCount: 5,
  meetingType: "Weekly therapist-led pod",
  nextSession: "Thursday, 7:30 PM ET",
  sharedThemes: ["burnout", "loneliness", "pressure to perform", "life transitions"],
  description:
    "A recurring small group for people navigating burnout, isolation, and identity shifts tied to work and life transitions.",
  chatDescription: "Private pod chat stays open between sessions for lighter check-ins and encouragement.",
};

export const DEMO_SUMMARY = {
  therapistReviewStatus: "Approved by Dr. Elena Park before member release",
  therapistReviewNote:
    "The member-facing recap was edited for clarity and safety before release. Clinical interpretation is reserved for the therapist session notes.",
  themes: ["Burnout", "Loneliness after work stress", "Difficulty asking for support", "Pressure to keep performing"],
  personalTakeaway:
    "You were more direct about exhaustion than in prior sessions, and you named the tension between wanting support and not wanting to burden other people.",
  groupSummary:
    "The group returned to a shared fear of looking functional on the outside while quietly feeling depleted. Several people connected around the habit of pushing through instead of asking for help sooner.",
  nextStep:
    "Before the next pod, notice one moment when you feel the urge to power through alone and write down what kind of support you actually wanted in that moment.",
  nextSession: "Thursday, May 1, 2026 at 7:30 PM ET",
  aiObservedPatterns: [
    "You are naming stress earlier instead of minimizing it.",
    "Work pressure still shows up as a major trigger for isolation.",
    "You engage most when the conversation turns toward practical boundaries.",
  ],
  participationTrend:
    "Mock trend: you spoke earlier in the session this week and stayed engaged through the full discussion.",
  journalPrompt:
    "What do you wish someone in your life understood about how burnout has changed the way you relate to other people?",
};

export const DEMO_PROGRESS_HISTORY = [
  {
    label: "3 sessions ago",
    title: "Holding back at the start",
    description: "You mostly listened and shared near the end after hearing similar stories from others.",
  },
  {
    label: "2 sessions ago",
    title: "More specific about stressors",
    description: "You began naming work pressure and loneliness as connected rather than separate problems.",
  },
  {
    label: "This session",
    title: "Earlier, clearer participation",
    description: "You shared sooner and asked for a more structured conversation about boundaries and exhaustion.",
  },
];

export const DEMO_JOURNAL_PROMPTS = [
  "What felt hardest to say out loud today?",
  "What kind of support did you want during the session that you did not ask for?",
  "What would feeling 10% more supported this week actually look like?",
];
