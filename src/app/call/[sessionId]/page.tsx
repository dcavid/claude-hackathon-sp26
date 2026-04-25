"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertCircle, ArrowLeft, Bot, Brain, Calendar, Heart, Mic, MicOff, PhoneOff,
  Sparkles, Users, Video, VideoOff, Volume2, Waves, MessageCircleMore,
} from "lucide-react";
import { DEMO_PARTICIPANTS, DEMO_THERAPIST, DEMO_POD } from "@/lib/demo/seedData";
import { speak } from "@/lib/voice/textToSpeech";

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

const SPEAKING_ORDER = [
  { name: "Dr. Elena Park", status: "facilitating", note: "Opening the session and framing today’s check-in." },
  { name: "Maya", status: "recently spoke", note: "Named how quiet routines have become grief triggers." },
  { name: "You", status: "up next", note: "Prompted to share what feels most present today." },
  { name: "Jordan", status: "quiet", note: "Has not spoken yet in this round." },
];

const LIVE_FEED = [
  {
    id: "f1",
    type: "spoken" as const,
    speaker: "Dr. Elena Park",
    time: "7:32 PM",
    text: "Let's start with what has felt hardest to carry since we last met, even if it seems small on paper.",
  },
  {
    id: "f2",
    type: "spoken" as const,
    speaker: "Maya",
    time: "7:33 PM",
    text: "I keep reaching for the leash without thinking. It's the automatic moments that hit me first.",
  },
  {
    id: "f3",
    type: "ai" as const,
    speaker: "AI live transcript",
    time: "7:33 PM",
    text: "Reading out to therapist: shared theme is grief surfacing through routines, memory objects, and empty transitions at home.",
  },
  {
    id: "f4",
    type: "spoken" as const,
    speaker: "You",
    time: "7:34 PM",
    text: "Mornings are the worst for me. Everything in the apartment reminds me he's not there anymore.",
  },
  {
    id: "f5",
    type: "spoken" as const,
    speaker: "Dr. Elena Park",
    time: "7:35 PM",
    text: "Stay there for a second. What changes in your body when you notice that absence in the morning?",
  },
  {
    id: "f6",
    type: "ai" as const,
    speaker: "AI facilitator support",
    time: "7:35 PM",
    text: "Suggested readout: Jordan has not spoken yet. Invite one quieter voice in after this thread resolves.",
  },
];

