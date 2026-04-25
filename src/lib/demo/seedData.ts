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

export const DEMO_ACTIVE_GROUPS = [
  {
    id: "pet-loss-pod",
    name: "Pet Loss and Grief Pod",
    subgroup: "Grief and bereavement",
    memberCount: 5,
    nextSession: "Tuesday, 6:30 PM ET",
    chatPreview: "Several members are talking about how routines change after losing a pet.",
  },
  {
    id: "life-after-loss",
    name: "Life After Loss Pod",
    subgroup: "Identity after loss",
    memberCount: 4,
    nextSession: "Thursday, 7:30 PM ET",
    chatPreview: "A quieter group focused on rebuilding rhythm, home life, and connection.",
  },
  {
    id: "helpers-circle",
    name: "Helpers and Caregivers Pod",
    subgroup: "Supporters and overfunctioners",
    memberCount: 6,
    nextSession: "Sunday, 5:00 PM ET",
    chatPreview: "Members are reflecting on what happens when they always take care of everyone else first.",
  },
];

export const DEMO_GROUP_CHAT = [
  {
    id: "m1",
    author: "Maya",
    role: "member",
    text: "I kept expecting to hear my dog at the door today. That part caught me off guard.",
    time: "2:14 PM",
  },
  {
    id: "m2",
    author: "Priya",
    role: "member",
    text: "That makes sense. The routine pieces have been some of the hardest parts for me too.",
    time: "2:16 PM",
  },
  {
    id: "m3",
    author: "Dr. Elena Park",
    role: "therapist",
    text: "If it helps, bring one small moment like that into Tuesday's session. We can start there.",
    time: "2:20 PM",
  },
];

export const DEMO_UPCOMING_SESSIONS = [
  {
    id: "u1",
    dateTime: "Tuesday, April 28 at 6:30 PM ET",
    groupName: "Pet Loss and Grief Pod",
    therapistName: "Dr. Elena Park",
    promptPlaceholder: "What would you like to talk about today?",
  },
  {
    id: "u2",
    dateTime: "Thursday, May 1 at 7:30 PM ET",
    groupName: "Life After Loss Pod",
    therapistName: "Dr. Elena Park",
    promptPlaceholder: "What feels most present for you going into this session?",
  },
];

export const DEMO_HISTORY = [
  {
    id: "h1",
    sessionDate: "April 21, 2026",
    groupName: "Pet Loss and Grief Pod",
    mainTopics: ["Routines after loss", "Guilt", "Unexpected grief triggers"],
    emotionalTone: "Tender, heavy, connected",
    keyTakeaways: "Members felt less alone after naming how grief shows up in small, daily moments.",
    personalReflection: "You shared a memory tied to your dog’s morning routine and stayed present through the group response.",
  },
  {
    id: "h2",
    sessionDate: "April 14, 2026",
    groupName: "Life After Loss Pod",
    mainTopics: ["Loneliness", "Home feeling different", "Social withdrawal"],
    emotionalTone: "Reflective, gentle, validating",
    keyTakeaways: "The group connected around how grief changes identity and ordinary spaces.",
    personalReflection: "You were quieter early on but became more specific once another member described losing structure at home.",
  },
];

export const DEMO_INSIGHTS = {
  recurringThemes: [
    "Grief shows up most strongly in routines and quiet transitions",
    "You often minimize your own pain until someone else names something similar",
    "Isolation tends to spike in the evenings",
  ],
  emotionalTrends: [
    { label: "Three sessions ago", value: "Guarded and hesitant" },
    { label: "Two sessions ago", value: "More open, but still cautious" },
    { label: "This session", value: "More direct and emotionally specific" },
  ],
  participationChanges: [
    "You have started speaking earlier in the session instead of waiting until the end.",
    "You now respond to other members more often, not just to the therapist prompt.",
  ],
  behavioralShifts: [
    "You are naming grief triggers closer to when they happen.",
    "You are more willing to talk about support needs instead of only describing coping alone.",
  ],
  headline: "You’ve become more comfortable sharing over the past 3 sessions.",
};

export const DEMO_PROFILE = {
  role: "Both support seeker and helper",
  communicationPreference: "Listening, reflection, and gentle advice",
  privacyPreference: "Display first name only in pod chat",
  preferredGroupSize: "4-6 people",
  topicsOfInterest: ["Grief", "Loneliness", "Life transitions"],
  notifications: ["Session reminders", "Chat mentions", "Recap availability"],
};
