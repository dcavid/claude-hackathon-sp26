"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowRight, BookOpen, Bot, Brain, Calendar, Check, ChevronRight, Clock, Heart, Home,
  LineChart, Lock, MessageCircle, NotebookPen, Settings2, Sparkles, UserRound, Users,
} from "lucide-react";
import {
  DEMO_ACTIVE_GROUPS,
  DEMO_GROUP_CHAT,
  DEMO_HISTORY,
  DEMO_INSIGHTS,
  DEMO_JOURNAL_PROMPTS,
  DEMO_POD,
  DEMO_PROFILE,
  DEMO_THERAPIST,
} from "@/lib/demo/seedData";

type TabId = "groups" | "upcoming" | "history" | "insights" | "journal" | "profile";

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

type ProfileState = {
  lifeChallenge: string;
  topics: string[];
  supportPreferences: string[];
  privacyPreference: string;
  preferredGroupSize: string;
  rolePreference: string;
  communicationStyle: string[];
};

type ChatMessage = {
  id: string;
  author: string;
  role: string;
  text: string;
  time: string;
};

const NAV_ITEMS: Array<{ id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: "groups", label: "Groups", icon: Home },
  { id: "upcoming", label: "Upcoming", icon: Calendar },
  { id: "history", label: "History", icon: BookOpen },
  { id: "insights", label: "Insights", icon: Brain },
  { id: "journal", label: "Journal", icon: NotebookPen },
  { id: "profile", label: "Profile", icon: UserRound },
];

const JOURNAL_KEY = "resonance_private_journal";