export default function VoiceCallPage() {
  const params = useParams<{ sessionId: string }>();
  const [micOn, setMicOn] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [captionsOn, setCaptionsOn] = useState(true);
  const [visibleFeedCount, setVisibleFeedCount] = useState(1);
  const [currentReadout, setCurrentReadout] = useState(LIVE_FEED[0]);
  const spokenIdsRef = useRef<Set<string>>(new Set());

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

  const sessionLabel = params.sessionId === "next-main" ? selectedPod.nextSession : "Scheduled demo session";
  const visibleFeed = LIVE_FEED.slice(0, visibleFeedCount);

  useEffect(() => {
    let elapsed = 0;
    const timers = LIVE_FEED.slice(1).map((item, index) => {
      const baseDelay = item.type === "ai" ? 4200 : 5600;
      const textDelay = Math.min(item.text.length * 32, 2600);
      elapsed += baseDelay + textDelay;

      return window.setTimeout(() => {
        setVisibleFeedCount(index + 2);
        setCurrentReadout(item);
      }, elapsed);
    });

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [params.sessionId]);

  useEffect(() => {
    if (!currentReadout || spokenIdsRef.current.has(currentReadout.id)) return;
    spokenIdsRef.current.add(currentReadout.id);
    speak(currentReadout.text).catch(() => {});
  }, [currentReadout]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(193,158,124,0.16),_transparent_34%),linear-gradient(to_bottom,_rgba(255,252,247,1),_rgba(246,241,236,1))]">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
        <div className="mb-5 flex items-center justify-between gap-3">
          <Link href="/session">
            <Button variant="outline" className="gap-2 rounded-2xl">
              <ArrowLeft className="w-4 h-4" />
              Back to Main App
            </Button>
          </Link>
          <Badge variant="secondary" className="text-xs">
            <Calendar className="w-3 h-3 mr-1" />
            {sessionLabel}
          </Badge>
        </div>

        <div className="grid gap-5 xl:grid-cols-[1.35fr_0.8fr]">
          <Card className="rounded-[2rem] border border-border/70 bg-white/92 shadow-[0_24px_90px_-45px_rgba(90,67,45,0.32)]">
            <CardContent className="p-5 md:p-7">
              <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <Badge variant="secondary" className="mb-3 text-xs">Therapist-led voice session</Badge>
                  <h1 className="text-3xl font-bold text-foreground mb-2">{selectedPod.name}</h1>
                  <p className="text-muted-foreground max-w-2xl">
                    This mock call shows the therapist-led session environment with AI support operating in the background.
                  </p>
                </div>
                <div className="rounded-3xl border border-primary/15 bg-primary/5 px-4 py-3">
                  <p className="text-sm font-medium text-foreground">Facilitator: {DEMO_THERAPIST.name}</p>
                  <p className="text-xs text-muted-foreground">Camera on for therapist, optional for members</p>
                </div>
              </div>

              <div className="rounded-3xl border border-border/70 bg-muted/25 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Active voice room</p>
                    <h2 className="text-xl font-semibold text-foreground mt-1">Live transcript and spoken readout</h2>
                  </div>
                  <Badge variant="outline" className="text-xs">captions + therapist assist</Badge>
                </div>

                <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
                  <div className="rounded-[1.5rem] border border-border/70 bg-white/80 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <MessageCircleMore className="w-4 h-4 text-primary" />
                      <p className="text-sm font-medium text-foreground">Active text group chat</p>
                    </div>
                    <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                      {visibleFeed.filter((item) => item.type === "spoken").map((item) => (
                        <div key={item.id} className={`rounded-2xl border p-4 fade-in-up ${
                          item.speaker === "You"
                            ? "ml-6 border-primary/10 bg-primary text-primary-foreground"
                            : item.speaker === "Dr. Elena Park"
                            ? "mr-4 border-primary/20 bg-primary/5"
                            : "mr-8 border-border/70 bg-card"
                        }`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-sm font-medium ${item.speaker === "You" ? "text-primary-foreground" : "text-foreground"}`}>{item.speaker}</span>
                            <span className={`text-[11px] ${item.speaker === "You" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{item.time}</span>
                            {item.speaker === "Dr. Elena Park" && <Badge variant="secondary" className="text-[10px]">Therapist</Badge>}
                          </div>
                          <p className={`text-sm leading-relaxed ${item.speaker === "You" ? "text-primary-foreground" : "text-muted-foreground"}`}>{item.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-[1.5rem] border border-primary/20 bg-primary/5 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Waves className="w-4 h-4 text-primary" />
                        <p className="text-sm font-medium text-foreground">Now being read aloud</p>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        &ldquo;{currentReadout.text}&rdquo;
                      </p>
                      <div className="mt-3 flex items-end gap-1 h-6">
                        {[10, 18, 11, 22, 14, 19, 8, 16].map((height, index) => (
                          <div
                            key={index}
                            className="w-1.5 rounded-full bg-primary/60"
                            style={{ height }}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[1.5rem] border border-border/70 bg-white/80 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Bot className="w-4 h-4 text-primary" />
                        <p className="text-sm font-medium text-foreground">AI readout lane</p>
                      </div>
                      <div className="space-y-3">
                        {visibleFeed.filter((item) => item.type === "ai").map((item) => (
                          <div key={item.id} className="rounded-2xl border border-primary/20 bg-primary/5 p-3 fade-in-up">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium text-foreground">{item.speaker}</span>
                              <span className="text-[11px] text-muted-foreground">{item.time}</span>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[1.5rem] border border-border/70 bg-white/80 p-4">
                      <p className="text-sm font-medium text-foreground mb-2">Session agenda</p>
                      <div className="space-y-2">
                        <StructureCard title="Check-in" body="Therapist opens and names the emotional tone across the pod." compact />
                        <StructureCard title="Shared processing" body="Members explore the week’s most present themes together." compact />
                        <StructureCard title="Close + recap" body="AI drafts notes after the call, then the therapist reviews them." compact />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 mt-5">
                <VideoTile
                  title={DEMO_THERAPIST.name}
                  subtitle="Licensed therapist facilitator"
                  status={currentReadout.speaker === "Dr. Elena Park" ? "Speaking now" : "Live"}
                  variant="therapist"
                  speaking={currentReadout.speaker === "Dr. Elena Park"}
                />
                <VideoTile
                  title="You"
                  subtitle={cameraOn ? "Camera on" : "Audio only"}
                  status={currentReadout.speaker === "You" ? "Speaking now" : micOn ? "Mic live" : "Listening"}
                  variant="member"
                  speaking={currentReadout.speaker === "You"}
                />
                {DEMO_PARTICIPANTS.slice(0, 4).map((participant) => (
                  <VideoTile
                    key={participant.id}
                    title={participant.name}
                    subtitle={currentReadout.speaker === participant.name ? "Speaking now" : "Listening"}
                    status={currentReadout.speaker === participant.name ? "Active" : "Present"}
                    variant="member"
                    speaking={currentReadout.speaker === participant.name}
                  />
                ))}
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <ControlButton active={micOn} onClick={() => setMicOn((current) => !current)} icon={micOn ? Mic : MicOff} label={micOn ? "Mute" : "Unmute"} />
                <ControlButton active={cameraOn} onClick={() => setCameraOn((current) => !current)} icon={cameraOn ? Video : VideoOff} label={cameraOn ? "Camera off" : "Camera on"} />
                <ControlButton active={captionsOn} onClick={() => setCaptionsOn((current) => !current)} icon={Volume2} label={captionsOn ? "Captions on" : "Captions off"} />
                <Button variant="destructive" className="gap-2 rounded-2xl ml-auto">
                  <PhoneOff className="w-4 h-4" />
                  Leave Call
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-5">
            <Card className="rounded-[2rem] border border-border/70 bg-white/92 shadow-[0_18px_60px_-35px_rgba(90,67,45,0.24)]">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-4 h-4 text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">Speaking flow</h2>
                </div>
                <div className="space-y-3">
                  {SPEAKING_ORDER.map((person) => (
                    <div key={person.name} className="rounded-2xl border border-border/70 bg-muted/30 p-4">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-foreground">{person.name}</p>
                        <Badge variant="outline" className="text-[10px] capitalize">{person.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{person.note}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[2rem] border border-border/70 bg-white/92 shadow-[0_18px_60px_-35px_rgba(90,67,45,0.24)]">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Brain className="w-4 h-4 text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">AI copilot panel</h2>
                </div>
                <div className="space-y-4">
                  <CopilotItem
                    icon={<Sparkles className="w-4 h-4 text-primary" />}
                    title="Facilitator suggestion"
                    body="Invite one quieter member in after Maya finishes, then return to the shared theme of routines after loss."
                  />
                  <CopilotItem
                    icon={<AlertCircle className="w-4 h-4 text-primary" />}
                    title="Moderation signal"
                    body="No acute safety escalation right now. The group tone is tender and connected."
                  />
                  <CopilotItem
                    icon={<Bot className="w-4 h-4 text-primary" />}
                    title="Notes drafting"
                    body="Tracking themes around memory objects, guilt about moving forward, and grief showing up in ordinary transitions."
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[2rem] border border-border/70 bg-white/92 shadow-[0_18px_60px_-35px_rgba(90,67,45,0.24)]">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Heart className="w-4 h-4 text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">Session context</h2>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p><span className="font-medium text-foreground">Themes:</span> {selectedPod.sharedThemes.join(", ")}</p>
                  <p><span className="font-medium text-foreground">Format:</span> {selectedPod.meetingType}</p>
                  <p><span className="font-medium text-foreground">Session id:</span> {params.sessionId}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function VideoTile({
  title,
  subtitle,
  status,
  variant,
  speaking = false,
}: {
  title: string;
  subtitle: string;
  status: string;
  variant: "therapist" | "member";
  speaking?: boolean;
}) {
  return (
    <div className={`rounded-[1.6rem] border p-4 min-h-[170px] flex flex-col justify-between ${
      variant === "therapist"
        ? "border-primary/20 bg-[linear-gradient(135deg,_rgba(190,155,121,0.18),_rgba(255,255,255,0.95))]"
        : "border-border/70 bg-[linear-gradient(135deg,_rgba(255,255,255,0.9),_rgba(246,241,236,0.95))]"
    }`}>
      <div className="flex items-center justify-between">
        <Badge variant={variant === "therapist" ? "secondary" : "outline"} className="text-xs">
          {variant === "therapist" ? "Therapist" : "Member"}
        </Badge>
        <Badge variant="outline" className="text-[10px]">{status}</Badge>
      </div>
      <div>
        <div className={`w-14 h-14 rounded-2xl mb-3 flex items-center justify-center text-lg font-semibold relative ${
          variant === "therapist" ? "bg-primary/15 text-primary" : "bg-muted text-foreground"
        }`}>
          {title.split(" ").map((part) => part[0]).slice(0, 2).join("")}
          {speaking && <span className="absolute -right-1 -bottom-1 h-4 w-4 rounded-full border-2 border-white bg-emerald-500 animate-pulse" />}
        </div>
        <p className="text-base font-semibold text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

function StructureCard({ title, body, compact = false }: { title: string; body: string; compact?: boolean }) {
  return (
    <div className={`rounded-2xl border border-border/70 bg-white/80 ${compact ? "p-3" : "p-4"}`}>
      <p className="text-sm font-medium text-foreground mb-1">{title}</p>
      <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
    </div>
  );
}

function CopilotItem({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <p className="text-sm font-medium text-foreground">{title}</p>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
    </div>
  );
}

function ControlButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <Button
      variant={active ? "default" : "outline"}
      className="gap-2 rounded-2xl"
      onClick={onClick}
    >
      <Icon className="w-4 h-4" />
      {label}
    </Button>
  );
}
