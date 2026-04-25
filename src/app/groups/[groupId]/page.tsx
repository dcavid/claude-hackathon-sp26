"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Calendar, Heart, Lock, Send, Sparkles, Users } from "lucide-react";
import { DEMO_ACTIVE_GROUPS, DEMO_GROUP_CHAT, DEMO_THERAPIST } from "@/lib/demo/seedData";

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

type ChatMessage = {
  id: string;
  author: string;
  role: string;
  text: string;
  time: string;
};

const EXTRA_MESSAGES: ChatMessage[] = [
  {
    id: "m4",
    author: "Jordan",
    role: "member",
    text: "I finally moved the leash today and cried right after. It felt small, but it wasn’t.",
    time: "2:27 PM",
  },
  {
    id: "m5",
    author: "Alex",
    role: "member",
    text: "That doesn't sound small at all. Those routine objects hold so much.",
    time: "2:31 PM",
  },
];

export default function GroupChatPage() {
  const params = useParams<{ groupId: string }>();
  const [messages, setMessages] = useState<ChatMessage[]>([...DEMO_GROUP_CHAT, ...EXTRA_MESSAGES]);
  const [draft, setDraft] = useState("");

  const selectedPod = useMemo<PodOption | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const stored = window.sessionStorage.getItem("resonance_selected_pod");
      return stored ? (JSON.parse(stored) as PodOption) : null;
    } catch {
      return null;
    }
  }, []);

  const group = useMemo(() => {
    if (selectedPod && params.groupId === selectedPod.id) {
      return {
        id: selectedPod.id,
        name: selectedPod.name,
        subgroup: "Current primary pod",
        memberCount: selectedPod.memberCount,
        nextSession: selectedPod.nextSession,
        chatPreview: selectedPod.chatDescription,
      };
    }

    return DEMO_ACTIVE_GROUPS.find((item) => item.id === params.groupId) || DEMO_ACTIVE_GROUPS[0];
  }, [params.groupId, selectedPod]);

  const sendMessage = () => {
    if (!draft.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}`,
        author: "You",
        role: "member",
        text: draft.trim(),
        time: "Just now",
      },
    ]);
    setDraft("");
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(193,158,124,0.16),_transparent_34%),linear-gradient(to_bottom,_rgba(255,252,247,1),_rgba(246,241,236,1))]">
      <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
        <div className="mb-5 flex items-center justify-between gap-3">
          <Link href="/session">
            <Button variant="outline" className="gap-2 rounded-2xl">
              <ArrowLeft className="w-4 h-4" />
              Back to Main App
            </Button>
          </Link>
          <Badge variant="secondary" className="text-xs">
            <Lock className="w-3 h-3 mr-1" />
            Private group chat
          </Badge>
        </div>

        <div className="grid gap-5 xl:grid-cols-[1.3fr_0.75fr]">
          <Card className="rounded-[2rem] border border-border/70 bg-white/90 shadow-[0_24px_90px_-45px_rgba(90,67,45,0.32)]">
            <CardContent className="p-5 md:p-7">
              <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <Badge variant="secondary" className="mb-3 text-xs">Small group chat</Badge>
                  <h1 className="text-3xl font-bold text-foreground mb-2">{group.name}</h1>
                  <p className="text-muted-foreground max-w-2xl">
                    This space stays open between therapist-led sessions so members can share updates, ask for encouragement, and keep momentum.
                  </p>
                </div>
                <div className="rounded-3xl border border-primary/15 bg-primary/5 px-4 py-3">
                  <p className="text-sm font-medium text-foreground">{group.memberCount} members</p>
                  <p className="text-xs text-muted-foreground">Facilitated by {DEMO_THERAPIST.name}</p>
                </div>
              </div>

              <div className="space-y-3 mb-5">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`rounded-2xl border p-4 ${
                      message.author === "You"
                        ? "ml-8 border-primary/10 bg-primary text-primary-foreground"
                        : "mr-8 border-border/70 bg-card"
                    }`}
                  >
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-xs font-medium">{message.author}</span>
                      <span className={`text-[11px] ${message.author === "You" ? "text-primary-foreground/75" : "text-muted-foreground"}`}>
                        {message.time}
                      </span>
                      {message.role === "therapist" && <Badge variant="secondary" className="text-[10px]">Therapist</Badge>}
                    </div>
                    <p className="text-sm leading-relaxed">{message.text}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <Textarea
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Share something with the group between sessions..."
                  className="min-h-[92px] rounded-2xl bg-background/70"
                />
                <Button className="self-end rounded-2xl gap-2" onClick={sendMessage}>
                  <Send className="w-4 h-4" />
                  Send
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-5">
            <Card className="rounded-[2rem] border border-border/70 bg-white/90 shadow-[0_18px_60px_-35px_rgba(90,67,45,0.24)]">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-4 h-4 text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">Group details</h2>
                </div>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p><span className="font-medium text-foreground">Subgroup:</span> {group.subgroup}</p>
                  <p><span className="font-medium text-foreground">Next session:</span> {group.nextSession}</p>
                  <p><span className="font-medium text-foreground">Facilitator:</span> {DEMO_THERAPIST.name}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[2rem] border border-border/70 bg-white/90 shadow-[0_18px_60px_-35px_rgba(90,67,45,0.24)]">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-4 h-4 text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">Next live session</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  The therapist-led voice session is where deeper processing happens. This chat is for lighter check-ins and support between meetings.
                </p>
                <Link href="/call/next-main">
                  <Button className="w-full gap-2 rounded-2xl">
                    Join mock voice call
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="rounded-[2rem] border border-border/70 bg-white/90 shadow-[0_18px_60px_-35px_rgba(90,67,45,0.24)]">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">AI support layer</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  AI helps surface discussion themes, participation patterns, and recap prep for the therapist after sessions.
                </p>
                <div className="rounded-2xl bg-muted/35 p-4 text-sm text-muted-foreground">
                  Current chat signal: grief is showing up through routine disruptions, memory objects, and guilt about “moving” everyday items.
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[2rem] border border-border/70 bg-white/90 shadow-[0_18px_60px_-35px_rgba(90,67,45,0.24)]">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Heart className="w-4 h-4 text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">Norms</h2>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>Listen generously and keep responses grounded in lived experience.</p>
                  <p>Respect privacy. What is shared here stays here.</p>
                  <p>Use the therapist-led session for deeper processing when a topic needs more structure.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