export default function SessionPage() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<TabId>("groups");
  const [selectedGroupId, setSelectedGroupId] = useState<string>(() => {
    if (typeof window === "undefined") return "pet-loss-pod";
    try {
      const stored = window.sessionStorage.getItem("resonance_selected_pod");
      return stored ? (JSON.parse(stored) as PodOption).id : "pet-loss-pod";
    } catch {
      return "pet-loss-pod";
    }
  });
  const [journalEntry, setJournalEntry] = useState(() => {
    if (typeof window === "undefined") return "";
    return window.sessionStorage.getItem(JOURNAL_KEY) || "";
  });
  const [journalSaved, setJournalSaved] = useState(false);
  const [aiReflection, setAiReflection] = useState("");
  const [sessionPrompts, setSessionPrompts] = useState<Record<string, string>>({});
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(DEMO_GROUP_CHAT);
  const [chatInput, setChatInput] = useState("");

  const selectedPod = useMemo<PodOption>(() => {
    if (typeof window === "undefined") {
      return {
        id: "career-burnout-pod",
        name: DEMO_POD.name,
        description: DEMO_POD.description,
        sharedThemes: DEMO_POD.sharedThemes,
        memberCount: DEMO_POD.memberCount,
        meetingType: DEMO_POD.meetingType,
        nextSession: DEMO_POD.nextSession,
        chatDescription: DEMO_POD.chatDescription,
        fitReason: "",
        fitScore: 0.82,
      };
    }

    try {
      const stored = window.sessionStorage.getItem("resonance_selected_pod");
      if (!stored) throw new Error("missing");
      return JSON.parse(stored) as PodOption;
    } catch {
      return {
        id: "career-burnout-pod",
        name: DEMO_POD.name,
        description: DEMO_POD.description,
        sharedThemes: DEMO_POD.sharedThemes,
        memberCount: DEMO_POD.memberCount,
        meetingType: DEMO_POD.meetingType,
        nextSession: DEMO_POD.nextSession,
        chatDescription: DEMO_POD.chatDescription,
        fitReason: "",
        fitScore: 0.82,
      };
    }
  }, []);

  const onboardingProfile = useMemo<ProfileState>(() => {
    if (typeof window === "undefined") {
      return {
        lifeChallenge: "Grief",
        topics: DEMO_PROFILE.topicsOfInterest,
        supportPreferences: ["Structured support", "Support between sessions"],
        privacyPreference: DEMO_PROFILE.privacyPreference,
        preferredGroupSize: DEMO_PROFILE.preferredGroupSize,
        rolePreference: DEMO_PROFILE.role,
        communicationStyle: ["Listening", "Reflection"],
      };
    }

    try {
      const stored = window.sessionStorage.getItem("resonance_onboarding_profile");
      if (!stored) throw new Error("missing");
      return JSON.parse(stored) as ProfileState;
    } catch {
      return {
        lifeChallenge: "Grief",
        topics: DEMO_PROFILE.topicsOfInterest,
        supportPreferences: ["Structured support", "Support between sessions"],
        privacyPreference: DEMO_PROFILE.privacyPreference,
        preferredGroupSize: DEMO_PROFILE.preferredGroupSize,
        rolePreference: DEMO_PROFILE.role,
        communicationStyle: ["Listening", "Reflection"],
      };
    }
  }, []);

  const activeGroups = useMemo(() => {
    const selectedGroup = {
      id: selectedPod.id,
      name: selectedPod.name,
      subgroup: onboardingProfile.lifeChallenge,
      memberCount: selectedPod.memberCount,
      nextSession: selectedPod.nextSession,
      chatPreview: selectedPod.chatDescription,
    };

    const others = DEMO_ACTIVE_GROUPS.filter((group) => group.id !== selectedGroup.id);
    return [selectedGroup, ...others];
  }, [onboardingProfile.lifeChallenge, selectedPod]);

  const selectedGroup = activeGroups.find((group) => group.id === selectedGroupId) || activeGroups[0];

  const saveJournal = () => {
    window.sessionStorage.setItem(JOURNAL_KEY, journalEntry);
    setJournalSaved(true);
    window.setTimeout(() => setJournalSaved(false), 1600);
  };

  const generateAiReflection = () => {
    setAiReflection(
      "AI reflection: there is a strong pattern of grief surfacing through ordinary routines, and you seem more willing to name the emotional weight directly than you were earlier in the demo."
    );
  };

  const sendChatMessage = () => {
    if (!chatInput.trim()) return;
    const nextMessage: ChatMessage = {
      id: `${Date.now()}`,
      author: "You",
      role: "member",
      text: chatInput.trim(),
      time: "Just now",
    };
    setChatMessages((prev) => [...prev, nextMessage]);
    setChatInput("");
  };

  const renderGroups = () => (
    <div className="space-y-5">
      <Card className="rounded-3xl border border-border/70 bg-white/85 shadow-[0_20px_70px_-35px_rgba(90,67,45,0.28)]">
        <CardContent className="p-6 md:p-7">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <Badge variant="secondary" className="mb-3 text-xs">Home</Badge>
              <h2 className="text-3xl font-bold text-foreground mb-2">Your active support groups</h2>
              <p className="text-muted-foreground max-w-2xl">
                Small peer-support spaces stay active between therapist-led sessions so support does not disappear after the call ends.
              </p>
            </div>
            <Button className="gap-2 rounded-2xl">
              <Users className="w-4 h-4" />
              Join New Group
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {activeGroups.map((group) => (
          <Card key={group.id} className={`rounded-3xl border shadow-[0_18px_60px_-35px_rgba(90,67,45,0.24)] ${selectedGroup.id === group.id ? "border-primary/40 bg-primary/5" : "border-border/70 bg-white/85"}`}>
            <CardContent className="p-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    {selectedGroup.id === group.id && <Badge variant="secondary" className="text-xs">Current group</Badge>}
                    <Badge variant="outline" className="text-xs">{group.subgroup}</Badge>
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">{group.name}</h3>
                  <p className="text-sm text-muted-foreground max-w-xl">{group.chatPreview}</p>
                </div>
                <div className="grid grid-cols-3 gap-3 min-w-full lg:min-w-[300px] lg:max-w-[340px]">
                  <MiniStat label="Members" value={`${group.memberCount}`} icon={<Users className="w-4 h-4" />} />
                  <MiniStat label="Subtype" value={group.subgroup} icon={<Sparkles className="w-4 h-4" />} />
                  <MiniStat label="Next" value={group.nextSession} icon={<Clock className="w-4 h-4" />} />
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mt-5">
                <Button
                  variant="outline"
                  className="gap-2 rounded-2xl"
                  onClick={() => {
                    setSelectedGroupId(group.id);
                    router.push(`/groups/${group.id}`);
                  }}
                >
                  <MessageCircle className="w-4 h-4" />
                  Open Group Chat
                </Button>
                <Button variant="ghost" className="gap-2 rounded-2xl" onClick={() => setSelectedGroupId(group.id)}>
                  <ChevronRight className="w-4 h-4" />
                  View Group Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="rounded-3xl border border-border/70 bg-white/90 shadow-[0_18px_60px_-35px_rgba(90,67,45,0.24)]">
        <CardContent className="p-6 md:p-7">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Between sessions</p>
              <h3 className="text-xl font-semibold text-foreground mt-1">{selectedGroup.name} chat</h3>
            </div>
            <Badge variant="secondary" className="text-xs">Therapist supported</Badge>
          </div>

          <div className="space-y-3 mb-4">
            {chatMessages.map((message) => (
              <div key={message.id} className={`rounded-2xl border p-4 ${message.author === "You" ? "bg-primary text-primary-foreground border-primary/10 ml-8" : "bg-card border-border/70 mr-8"}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium">{message.author}</span>
                  <span className={`text-[11px] ${message.author === "You" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{message.time}</span>
                </div>
                <p className="text-sm leading-relaxed">{message.text}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <Textarea
              value={chatInput}
              onChange={(event) => setChatInput(event.target.value)}
              placeholder="Share a thought with your group between sessions..."
              className="min-h-[88px] rounded-2xl bg-background/70"
            />
            <Button className="self-end rounded-2xl" onClick={sendChatMessage}>
              Send
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderUpcoming = () => {
    const sessions = [
      {
        id: "next-main",
        dateTime: selectedPod.nextSession,
        groupName: selectedPod.name,
        therapistName: DEMO_THERAPIST.name,
        promptPlaceholder: "What would you like to talk about today?",
      },
      ...DEMO_ACTIVE_GROUPS.slice(0, 1).map((group) => ({
        id: group.id,
        dateTime: group.nextSession,
        groupName: group.name,
        therapistName: DEMO_THERAPIST.name,
        promptPlaceholder: "What feels most present for you going into this session?",
      })),
    ];

    if (sessions.length === 0) {
      return (
        <Card className="rounded-3xl border border-dashed border-border/80 bg-white/85">
          <CardContent className="p-10 text-center">
            <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No sessions scheduled</h3>
            <p className="text-sm text-muted-foreground">When a therapist-led session is scheduled, it will appear here with a pre-session prompt.</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        {sessions.map((session) => (
          <Card key={session.id} className="rounded-3xl border border-border/70 bg-white/90 shadow-[0_18px_60px_-35px_rgba(90,67,45,0.24)]">
            <CardContent className="p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <Badge variant="secondary" className="mb-3 text-xs">Upcoming session</Badge>
                  <h3 className="text-2xl font-bold text-foreground mb-2">{session.groupName}</h3>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>{session.dateTime}</p>
                    <p>Facilitator: {session.therapistName}</p>
                  </div>
                </div>
                <Button className="gap-2 rounded-2xl" onClick={() => router.push(`/call/${session.id}`)}>
                  <Calendar className="w-4 h-4" />
                  Join Call
                </Button>
              </div>

              <div className="mt-5 rounded-2xl border border-border/70 bg-muted/30 p-4">
                <p className="text-sm font-medium text-foreground mb-2">What would you like to talk about today?</p>
                <Textarea
                  value={sessionPrompts[session.id] || ""}
                  onChange={(event) => setSessionPrompts((prev) => ({ ...prev, [session.id]: event.target.value }))}
                  placeholder={session.promptPlaceholder}
                  className="min-h-[96px] rounded-2xl bg-background/70"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderHistory = () => (
    <div className="space-y-4">
      {DEMO_HISTORY.map((item) => (
        <Card key={item.id} className="rounded-3xl border border-border/70 bg-white/90 shadow-[0_18px_60px_-35px_rgba(90,67,45,0.24)]">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <Badge variant="secondary" className="mb-3 text-xs">{item.sessionDate}</Badge>
                <h3 className="text-2xl font-bold text-foreground mb-1">{item.groupName}</h3>
                <p className="text-sm text-muted-foreground">Emotional tone: {item.emotionalTone}</p>
              </div>
              <Button variant="outline" className="gap-2 rounded-2xl" onClick={() => router.push("/summary")}>
                Open Full Recap
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <InfoBlock title="Main topics discussed" value={item.mainTopics.join(", ")} />
              <InfoBlock title="Key takeaways" value={item.keyTakeaways} />
              <InfoBlock title="Personal reflection" value={item.personalReflection} className="md:col-span-2" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderInsights = () => (
    <div className="space-y-5">
      <Card className="rounded-3xl border border-primary/20 bg-[linear-gradient(135deg,_rgba(167,132,94,0.14),_rgba(255,255,255,0.94))] shadow-[0_20px_70px_-35px_rgba(90,67,45,0.32)]">
        <CardContent className="p-6 md:p-7">
          <Badge variant="secondary" className="mb-3 text-xs">Main differentiator</Badge>
          <h2 className="text-3xl font-bold text-foreground mb-3">{DEMO_INSIGHTS.headline}</h2>
          <p className="text-muted-foreground max-w-2xl">
            This screen turns session summaries, participation, and journaling into a longer-term view that helps both the member and therapist notice change over time.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-3xl border border-border/70 bg-white/90 shadow-[0_18px_60px_-35px_rgba(90,67,45,0.24)]">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Recurring themes</h3>
            </div>
            <div className="space-y-3">
              {DEMO_INSIGHTS.recurringThemes.map((theme) => (
                <p key={theme} className="text-sm text-muted-foreground leading-relaxed">{theme}</p>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-border/70 bg-white/90 shadow-[0_18px_60px_-35px_rgba(90,67,45,0.24)]">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <LineChart className="w-4 h-4 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Emotional trends over time</h3>
            </div>
            <div className="space-y-3">
              {DEMO_INSIGHTS.emotionalTrends.map((trend) => (
                <div key={trend.label} className="rounded-2xl bg-muted/35 p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{trend.label}</p>
                  <p className="text-sm text-foreground mt-1">{trend.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-border/70 bg-white/90 shadow-[0_18px_60px_-35px_rgba(90,67,45,0.24)]">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Participation changes</h3>
            </div>
            <div className="space-y-3">
              {DEMO_INSIGHTS.participationChanges.map((item) => (
                <p key={item} className="text-sm text-muted-foreground leading-relaxed">{item}</p>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-border/70 bg-white/90 shadow-[0_18px_60px_-35px_rgba(90,67,45,0.24)]">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Bot className="w-4 h-4 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Behavioral shifts</h3>
            </div>
            <div className="space-y-3">
              {DEMO_INSIGHTS.behavioralShifts.map((item) => (
                <p key={item} className="text-sm text-muted-foreground leading-relaxed">{item}</p>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderJournal = () => (
    <div className="space-y-5">
      <Card className="rounded-3xl border border-border/70 bg-white/90 shadow-[0_18px_60px_-35px_rgba(90,67,45,0.24)]">
        <CardContent className="p-6 md:p-7">
          <div className="flex items-center gap-2 mb-3">
            <Lock className="w-4 h-4 text-primary" />
            <Badge variant="secondary" className="text-xs">Private to you</Badge>
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Journal between sessions</h2>
          <p className="text-muted-foreground max-w-2xl">
            Capture quick thoughts, build prep for the next session, and ask the AI for a light reflection that supports the therapist rather than replacing them.
          </p>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border border-border/70 bg-white/90 shadow-[0_18px_60px_-35px_rgba(90,67,45,0.24)]">
        <CardContent className="p-6">
          <p className="text-sm font-medium text-foreground mb-3">Quick thought entry</p>
          <Textarea
            value={journalEntry}
            onChange={(event) => setJournalEntry(event.target.value)}
            placeholder="Write what has been sitting with you between sessions..."
            className="min-h-[180px] rounded-2xl bg-background/70"
          />

          <div className="mt-4 flex flex-wrap gap-2">
            {DEMO_JOURNAL_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => setJournalEntry((current) => current ? `${current}\n\n${prompt}` : prompt)}
                className="rounded-full border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground hover:border-primary/40"
              >
                {prompt}
              </button>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <Button className="gap-2 rounded-2xl" onClick={generateAiReflection}>
              <Sparkles className="w-4 h-4" />
              AI reflection
            </Button>
            <Button variant="outline" className="gap-2 rounded-2xl" onClick={saveJournal}>
              {journalSaved ? <Check className="w-4 h-4" /> : <NotebookPen className="w-4 h-4" />}
              Save for next session prep
            </Button>
          </div>

          {aiReflection && (
            <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/5 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-primary mb-2">AI reflection</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{aiReflection}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderProfile = () => (
    <div className="grid gap-4 md:grid-cols-2">
      <SettingsCard title="Role" value={onboardingProfile.rolePreference} />
      <SettingsCard title="Life challenge" value={onboardingProfile.lifeChallenge} />
      <SettingsCard title="Communication preference" value={onboardingProfile.communicationStyle.join(", ")} />
      <SettingsCard title="Preferred group size" value={onboardingProfile.preferredGroupSize} />
      <SettingsCard title="Privacy / anonymity" value={onboardingProfile.privacyPreference} />
      <SettingsCard title="Support preference" value={onboardingProfile.supportPreferences.join(", ")} />

      <Card className="rounded-3xl border border-border/70 bg-white/90 shadow-[0_18px_60px_-35px_rgba(90,67,45,0.24)] md:col-span-2">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Settings2 className="w-4 h-4 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Topics and notifications</h3>
          </div>
          <div className="mb-4 flex flex-wrap gap-2">
            {onboardingProfile.topics.map((topic) => (
              <Badge key={topic} variant="secondary" className="text-sm">{topic}</Badge>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {DEMO_PROFILE.notifications.map((item) => (
              <div key={item} className="rounded-2xl border border-border/70 bg-muted/35 p-4">
                <p className="text-sm font-medium text-foreground">{item}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(193,158,124,0.16),_transparent_34%),linear-gradient(to_bottom,_rgba(255,252,247,1),_rgba(246,241,236,1))]">
      <div className="mx-auto max-w-6xl px-4 pb-28 pt-6 md:px-6 md:pt-8">
        <Card className="rounded-[2rem] border border-border/70 bg-white/85 shadow-[0_24px_90px_-45px_rgba(90,67,45,0.32)] backdrop-blur">
          <CardContent className="p-5 md:p-7">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-9 h-9 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Heart className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Resonance</p>
                    <p className="text-xs text-muted-foreground">Therapist-led group support with AI assistance</p>
                  </div>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">{selectedPod.name}</h1>
                <p className="text-muted-foreground max-w-2xl">{selectedPod.description}</p>
              </div>
              <div className="rounded-3xl border border-primary/15 bg-primary/5 px-4 py-3 max-w-sm">
                <div className="flex items-center gap-2 mb-1">
                  <Bot className="w-4 h-4 text-primary" />
                  <p className="text-sm font-medium text-foreground">AI supports the therapist and member</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  AI summarizes sessions, surfaces patterns, and helps prep recaps and insights. It does not replace therapy.
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {selectedPod.sharedThemes.map((theme) => (
                <Badge key={theme} variant="secondary" className="text-sm capitalize">{theme}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="mt-6">
          {selectedTab === "groups" && renderGroups()}
          {selectedTab === "upcoming" && renderUpcoming()}
          {selectedTab === "history" && renderHistory()}
          {selectedTab === "insights" && renderInsights()}
          {selectedTab === "journal" && renderJournal()}
          {selectedTab === "profile" && renderProfile()}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 px-3 pb-3">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-1 rounded-[2rem] border border-border/70 bg-white/90 p-2 shadow-[0_20px_60px_-30px_rgba(90,67,45,0.35)] backdrop-blur">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = selectedTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSelectedTab(item.id)}
                className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-[1.4rem] px-2 py-2.5 text-xs transition-all ${
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MiniStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-muted/35 p-3">
      <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-sm font-medium text-foreground leading-snug">{value}</p>
    </div>
  );
}

function InfoBlock({ title, value, className = "" }: { title: string; value: string; className?: string }) {
  return (
    <div className={`rounded-2xl border border-border/70 bg-muted/30 p-4 ${className}`}>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">{title}</p>
      <p className="text-sm text-muted-foreground leading-relaxed">{value}</p>
    </div>
  );
}

function SettingsCard({ title, value }: { title: string; value: string }) {
  return (
    <Card className="rounded-3xl border border-border/70 bg-white/90 shadow-[0_18px_60px_-35px_rgba(90,67,45,0.24)]">
      <CardContent className="p-6">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">{title}</p>
        <p className="text-sm text-foreground">{value}</p>
      </CardContent>
    </Card>
  );
}
