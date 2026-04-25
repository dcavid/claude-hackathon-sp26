"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Heart, Calendar, ArrowRight, BookOpen, Lightbulb, Target, Users, Mail, Check,
  Loader2, X, Shield, LineChart, NotebookPen,
} from "lucide-react";
import {
  DEMO_JOURNAL_PROMPTS,
  DEMO_PROGRESS_HISTORY,
  DEMO_SUMMARY,
  DEMO_THERAPIST,
} from "@/lib/demo/seedData";

const JOURNAL_KEY = "resonance_private_journal";

export default function SummaryPage() {
  const [emailState, setEmailState] = useState<"idle" | "open" | "sending" | "sent" | "error">("idle");
  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [journalEntry, setJournalEntry] = useState(() => {
    if (typeof window === "undefined") return "";
    return window.sessionStorage.getItem(JOURNAL_KEY) || "";
  });
  const [journalSaved, setJournalSaved] = useState(false);

  const sendEmail = async () => {
    if (!email.trim()) return;
    setEmailState("sending");
    setErrorMsg("");
    try {
      const res = await fetch("/api/send-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), summary: DEMO_SUMMARY }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send");
      setEmailState("sent");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
      setEmailState("error");
    }
  };

  const saveJournal = () => {
    window.sessionStorage.setItem(JOURNAL_KEY, journalEntry);
    setJournalSaved(true);
    window.setTimeout(() => setJournalSaved(false), 1600);
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="flex items-center justify-between px-8 py-5 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Heart className="w-4 h-4 text-primary" />
          </div>
          <span className="font-semibold text-lg tracking-tight">Resonance</span>
        </div>
        <Badge variant="secondary" className="text-xs">
          Therapist-reviewed recap
        </Badge>
      </nav>

      <div className="max-w-3xl mx-auto px-8 pt-14 pb-16">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
            <BookOpen className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-3">Pod Session Recap</h1>
          <p className="text-muted-foreground">
            Your member-facing recap was drafted with AI and reviewed by {DEMO_THERAPIST.name} before release.
          </p>
        </div>

        <Card className="mb-5 border-primary/20 bg-primary/5">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground mb-1">Release workflow</h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                  {DEMO_SUMMARY.therapistReviewStatus}
                </p>
                <p className="text-xs text-muted-foreground">{DEMO_SUMMARY.therapistReviewNote}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Lightbulb className="w-4 h-4 text-amber-600" />
                </div>
                <h2 className="font-semibold text-foreground">Key themes</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {DEMO_SUMMARY.themes.map((theme) => (
                  <Badge key={theme} variant="secondary" className="text-sm">
                    {theme}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <h2 className="font-semibold text-foreground">Group recap</h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{DEMO_SUMMARY.groupSummary}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-5">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Heart className="w-4 h-4 text-primary" />
              </div>
              <h2 className="font-semibold text-foreground">For you</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">{DEMO_SUMMARY.personalTakeaway}</p>
            <div className="space-y-2">
              {DEMO_SUMMARY.aiObservedPatterns.map((pattern) => (
                <div key={pattern} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/50 mt-1.5" />
                  <p className="text-sm text-muted-foreground">{pattern}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-5 border-2 border-primary/20 bg-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Target className="w-4 h-4 text-primary" />
              </div>
              <h2 className="font-semibold text-foreground">Suggested next step</h2>
            </div>
            <p className="text-sm text-foreground leading-relaxed font-medium">{DEMO_SUMMARY.nextStep}</p>
          </CardContent>
        </Card>

        <Card className="mb-5">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <LineChart className="w-4 h-4 text-emerald-700" />
              </div>
              <h2 className="font-semibold text-foreground">Mock progress history</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{DEMO_SUMMARY.participationTrend}</p>
            <div className="space-y-3">
              {DEMO_PROGRESS_HISTORY.map((item) => (
                <div key={item.label} className="rounded-xl border border-border/70 bg-card p-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">{item.label}</p>
                  <p className="text-sm font-medium text-foreground mb-1">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-5">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                <NotebookPen className="w-4 h-4 text-violet-700" />
              </div>
              <h2 className="font-semibold text-foreground">Private journal</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              This journal is private to the member in the demo. It is not shared back into the pod chat.
            </p>
            <div className="rounded-xl bg-muted/50 p-4 mb-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Suggested prompts</p>
              <div className="space-y-2">
                {DEMO_JOURNAL_PROMPTS.map((prompt) => (
                  <p key={prompt} className="text-sm text-muted-foreground">{prompt}</p>
                ))}
              </div>
            </div>
            <textarea
              value={journalEntry}
              onChange={(event) => setJournalEntry(event.target.value)}
              placeholder={DEMO_SUMMARY.journalPrompt}
              className="w-full min-h-[160px] resize-none rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary/40"
            />
            <div className="flex items-center justify-between mt-3">
              <p className="text-xs text-muted-foreground">Prompt: {DEMO_SUMMARY.journalPrompt}</p>
              <Button size="sm" onClick={saveJournal}>
                {journalSaved ? "Saved" : "Save journal"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <Calendar className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Next pod meeting</p>
                <p className="font-semibold text-foreground">{DEMO_SUMMARY.nextSession}</p>
              </div>
              <Badge variant="outline" className="ml-auto text-xs">Scheduled</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8 border border-border">
          <CardContent className="p-5">
            {emailState === "sent" ? (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Recap sent</p>
                  <p className="text-xs text-muted-foreground">Check your inbox at {email}</p>
                </div>
              </div>
            ) : emailState === "open" || emailState === "sending" || emailState === "error" ? (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-foreground">Send recap to your email</p>
                  <button
                    onClick={() => { setEmailState("idle"); setErrorMsg(""); }}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    onKeyDown={(event) => { if (event.key === "Enter") sendEmail(); }}
                    placeholder="you@example.com"
                    className="flex-1 bg-muted/50 rounded-lg px-3 py-2 text-sm outline-none border border-transparent focus:border-primary/40 placeholder:text-muted-foreground"
                    autoFocus
                  />
                  <Button
                    size="sm"
                    onClick={sendEmail}
                    disabled={!email.trim() || emailState === "sending"}
                    className="gap-1.5 shrink-0"
                  >
                    {emailState === "sending" ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Mail className="w-3.5 h-3.5" />
                    )}
                    {emailState === "sending" ? "Sending..." : "Send"}
                  </Button>
                </div>
                {emailState === "error" && (
                  <p className="text-xs text-destructive mt-2">{errorMsg}</p>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Send recap to your email</p>
                    <p className="text-xs text-muted-foreground">The reviewed member recap can be sent after therapist approval</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setEmailState("open")}>
                  Send
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Link href="/" className="flex-1">
            <Button variant="outline" className="w-full">Back to home</Button>
          </Link>
          <Link href="/session" className="flex-1">
            <Button className="w-full gap-2">
              Replay session
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
