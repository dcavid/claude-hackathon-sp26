"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Heart, Mic, Square, Sparkles, Shield,
  LogOut, Send, AlertCircle, Volume2, VolumeX,
} from "lucide-react";
import { DEMO_PARTICIPANTS } from "@/lib/demo/seedData";
import { speak } from "@/lib/voice/textToSpeech";

// ─── Types ───────────────────────────────────────────────────────────────────

type Message = {
  id: string;
  participantId: string;
  participantName: string;
  text: string;
  timestamp: string;
  reactions: Record<string, number>;
  isAI?: boolean;
  isSafety?: boolean;
};

type Phase = "waiting" | "checkin" | "live" | "ended";

// ─── Constants ───────────────────────────────────────────────────────────────

const REACTIONS = ["I relate", "I hear you", "Thank you for sharing"];

const PARTICIPANT_COLORS: Record<string, string> = {
  david:  "bg-blue-100 text-blue-700",
  maya:   "bg-purple-100 text-purple-700",
  jordan: "bg-amber-100 text-amber-700",
  priya:  "bg-rose-100 text-rose-700",
  alex:   "bg-teal-100 text-teal-700",
};

const SESSION_THEME =
  typeof window !== "undefined"
    ? sessionStorage.getItem("resonance_theme") || "imposter syndrome and self-worth"
    : "imposter syndrome and self-worth";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const now = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

// ─── Component ───────────────────────────────────────────────────────────────

