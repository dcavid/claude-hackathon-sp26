"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Shield, Mic, Users, Sparkles, ArrowRight, MessageCircle, ClipboardList } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Heart className="w-4 h-4 text-primary" />
          </div>
          <span className="font-semibold text-lg tracking-tight text-foreground">Resonance</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">Therapist-led pods with AI support</span>
          <Link href="/onboarding">
            <Button size="sm" variant="outline">Find Your Pod</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-8 pt-24 pb-16 text-center">
        <Badge variant="secondary" className="mb-6 text-xs px-3 py-1">
          <Sparkles className="w-3 h-3 mr-1" />
          Therapist-led group care, AI-assisted
        </Badge>
        <h1 className="text-5xl font-bold leading-tight tracking-tight text-foreground mb-6">
          You don&apos;t have to carry it
          <br />
          <span className="text-primary">alone.</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10">
          Resonance matches people into small therapist-led pods, keeps support going through private group chat, and gives therapists an AI copilot for notes, moderation, and participation balance.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/onboarding">
            <Button size="lg" className="gap-2 px-8 text-base">
              Find Your Pod
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/session">
            <Button size="lg" variant="outline" className="gap-2 px-8 text-base">
              Preview a Session
            </Button>
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-8 py-16">
        <h2 className="text-2xl font-semibold text-center text-foreground mb-12">How Resonance works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StepCard
            number="01"
            icon={<Mic className="w-5 h-5 text-primary" />}
            title="Share what's on your mind"
            description="Record or type an intake reflection. Gemini and your selected topics help match you by lived context, not just broad labels."
          />
          <StepCard
            number="02"
            icon={<Users className="w-5 h-5 text-primary" />}
            title="Join a therapist-led pod"
            description="You are placed in a recurring pod of 4-6 people facing highly similar situations, with a licensed therapist facilitating the weekly session."
          />
          <StepCard
            number="03"
            icon={<MessageCircle className="w-5 h-5 text-primary" />}
            title="Stay connected between sessions"
            description="Your private pod chat stays open between meetings, while AI supports moderation and gives therapists session-ready insights."
          />
        </div>
      </section>

      {/* Values */}
      <section className="bg-muted/40 border-y border-border/50">
        <div className="max-w-5xl mx-auto px-8 py-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          <ValueCard
            icon={<Shield className="w-5 h-5 text-primary" />}
            title="Therapist-facing AI copilot"
            description="AI recommends moderation actions, flags participation imbalance, and drafts session notes for therapist review."
          />
          <ValueCard
            icon={<Heart className="w-5 h-5 text-primary" />}
            title="Emotionally safer structure"
            description="The therapist leads the pod. AI stays in the background and supports the session without replacing human judgment."
          />
          <ValueCard
            icon={<Sparkles className="w-5 h-5 text-primary" />}
            title="Voice-first intake"
            description="Deepgram handles voice capture for intake and session prep, so people can speak instead of filling out rigid forms."
          />
          <ValueCard
            icon={<ClipboardList className="w-5 h-5 text-primary" />}
            title="Progress and private journaling"
            description="Members get therapist-reviewed recaps, mock progress history in the demo, and a private journal space between sessions."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-2xl mx-auto px-8 py-24 text-center">
        <h2 className="text-3xl font-bold text-foreground mb-4">Ready to find your pod?</h2>
        <p className="text-muted-foreground mb-8">It starts with one intake reflection and ends in a therapist-led group that fits.</p>
        <Link href="/onboarding">
          <Button size="lg" className="gap-2 px-10 text-base">
            Get started
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 px-8 py-6 text-center text-sm text-muted-foreground">
        Resonance &mdash; Therapist-led pods, AI-assisted support &bull; Built as a demo prototype
      </footer>
    </div>
  );
}

function StepCard({ number, icon, title, description }: { number: string; icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-xs font-mono text-muted-foreground">{number}</span>
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">{icon}</div>
      </div>
      <h3 className="font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

function ValueCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex gap-4">
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">{icon}</div>
      <div>
        <h3 className="font-semibold text-foreground mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
