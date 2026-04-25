"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Calendar, Clock, Heart, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { DEMO_POD } from "@/lib/demo/seedData";
import { Suspense } from "react";

function MatchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [themes, setThemes] = useState<string[]>([]);

  useEffect(() => {
    const t = searchParams.get("themes");
    if (t) {
      try { setThemes(JSON.parse(t)); } catch { setThemes(DEMO_POD.sharedThemes); }
    } else {
      setThemes(DEMO_POD.sharedThemes);
    }
    const timer = setTimeout(() => setLoading(false), 1800);
    return () => clearTimeout(timer);
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-7 h-7 text-primary animate-pulse" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Finding your circle...</h2>
          <p className="text-muted-foreground text-sm">Matching themes and support style</p>
          <div className="flex gap-1.5 justify-center mt-6">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-primary/40"
                style={{ animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="flex items-center px-8 py-5 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Heart className="w-4 h-4 text-primary" />
          </div>
          <span className="font-semibold text-lg tracking-tight">Resonance</span>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-8 pt-16 pb-12">
        {/* Match found header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-3">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-700">Circle found</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-3">You have a match</h1>
          <p className="text-muted-foreground">
            Based on your reflection, we found a circle where you&apos;ll feel at home.
          </p>
        </div>

        {/* Pod card */}
        <Card className="border-2 border-primary/20 shadow-lg mb-6">
          <CardContent className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <Badge variant="secondary" className="mb-3 text-xs">Recommended pod</Badge>
                <h2 className="text-2xl font-bold text-foreground">{DEMO_POD.name}</h2>
                <p className="text-muted-foreground text-sm mt-1">{DEMO_POD.description}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 ml-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <StatItem icon={<Users className="w-4 h-4" />} label="Members" value={`${DEMO_POD.memberCount} people`} />
              <StatItem icon={<Calendar className="w-4 h-4" />} label="Format" value={DEMO_POD.meetingType} />
              <StatItem icon={<Clock className="w-4 h-4" />} label="Next session" value={DEMO_POD.nextSession} />
            </div>

            {/* Shared themes */}
            <div className="bg-muted/50 rounded-xl p-4">
              <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">Shared themes in this circle</p>
              <div className="flex flex-wrap gap-2">
                {(themes.length > 0 ? themes : DEMO_POD.sharedThemes).map((theme) => (
                  <Badge key={theme} variant="outline" className="text-sm capitalize">
                    {theme}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Members preview */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground mb-4">Who&apos;s in this circle</p>
            <div className="flex items-center gap-3">
              {["David", "Maya", "Jordan", "Priya"].map((name) => (
                <div key={name} className="flex flex-col items-center gap-1.5">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                    {name[0]}
                  </div>
                  <span className="text-xs text-muted-foreground">{name}</span>
                </div>
              ))}
              <div className="flex flex-col items-center gap-1.5 ml-2">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground">
                  +1
                </div>
                <span className="text-xs text-muted-foreground">more</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button
          className="w-full gap-2 text-base py-6"
          onClick={() => router.push("/session")}
        >
          Enter Circle
          <ArrowRight className="w-4 h-4" />
        </Button>
        <p className="text-center text-xs text-muted-foreground mt-3">
          Session begins when all members check in
        </p>
      </div>
    </div>
  );
}

export default function MatchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-pulse text-muted-foreground">Loading...</div></div>}>
      <MatchContent />
    </Suspense>
  );
}

function StatItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-muted/40 rounded-xl p-3">
      <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