export default function SessionPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("waiting");
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingBot, setTypingBot] = useState<string | null>(null);
  const [typedMessage, setTypedMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [safetyActive, setSafetyActive] = useState(false);
  const [facilitatorLoading, setFacilitatorLoading] = useState(false);
  const [userMessageCount, setUserMessageCount] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const messagesRef = useRef<Message[]>([]);
  const abortRef = useRef(false);

  // Keep messagesRef in sync so async callbacks don't use stale state
  useEffect(() => { messagesRef.current = messages; }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typingBot]);

  // ─── Message helpers ───────────────────────────────────────────────────────

  const pushMessage = useCallback((msg: Message) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const addAIMessage = useCallback(
    (text: string, isSafety = false, speakIt = true) => {
      const msg: Message = {
        id: uid(),
        participantId: "ai",
        participantName: isSafety ? "Safety Copilot" : "AI Facilitator",
        text,
        timestamp: now(),
        reactions: {},
        isAI: true,
        isSafety,
      };
      pushMessage(msg);
      if (speakIt && !isMuted) speak(text).catch(() => {});
    },
    [isMuted, pushMessage]
  );

  const addBotMessage = useCallback(
    (participantId: string, name: string, text: string) => {
      pushMessage({
        id: uid(),
        participantId,
        participantName: name,
        text,
        timestamp: now(),
        reactions: {},
      });
    },
    [pushMessage]
  );

  // ─── Bot helpers ───────────────────────────────────────────────────────────

  const fetchBotCheckin = async (participantId: string): Promise<string> => {
    try {
      const res = await fetch("/api/bot-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personaId: participantId, type: "checkin", sessionTheme: SESSION_THEME }),
      });
      const data = await res.json();
      return data.response || "I'm glad to be here today.";
    } catch {
      return "I'm glad to be here today.";
    }
  };

  const fetchBotResponse = async (
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
  };

  // ─── Session start: bot check-ins ─────────────────────────────────────────

  const startCheckin = useCallback(async () => {
    abortRef.current = false;
    setPhase("checkin");

    addAIMessage(
      "Welcome, everyone. Let's take a moment to check in — share whatever feels true for you right now, even just a word or two.",
      false,
      true
    );

    await sleep(1800);

    for (const p of DEMO_PARTICIPANTS) {
      if (abortRef.current) return;
      setTypingBot(p.id);
      const checkin = await fetchBotCheckin(p.id);
      await sleep(1000 + Math.random() * 600);
      if (abortRef.current) return;
      setTypingBot(null);
      addBotMessage(p.id, p.name, checkin);
      await sleep(700);
    }

    await sleep(1400);
    if (abortRef.current) return;

    addAIMessage(
      "Thank you all. This is a space to be real — no pressure to have it figured out. What's alive for anyone right now?",
      false,
      true
    );

    await sleep(600);
    setPhase("live");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addAIMessage, addBotMessage]);

  // ─── Bot replies after user speaks ────────────────────────────────────────

  const queueBotReplies = useCallback(
    async (userText: string, historySnapshot: Message[]) => {
      const history = historySnapshot.map((m) => ({ name: m.participantName, text: m.text }));
      const latestMessage = { name: "You", text: userText };

      // Pick 2–3 random bots to respond (not all 5)
      const shuffled = [...DEMO_PARTICIPANTS].sort(() => Math.random() - 0.5);
      const respondingBots = shuffled.slice(0, Math.random() > 0.4 ? 3 : 2);

      for (const p of respondingBots) {
        if (abortRef.current) return;
        await sleep(1200 + Math.random() * 800);
        setTypingBot(p.id);
        const response = await fetchBotResponse(p.id, history, latestMessage);
        await sleep(900 + Math.random() * 600);
        if (abortRef.current) return;
        setTypingBot(null);
        addBotMessage(p.id, p.name, response);
        await sleep(500);
      }
    },
    [addBotMessage]
  );

  // ─── Auto facilitator ─────────────────────────────────────────────────────

  const triggerFacilitator = useCallback(async () => {
    if (facilitatorLoading) return;
    setFacilitatorLoading(true);

    const current = messagesRef.current;
    const transcript = current.map((m) => `${m.participantName}: ${m.text}`).join("\n");

    // Find quieter participants (haven't spoken recently)
    const recentSpeakers = new Set(current.slice(-6).map((m) => m.participantName));
    const quietParticipants = DEMO_PARTICIPANTS
      .filter((p) => !recentSpeakers.has(p.name))
      .map((p) => p.name);

    try {
      const res = await fetch("/api/facilitate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, sessionPhase: "live", quietParticipants }),
      });
      const data = await res.json();
      const prompt = data.prompt || "What's sitting with anyone right now that hasn't been said yet?";
      addAIMessage(prompt, false, true);
    } catch {
      addAIMessage("What's sitting with anyone right now that hasn't been said yet?", false, true);
    } finally {
      setFacilitatorLoading(false);
    }
  }, [facilitatorLoading, addAIMessage]);

  // ─── Safety copilot ───────────────────────────────────────────────────────

  const checkSafety = useCallback(
    async (text: string) => {
      try {
        const res = await fetch("/api/safety", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text }),
        });
        const data = await res.json();
        if ((data.riskLevel === "high" || data.riskLevel === "medium") && data.response) {
          setSafetyActive(true);
          await sleep(1200);
          addAIMessage(data.response, true, true);
        }
      } catch { /* silent */ }
    },
    [addAIMessage]
  );

  const triggerSafetyCopilot = useCallback(async () => {
    setSafetyActive(true);
    const triggerText = "Sometimes I feel so overwhelmed I don't know what to do. Like there's no way through.";
    addBotMessage("david", "David", triggerText);
    await sleep(1500);
    try {
      const res = await fetch("/api/safety", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: triggerText }),
      });
      const data = await res.json();
      addAIMessage(
        data.response || "I'm really glad you shared that. Would grounding support feel helpful right now? If you may be in immediate danger, please reach out to a crisis line — in the US, call or text 988.",
        true,
        true
      );
    } catch {
      addAIMessage(
        "I'm really glad you shared that. Would grounding support feel helpful right now? If you may be in immediate danger, please reach out to a crisis line — in the US, call or text 988.",
        true,
        true
      );
    }
  }, [addAIMessage, addBotMessage]);

  // ─── Send message ─────────────────────────────────────────────────────────

  const handleSend = useCallback(async () => {
    if (!typedMessage.trim() || phase !== "live") return;
    const text = typedMessage.trim();
    setTypedMessage("");

    const userMsg: Message = {
      id: uid(),
      participantId: "you",
      participantName: "You",
      text,
      timestamp: now(),
      reactions: {},
    };
    pushMessage(userMsg);

    const newCount = userMessageCount + 1;
    setUserMessageCount(newCount);

    // Safety check runs in background
    checkSafety(text);

    // Snapshot history before bots add messages
    const snapshot = [...messagesRef.current, userMsg];
    queueBotReplies(text, snapshot);

    // Auto-facilitate every 3 user messages
    if (newCount % 3 === 0) {
      setTimeout(() => triggerFacilitator(), 7000);
    }
  }, [typedMessage, phase, userMessageCount, pushMessage, checkSafety, queueBotReplies, triggerFacilitator]);

  // ─── Mic recording ────────────────────────────────────────────────────────

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
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        try {
          const fd = new FormData();
          fd.append("audio", new Blob(chunks, { type: "audio/webm" }), "message.webm");
          const res = await fetch("/api/transcribe", { method: "POST", body: fd });
          const data = await res.json();
          if (data.transcript) setTypedMessage(data.transcript);
        } catch { /* silent */ }
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch { /* mic denied */ }
  }, [isRecording]);

  // ─── Reactions ────────────────────────────────────────────────────────────

  const addReaction = useCallback((msgId: string, reaction: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId
          ? { ...m, reactions: { ...m.reactions, [reaction]: (m.reactions[reaction] || 0) + 1 } }
          : m
      )
    );
  }, []);

  // ─── End session ──────────────────────────────────────────────────────────

  const endSession = useCallback(() => {
    abortRef.current = true;
    setPhase("ended");
    // Build a transcript string and store for summary page
    const transcript = messagesRef.current
      .map((m) => `${m.participantName}: ${m.text}`)
      .join("\n");
    sessionStorage.setItem("resonance_transcript", transcript);
    setTimeout(() => router.push("/summary"), 1500);
  }, [router]);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Heart className="w-4 h-4 text-primary" />
          </div>
          <div>
            <span className="font-semibold text-foreground">Imposter Syndrome Circle</span>
            <div className="flex items-center gap-2 mt-0.5">
              {phase === "live" && (
                <Badge variant="destructive" className="text-xs px-2 py-0 gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse inline-block" />
                  Live
                </Badge>
              )}
              {phase === "waiting" && <Badge variant="secondary" className="text-xs">Waiting</Badge>}
              {phase === "checkin"  && <Badge variant="secondary" className="text-xs">Check-in</Badge>}
              {phase === "ended"   && <Badge className="text-xs bg-green-600">Complete</Badge>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setIsMuted(!isMuted)} className="gap-1.5 text-muted-foreground">
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={endSession} className="gap-1.5 text-muted-foreground">
            <LogOut className="w-4 h-4" />
            End
          </Button>
        </div>
      </div>

      {/* 3-column layout */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT: Participants */}
        <div className="w-52 border-r border-border/50 p-4 flex flex-col gap-2 shrink-0 overflow-y-auto">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Circle</p>
          {DEMO_PARTICIPANTS.map((p) => (
            <div key={p.id} className="flex items-center gap-2.5">
              <div className={`relative w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${PARTICIPANT_COLORS[p.id]}`}>
                {p.initial}
                {typingBot === p.id && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-background animate-pulse" />
                )}
              </div>
              <span className="text-sm text-foreground">{p.name}</span>
            </div>
          ))}
          <Separator className="my-2" />
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold text-primary">
              Y
            </div>
            <span className="text-sm font-medium text-foreground">You</span>
            <Badge variant="outline" className="text-xs ml-auto">me</Badge>
          </div>
        </div>

        {/* CENTER: Chat */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          <div ref={scrollRef} className="flex-1 overflow-y-auto min-h-0 p-5 space-y-4">

            {phase === "waiting" && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-5">
                  <Sparkles className="w-7 h-7 text-primary" />
                </div>
                <h2 className="font-semibold text-foreground mb-2">Everyone&apos;s here</h2>
                <p className="text-sm text-muted-foreground mb-6 max-w-xs">
                  Start the session and each member will check in. Then it&apos;s your turn.
                </p>
                <Button onClick={startCheckin} className="gap-2">
                  <Sparkles className="w-4 h-4" />
                  Start Check-In
                </Button>
              </div>
            )}

            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} onReact={addReaction} />
            ))}

            {typingBot && (
              <TypingIndicator
                participantId={typingBot}
                name={DEMO_PARTICIPANTS.find((p) => p.id === typingBot)?.name || ""}
                initial={DEMO_PARTICIPANTS.find((p) => p.id === typingBot)?.initial || "?"}
              />
            )}

            {phase === "ended" && (
              <div className="text-center py-10">
                <p className="text-sm text-muted-foreground">Session complete — generating your reflection...</p>
              </div>
            )}
          </div>

          {/* Input bar */}
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
                  placeholder="Share something with the circle..."
                  value={typedMessage}
                  onChange={(e) => setTypedMessage(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }}}
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
                  Recording — tap the mic button to stop and transcribe
                </p>
              )}
            </div>
          )}
        </div>

        {/* RIGHT: Facilitator panel */}
        <div className="w-64 border-l border-border/50 p-4 flex flex-col gap-3 shrink-0 overflow-y-auto">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">AI Facilitator</p>

          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-medium text-primary">
                  {phase === "live" ? "Active" : phase === "checkin" ? "Leading check-in" : "Standby"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {phase === "live"
                  ? "Listening and will facilitate every few exchanges automatically."
                  : "Will facilitate once the session goes live."}
              </p>
            </CardContent>
          </Card>

          <Separator />

          <div className="space-y-2">
            {phase === "waiting" && (
              <Button variant="outline" size="sm" className="w-full gap-2 justify-start" onClick={startCheckin}>
                <Sparkles className="w-3.5 h-3.5" />
                Start Check-In
              </Button>
            )}

            <Button
              variant="outline" size="sm"
              className="w-full gap-2 justify-start"
              onClick={triggerFacilitator}
              disabled={facilitatorLoading || phase !== "live"}
            >
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              {facilitatorLoading ? "Thinking..." : "Facilitate Now"}
            </Button>

            <Button
              variant="outline" size="sm"
              className="w-full gap-2 justify-start text-red-600 border-red-200 hover:bg-red-50"
              onClick={triggerSafetyCopilot}
              disabled={safetyActive || phase !== "live"}
            >
              <Shield className="w-3.5 h-3.5" />
              {safetyActive ? "Safety active" : "Trigger Safety Copilot"}
            </Button>

            <Button variant="outline" size="sm" className="w-full gap-2 justify-start" onClick={endSession}>
              <LogOut className="w-3.5 h-3.5" />
              End Session
            </Button>
          </div>

          <Separator />

          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Resonance reactions</p>
            <div className="space-y-1">
              {REACTIONS.map((r) => (
                <div key={r} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                  <span className="text-xs text-muted-foreground">{r}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground/50 mt-1.5">Hover a message to react</p>
          </div>

          {safetyActive && (
            <>
              <Separator />
              <Card className="bg-red-50 border-red-200">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                    <span className="text-xs font-medium text-red-700">Safety Copilot active</span>
                  </div>
                  <p className="text-xs text-red-600">Monitoring. Resources ready.</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function MessageBubble({ message, onReact }: { message: Message; onReact: (id: string, r: string) => void }) {
  const [hovering, setHovering] = useState(false);
  const isYou = message.participantId === "you";

  return (
    <div
      className={`fade-in-up ${isYou ? "flex flex-row-reverse" : "flex"} items-start gap-2.5`}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {!isYou && (
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${
          message.isSafety
            ? "bg-red-100 text-red-700"
            : message.isAI
            ? "bg-primary/10 text-primary"
            : PARTICIPANT_COLORS[message.participantId] || "bg-muted text-muted-foreground"
        }`}>
          {message.isSafety ? "🛡" : message.isAI ? "✦" : message.participantName[0]}
        </div>
      )}

      <div className={`max-w-[70%] flex flex-col gap-1 ${isYou ? "items-end" : "items-start"}`}>
        {!isYou && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-foreground">{message.participantName}</span>
            {message.isAI && !message.isSafety && <Badge variant="secondary" className="text-xs px-1.5 py-0">AI</Badge>}
            {message.isSafety && <Badge className="text-xs px-1.5 py-0 bg-red-100 text-red-700 border-red-200">Safety</Badge>}
            <span className="text-xs text-muted-foreground">{message.timestamp}</span>
          </div>
        )}

        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isYou
            ? "bg-primary text-primary-foreground rounded-tr-sm"
            : message.isSafety
            ? "bg-red-50 text-red-900 border border-red-200 rounded-tl-sm"
            : message.isAI
            ? "bg-primary/10 text-foreground border border-primary/20 rounded-tl-sm"
            : "bg-card text-foreground border border-border rounded-tl-sm"
        }`}>
          {message.text}
        </div>

        {Object.keys(message.reactions).length > 0 && (
          <div className="flex flex-wrap gap-1">
            {Object.entries(message.reactions).map(([r, count]) => (
              <button key={r} onClick={() => onReact(message.id, r)}
                className="text-xs bg-muted/60 border border-border rounded-full px-2 py-0.5 hover:bg-muted transition-colors">
                {r} {count}
              </button>
            ))}
          </div>
        )}

        {hovering && !message.isAI && !isYou && (
          <div className="flex gap-1 flex-wrap mt-0.5">
            {REACTIONS.map((r) => (
              <button key={r} onClick={() => onReact(message.id, r)}
                className="text-xs bg-card border border-border rounded-full px-2 py-0.5 hover:bg-muted transition-colors text-muted-foreground">
                {r}
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
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce"
              style={{ animationDelay: `${i * 150}ms` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
