"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Shield, Mic, Users, Sparkles, ArrowRight, MessageCircle } from "lucide-react";

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
          <span className="text-sm text-muted-foreground">A safe space for peer support</span>
          <Link href="/onboarding">
            <Button size="sm" variant="outline">Join a Circle</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-8 pt-24 pb-16 text-center">
        <Badge variant="secondary" className="mb-6 text-xs px-3 py-1">
          <Sparkles className="w-3 h-3 mr-1" />
          AI-facilitated peer support
        </Badge>
        <h1 className="text-5xl font-bold leading-tight tracking-tight text-foreground mb-6">
          You don&apos;t have to carry it
          <br />
          <span className="text-primary">alone.</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10">
          Resonance helps people join recurring support circles where AI facilitates emotionally safe peer conversations — structured, human, and built on trust.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/onboarding">
            <Button size="lg" className="gap-2 px-8 text-base">
              Join a Circle
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
            description="Record a short voice reflection. Our AI listens and understands the themes and support style that fits you."
          />
          <StepCard
            number="02"
            icon={<Users className="w-5 h-5 text-primary" />}
            title="Get matched to your circle"
            description="You're placed in a small, recurring trust pod with people navigating similar experiences."
          />
          <StepCard
            number="03"
            icon={<MessageCircle className="w-5 h-5 text-primary" />}
            title="Meet with AI facilitation"
            description="Your pod meets weekly. AI quietly guides the conversation, ensures everyone is heard, and keeps the space safe."
          />
        </div>
      </section>

      {/* Values */}
      <section className="bg-muted/40 border-y border-border/50">
        <div className="max-w-5xl mx-auto px-8 py-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          <ValueCard
            icon={<Shield className="w-5 h-5 text-primary" />}
            title="Safety Copilot"
            description="AI monitors for moments of distress and offers grounding support — never diagnostic, always human."
          />
          <ValueCard
            icon={<Heart className="w-5 h-5 text-primary" />}
            title="Emotionally safe by design"
            description="Every session ends with a reflection summary. You leave with clarity, not just conversation."
          />
          <ValueCard
            icon={<Sparkles className="w-5 h-5 text-primary" />}
            title="Voice-first"
            description="Speak your truth. Voice captures nuance that forms can't — and it's how real support begins."
          />
          <ValueCard
            icon={<Users className="w-5 h-5 text-primary" />}
            title="Recurring pods"
            description="Real support takes time. Your circle meets weekly so relationships and trust can deepen over time."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-2xl mx-auto px-8 py-24 text-center">
        <h2 className="text-3xl font-bold text-foreground mb-4">Ready to find your circle?</h2>
        <p className="text-muted-foreground mb-8">It starts with one voice reflection. No forms, no pressure.</p>
        <Link href="/onboarding">
          <Button size="lg" className="gap-2 px-10 text-base">
            Get started
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 px-8 py-6 text-center text-sm text-muted-foreground">
        Resonance &mdash; A safe space for peer support &bull; Built with care
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
