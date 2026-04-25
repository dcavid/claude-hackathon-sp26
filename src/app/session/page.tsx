"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Heart, Mic, Square, Sparkles, Shield, LogOut, Send, AlertCircle, ClipboardList, Users,
} from "lucide-react";
import { DEMO_PARTICIPANTS, DEMO_POD, DEMO_THERAPIST } from "@/lib/demo/seedData";

type Message = {
  id: string;
  participantId: string;
  participantName: string;
  role: "member" | "therapist";
  text: string;
  timestamp: string;
  reactions: Record<string, number>;
};

type Phase = "waiting" | "checkin" | "live" | "ended";

type CopilotRecommendation = {
  prompt: string;
  rationale: string;
  quietParticipants: string[];
  dominantSpeaker?: string | null;
};

type SafetyRecommendation = {
  riskLevel: "low" | "medium" | "high";
  response: string;
  resources: string[];
};

type SelectedPod = {
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

const REACTIONS = ["I relate", "I hear you", "Thank you for sharing"];

const PARTICIPANT_COLORS: Record<string, string> = {
  david: "bg-blue-100 text-blue-700",
  maya: "bg-purple-100 text-purple-700",
  jordan: "bg-amber-100 text-amber-700",
  priya: "bg-rose-100 text-rose-700",
  alex: "bg-teal-100 text-teal-700",
  therapist: "bg-slate-200 text-slate-800",
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const now = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export default function SessionPage() {
  const router = useRouter();
  const [selectedPod] = useState<SelectedPod>(() => {
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
      return JSON.parse(stored) as SelectedPod;
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
  });
  const [phase, setPhase] = useState<Phase>("waiting");
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingBot, setTypingBot] = useState<string | null>(null);
  const [typedMessage, setTypedMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [copilotLoading, setCopilotLoading] = useState(false);
  const [copilotSuggestion, setCopilotSuggestion] = useState<CopilotRecommendation | null>(null);
  const [safetyRecommendation, setSafetyRecommendation] = useState<SafetyRecommendation | null>(null);
  const [userMessageCount, setUserMessageCount] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const messagesRef = useRef<Message[]>([]);
  const abortRef = useRef(false);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typingBot]);

  const pushMessage = useCallback((msg: Message) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const addTherapistMessage = useCallback((text: string) => {
    pushMessage({
      id: uid(),
      participantId: DEMO_THERAPIST.id,
      participantName: DEMO_THERAPIST.name,
      role: "therapist",
      text,
      timestamp: now(),
      reactions: {},
    });
  }, [pushMessage]);

  const addMemberMessage = useCallback((participantId: string, name: string, text: string) => {
    pushMessage({
      id: uid(),
      participantId,
      participantName: name,
      role: "member",
      text,
      timestamp: now(),
      reactions: {},
    });
  }, [pushMessage]);

  const fetchBotCheckin = useCallback(async (participantId: string): Promise<string> => {
    try {
      const res = await fetch("/api/bot-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personaId: participantId, type: "checkin", sessionTheme: selectedPod.sharedThemes.join(", ") }),
      });
      const data = await res.json();
      return data.response || "I'm glad to be here today.";
    } catch {
      return "I'm glad to be here today.";
    }
  }, [selectedPod.sharedThemes]);

  const fetchBotResponse = useCallback(async (
    participantId: string,
    history: Array<{ name: string; text: string }>,
    latestMessage: { name: string; text: string }
  ): Promise<string> => {
    try {
      const res = await fetch("/api/bot-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personaId: participantId,
          type: "response",
          conversationHistory: history,
          latestMessage,
        }),
      });
      const data = await res.json();
      return data.response || "I hear you.";
    } catch {
      return "I hear you.";
    }
  }, []);

  const getParticipationSnapshot = useCallback((current: Message[]) => {
    const memberMessages = current.filter((message) => message.role === "member");
    const counts = new Map<string, number>();

    for (const message of memberMessages) {
      counts.set(message.participantName, (counts.get(message.participantName) || 0) + 1);
    }

    const quietParticipants = DEMO_PARTICIPANTS
      .filter((participant) => (counts.get(participant.name) || 0) <= 1)
      .map((participant) => participant.name);

    let dominantSpeaker: string | null = null;
    let dominantCount = 0;

    counts.forEach((count, name) => {
      if (count > dominantCount) {
        dominantSpeaker = name;
        dominantCount = count;
      }
    });

    return {
      quietParticipants,
      dominantSpeaker: dominantCount >= 3 ? dominantSpeaker : null,
    };
  }, []);

  const triggerCopilot = useCallback(async () => {
    if (copilotLoading || phase !== "live") return;
    setCopilotLoading(true);

    const current = messagesRef.current;
    const transcript = current.map((message) => `${message.participantName}: ${message.text}`).join("\n");
    const participation = getParticipationSnapshot(current);

    try {
      const res = await fetch("/api/facilitate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript,
          sessionPhase: "live",
          quietParticipants: participation.quietParticipants,
          participantCount: DEMO_PARTICIPANTS.length + 1,
        }),
      });
      const data = await res.json();
      const prompt = data.prompt || "Let's pause and hear from someone who hasn't had much space yet.";
      setCopilotSuggestion({
        prompt,
        rationale: participation.dominantSpeaker
          ? `${participation.dominantSpeaker} has been carrying more of the airtime. Invite another voice in without shutting anyone down.`
          : "The group has enough emotional material on the table for a structured follow-up question.",
        quietParticipants: participation.quietParticipants,
        dominantSpeaker: participation.dominantSpeaker,
      });
    } catch {
      setCopilotSuggestion({
        prompt: "Let's slow this down for a moment. Who hasn't had a chance to speak yet and wants to name what's most present right now?",
        rationale: "Fallback recommendation when Gemini is unavailable.",
        quietParticipants: participation.quietParticipants,
        dominantSpeaker: participation.dominantSpeaker,
      });
    } finally {
      setCopilotLoading(false);
    }
  }, [copilotLoading, getParticipationSnapshot, phase]);

  const useCopilotSuggestion = useCallback(() => {
    if (!copilotSuggestion) return;
    addTherapistMessage(copilotSuggestion.prompt);
    setCopilotSuggestion(null);
  }, [addTherapistMessage, copilotSuggestion]);

  const checkSafety = useCallback(async (text: string) => {
    try {
      const res = await fetch("/api/safety", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      if ((data.riskLevel === "high" || data.riskLevel === "medium") && data.response) {
        setSafetyRecommendation({
          riskLevel: data.riskLevel,
          response: data.response,
          resources: data.resources || [],
        });
      }
    } catch {
      // Ignore transient demo errors and keep the session moving.
    }
  }, []);

  const useSafetyResponse = useCallback(() => {
    if (!safetyRecommendation) return;
    addTherapistMessage(safetyRecommendation.response);
    setSafetyRecommendation(null);
  }, [addTherapistMessage, safetyRecommendation]);

  const triggerSafetyAlert = useCallback(async () => {
    const triggerText = "I feel completely trapped lately. I don't know how much longer I can keep pretending I'm okay.";
    addMemberMessage("david", "David", triggerText);
    await sleep(800);
    await checkSafety(triggerText);
  }, [addMemberMessage, checkSafety]);

  const startCheckin = useCallback(async () => {
    abortRef.current = false;
    setPhase("checkin");

    addTherapistMessage(
      "Welcome back, everyone. This pod is a structured space for support, and I'll help guide us through check-in before we open up the broader conversation."
    );

    await sleep(1500);

    for (const participant of DEMO_PARTICIPANTS) {
      if (abortRef.current) return;
      setTypingBot(participant.id);
      const checkin = await fetchBotCheckin(participant.id);
      await sleep(900 + Math.random() * 500);
      if (abortRef.current) return;
      setTypingBot(null);
      addMemberMessage(participant.id, participant.name, checkin);
      await sleep(500);
    }

    await sleep(1000);
    if (abortRef.current) return;

    addTherapistMessage(
      "Thank you. I’m hearing burnout, isolation, and pressure to keep performing. Let’s stay with those themes and make sure each person gets room to be specific."
    );
    setPhase("live");
  }, [addMemberMessage, addTherapistMessage, fetchBotCheckin]);

  const queueBotReplies = useCallback(async (userText: string, historySnapshot: Message[]) => {
    const history = historySnapshot.map((message) => ({ name: message.participantName, text: message.text }));
    const latestMessage = { name: "You", text: userText };

    const shuffled = [...DEMO_PARTICIPANTS].sort(() => Math.random() - 0.5);
    const respondingBots = shuffled.slice(0, Math.random() > 0.4 ? 3 : 2);

    for (const participant of respondingBots) {
      if (abortRef.current) return;
      await sleep(1200 + Math.random() * 800);
      setTypingBot(participant.id);
      const response = await fetchBotResponse(participant.id, history, latestMessage);
      await sleep(800 + Math.random() * 500);
      if (abortRef.current) return;
      setTypingBot(null);
      addMemberMessage(participant.id, participant.name, response);
      await sleep(400);
    }
  }, [addMemberMessage, fetchBotResponse]);

  const handleSend = useCallback(async () => {
    if (!typedMessage.trim() || phase !== "live") return;
    const text = typedMessage.trim();
    setTypedMessage("");

    const userMsg: Message = {
      id: uid(),
      participantId: "you",
      participantName: "You",
      role: "member",
      text,
      timestamp: now(),
      reactions: {},
    };
    pushMessage(userMsg);

    const nextCount = userMessageCount + 1;
    setUserMessageCount(nextCount);

    checkSafety(text);

    const snapshot = [...messagesRef.current, userMsg];
    queueBotReplies(text, snapshot);

    if (nextCount % 2 === 0) {
      setTimeout(() => triggerCopilot(), 4500);
    }
  }, [checkSafety, phase, pushMessage, queueBotReplies, triggerCopilot, typedMessage, userMessageCount]);

  const toggleMic = useCallback(async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        try {
          const fd = new FormData();
          fd.append("audio", new Blob(chunks, { type: "audio/webm" }), "message.webm");
          const res = await fetch("/api/transcribe", { method: "POST", body: fd });
          const data = await res.json();
          if (data.transcript) setTypedMessage(data.transcript);
        } catch {
          // Silent fallback for the demo flow.
        }
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch {
      // Mic access is optional in the demo.
    }
  }, [isRecording]);

  const addReaction = useCallback((messageId: string, reaction: string) => {
    setMessages((prev) =>
      prev.map((message) =>
        message.id === messageId
          ? { ...message, reactions: { ...message.reactions, [reaction]: (message.reactions[reaction] || 0) + 1 } }
          : message
      )
    );
  }, []);

  const endSession = useCallback(() => {
    abortRef.current = true;
    setPhase("ended");
    const transcript = messagesRef.current
      .map((message) => `${message.participantName}: ${message.text}`)
      .join("\n");
    sessionStorage.setItem("resonance_transcript", transcript);
    setTimeout(() => router.push("/summary"), 1200);
  }, [router]);

  const participationSnapshot = getParticipationSnapshot(messages);

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Heart className="w-4 h-4 text-primary" />
          </div>
          <div>
            <span className="font-semibold text-foreground">{selectedPod.name}</span>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant="secondary" className="text-xs">{DEMO_THERAPIST.name}</Badge>
              {phase === "live" && (
                <Badge variant="destructive" className="text-xs px-2 py-0 gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse inline-block" />
                  Weekly session live
                </Badge>
              )}
              {phase === "waiting" && <Badge variant="outline" className="text-xs">Pod chat open</Badge>}
              {phase === "checkin" && <Badge variant="outline" className="text-xs">Check-in</Badge>}
              {phase === "ended" && <Badge className="text-xs bg-green-600">Therapist review next</Badge>}
            </div>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={endSession} className="gap-1.5 text-muted-foreground">
          <LogOut className="w-4 h-4" />
          End
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-56 border-r border-border/50 p-4 flex flex-col gap-3 shrink-0 overflow-y-auto">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Pod roster</p>
          <div className="rounded-xl border border-border/70 bg-card p-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold bg-slate-200 text-slate-800">
                {DEMO_THERAPIST.initial}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{DEMO_THERAPIST.name}</p>
                <p className="text-xs text-muted-foreground">{DEMO_THERAPIST.title}</p>
              </div>
            </div>
          </div>
          {DEMO_PARTICIPANTS.map((participant) => (
            <div key={participant.id} className="flex items-center gap-2.5">
              <div className={`relative w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${PARTICIPANT_COLORS[participant.id]}`}>
                {participant.initial}
                {typingBot === participant.id && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-background animate-pulse" />
                )}
              </div>
              <span className="text-sm text-foreground">{participant.name}</span>
            </div>
          ))}
          <Separator className="my-2" />
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold text-primary">
              Y
            </div>
            <span className="text-sm font-medium text-foreground">You</span>
            <Badge variant="outline" className="text-xs ml-auto">private journal enabled</Badge>
          </div>
          <Card className="mt-2 bg-muted/40">
            <CardContent className="p-3">
              <p className="text-xs font-medium text-foreground mb-1">Between sessions</p>
              <p className="text-xs text-muted-foreground">{selectedPod.chatDescription}</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          <div ref={scrollRef} className="flex-1 overflow-y-auto min-h-0 p-5 space-y-4">
            {phase === "waiting" && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-5">
                  <Users className="w-7 h-7 text-primary" />
                </div>
                <h2 className="font-semibold text-foreground mb-2">Your pod workspace is ready</h2>
                <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                  The private pod chat stays open between sessions. Start the therapist-led meeting when you are ready to run check-in.
                </p>
                <Button onClick={startCheckin} className="gap-2">
                  <Sparkles className="w-4 h-4" />
                  Start Weekly Session
                </Button>
              </div>
            )}

            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} onReact={addReaction} />
            ))}

            {typingBot && (
              <TypingIndicator
                participantId={typingBot}
                name={DEMO_PARTICIPANTS.find((participant) => participant.id === typingBot)?.name || ""}
                initial={DEMO_PARTICIPANTS.find((participant) => participant.id === typingBot)?.initial || "?"}
              />
            )}

            {phase === "ended" && (
              <div className="text-center py-10">
                <p className="text-sm text-muted-foreground">
                  Session complete. AI notes are moving into therapist review before the member recap is released.
                </p>
              </div>
            )}
          </div>

          {phase === "live" && (
            <div className="border-t border-border/50 p-4 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleMic}
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                    isRecording ? "bg-red-500 text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {isRecording ? <Square className="w-3.5 h-3.5 fill-current" /> : <Mic className="w-3.5 h-3.5" />}
                </button>
                <input
                  className="flex-1 bg-muted/50 rounded-xl px-4 py-2.5 text-sm outline-none border border-transparent focus:border-primary/30 placeholder:text-muted-foreground"
                  placeholder="Share something with the pod..."
                  value={typedMessage}
                  onChange={(event) => setTypedMessage(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      handleSend();
                    }
                  }}
                />
                <button
                  onClick={handleSend}
                  disabled={!typedMessage.trim()}
                  className="w-9 h-9 rounded-full bg-primary flex items-center justify-center disabled:opacity-40 shrink-0"
                >
                  <Send className="w-3.5 h-3.5 text-primary-foreground" />
                </button>
              </div>
              {isRecording && (
                <p className="text-xs text-red-500 mt-2 text-center animate-pulse">
                  Recording for transcription with Deepgram — tap again to stop
                </p>
              )}
            </div>
          )}
        </div>

        <div className="w-80 border-l border-border/50 p-4 flex flex-col gap-3 shrink-0 overflow-y-auto">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Therapist workspace</p>

          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <ClipboardList className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-medium text-primary">AI copilot active</span>
              </div>
              <p className="text-xs text-muted-foreground">
                AI is assisting with note-taking, moderation, participation balance, and post-session recap drafting for therapist review.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 space-y-2">
              <p className="text-xs font-medium text-foreground">Participation balance</p>
              <p className="text-xs text-muted-foreground">
                {participationSnapshot.quietParticipants.length > 0
                  ? `Quieter voices: ${participationSnapshot.quietParticipants.join(", ")}`
                  : "Everyone has contributed at least once."}
              </p>
              <p className="text-xs text-muted-foreground">
                {participationSnapshot.dominantSpeaker
                  ? `Most active speaker: ${participationSnapshot.dominantSpeaker}`
                  : "No dominant speaker pattern detected yet."}
              </p>
            </CardContent>
          </Card>

          <div className="space-y-2">
            {phase === "waiting" && (
              <Button variant="outline" size="sm" className="w-full gap-2 justify-start" onClick={startCheckin}>
                <Sparkles className="w-3.5 h-3.5" />
                Start Weekly Session
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2 justify-start"
              onClick={triggerCopilot}
              disabled={copilotLoading || phase !== "live"}
            >
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              {copilotLoading ? "Generating guidance..." : "Generate facilitator guidance"}
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2 justify-start text-red-600 border-red-200 hover:bg-red-50"
              onClick={triggerSafetyAlert}
              disabled={phase !== "live"}
            >
              <Shield className="w-3.5 h-3.5" />
              Simulate moderation flag
            </Button>

            <Button variant="outline" size="sm" className="w-full gap-2 justify-start" onClick={endSession}>
              <LogOut className="w-3.5 h-3.5" />
              End session and queue therapist review
            </Button>
          </div>

          {copilotSuggestion && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-3 space-y-3">
                <div>
                  <p className="text-xs font-medium text-primary mb-1">Suggested facilitator move</p>
                  <p className="text-sm text-foreground leading-relaxed">{copilotSuggestion.prompt}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground mb-1">Why now</p>
                  <p className="text-xs text-muted-foreground">{copilotSuggestion.rationale}</p>
                </div>
                <Button size="sm" className="w-full" onClick={useCopilotSuggestion}>
                  Therapist uses this prompt
                </Button>
              </CardContent>
            </Card>
          )}

          {safetyRecommendation && (
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-3 space-y-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                  <span className="text-xs font-medium text-red-700">
                    Moderation recommendation: {safetyRecommendation.riskLevel} attention
                  </span>
                </div>
                <p className="text-sm text-red-900 leading-relaxed">{safetyRecommendation.response}</p>
                {safetyRecommendation.resources.length > 0 && (
                  <p className="text-xs text-red-700">
                    Resources ready: {safetyRecommendation.resources.join(", ")}
                  </p>
                )}
                <Button size="sm" variant="outline" className="w-full border-red-200" onClick={useSafetyResponse}>
                  Therapist shares grounding response
                </Button>
              </CardContent>
            </Card>
          )}

          <Separator />

          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Reaction shortcuts</p>
            <div className="space-y-1">
              {REACTIONS.map((reaction) => (
                <div key={reaction} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                  <span className="text-xs text-muted-foreground">{reaction}</span>
                </div>
              ))}
            </div>
          </div>

          <Card className="bg-muted/40">
            <CardContent className="p-3">
              <p className="text-xs font-medium text-foreground mb-1">Release workflow</p>
              <p className="text-xs text-muted-foreground">
                AI drafts therapist notes and member recaps after the session. Member-facing summaries stay locked until the therapist reviews them.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message, onReact }: { message: Message; onReact: (id: string, reaction: string) => void }) {
  const [hovering, setHovering] = useState(false);
  const isYou = message.participantId === "you";
  const isTherapist = message.role === "therapist";

  return (
    <div
      className={`fade-in-up ${isYou ? "flex flex-row-reverse" : "flex"} items-start gap-2.5`}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {!isYou && (
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${
          isTherapist
            ? "bg-slate-200 text-slate-800"
            : PARTICIPANT_COLORS[message.participantId] || "bg-muted text-muted-foreground"
        }`}>
          {isTherapist ? DEMO_THERAPIST.initial : message.participantName[0]}
        </div>
      )}

      <div className={`max-w-[70%] flex flex-col gap-1 ${isYou ? "items-end" : "items-start"}`}>
        {!isYou && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-foreground">{message.participantName}</span>
            {isTherapist && <Badge variant="secondary" className="text-xs px-1.5 py-0">Therapist</Badge>}
            <span className="text-xs text-muted-foreground">{message.timestamp}</span>
          </div>
        )}

        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isYou
            ? "bg-primary text-primary-foreground rounded-tr-sm"
            : isTherapist
            ? "bg-slate-100 text-slate-900 border border-slate-200 rounded-tl-sm"
            : "bg-card text-foreground border border-border rounded-tl-sm"
        }`}>
          {message.text}
        </div>

        {Object.keys(message.reactions).length > 0 && (
          <div className="flex flex-wrap gap-1">
            {Object.entries(message.reactions).map(([reaction, count]) => (
              <button
                key={reaction}
                onClick={() => onReact(message.id, reaction)}
                className="text-xs bg-muted/60 border border-border rounded-full px-2 py-0.5 hover:bg-muted transition-colors"
              >
                {reaction} {count}
              </button>
            ))}
          </div>
        )}

        {hovering && !isYou && !isTherapist && (
          <div className="flex gap-1 flex-wrap mt-0.5">
            {REACTIONS.map((reaction) => (
              <button
                key={reaction}
                onClick={() => onReact(message.id, reaction)}
                className="text-xs bg-card border border-border rounded-full px-2 py-0.5 hover:bg-muted transition-colors text-muted-foreground"
              >
                {reaction}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TypingIndicator({ participantId, name, initial }: { participantId: string; name: string; initial: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${PARTICIPANT_COLORS[participantId] || "bg-muted text-muted-foreground"}`}>
        {initial}
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-xs text-muted-foreground">{name}</span>
        <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1 items-center">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce"
              style={{ animationDelay: `${index * 150}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
