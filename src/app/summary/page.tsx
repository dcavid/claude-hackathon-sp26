"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Heart, Calendar, ArrowRight, BookOpen,
  Lightbulb, Target, Users, Mail, Check, Loader2, X,
} from "lucide-react";
import { DEMO_SUMMARY } from "@/lib/demo/seedData";

export default function SummaryPage() {
  const [emailState, setEmailState] = useState<"idle" | "open" | "sending" | "sent" | "error">("idle");
  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

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
          Session complete
        </Badge>
      </nav>

      <div className="max-w-2xl mx-auto px-8 pt-14 pb-16">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
            <BookOpen className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-3">Session Reflection</h1>
          <p className="text-muted-foreground">
            Here&apos;s what your circle explored today — and something to carry with you.
          </p>
        </div>

        {/* Themes */}
        <Card className="mb-5">
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

        {/* Personal takeaway */}
        <Card className="mb-5">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Heart className="w-4 h-4 text-primary" />
              </div>
              <h2 className="font-semibold text-foreground">For you personally</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{DEMO_SUMMARY.personalTakeaway}</p>
          </CardContent>
        </Card>

        {/* Group summary */}
        <Card className="mb-5">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <h2 className="font-semibold text-foreground">Group reflection</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{DEMO_SUMMARY.groupSummary}</p>
          </CardContent>
        </Card>

        {/* Next step */}
        <Card className="mb-8 border-2 border-primary/20 bg-primary/5">
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

        {/* Next session */}
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

        {/* Email reflection */}
        <Card className="mb-8 border border-border">
          <CardContent className="p-5">
            {emailState === "sent" ? (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Reflection sent</p>
                  <p className="text-xs text-muted-foreground">Check your inbox at {email}</p>
                </div>
              </div>
            ) : emailState === "open" || emailState === "sending" || emailState === "error" ? (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-foreground">Send reflection to your email</p>
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
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") sendEmail(); }}
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
                    <p className="text-sm font-medium text-foreground">Send to your email</p>
                    <p className="text-xs text-muted-foreground">Get your reflection in your inbox</p>
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
