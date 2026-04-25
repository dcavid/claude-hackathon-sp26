"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Calendar, Clock, Heart, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { DEMO_POD } from "@/lib/demo/seedData";

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

function MatchContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [selectedPodId, setSelectedPodId] = useState<string>(() => {
    if (typeof window === "undefined") return DEMO_POD.name;
    const stored = window.sessionStorage.getItem("resonance_selected_pod");
    if (!stored) return "career-burnout-pod";
    try {
      const pod = JSON.parse(stored) as PodOption;
      return pod.id;
    } catch {
      return "career-burnout-pod";
    }
  });

  const themes = (() => {
    if (typeof window === "undefined") return DEMO_POD.sharedThemes;
    const stored = window.sessionStorage.getItem("resonance_match_themes");
    if (!stored) return DEMO_POD.sharedThemes;
    try {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : DEMO_POD.sharedThemes;
    } catch {
      return DEMO_POD.sharedThemes;
    }
  })();

  const podOptions: PodOption[] = (() => {
    if (typeof window === "undefined") {
      return [fallbackPod()];
    }
    const stored = window.sessionStorage.getItem("resonance_match_pods");
    if (!stored) return [fallbackPod()];
    try {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : [fallbackPod()];
    } catch {
      return [fallbackPod()];
    }
  })();

  const selectedPod = podOptions.find((pod) => pod.id === selectedPodId) || podOptions[0];

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1800);
    return () => clearTimeout(timer);
  }, []);

  const choosePod = (pod: PodOption) => {
    setSelectedPodId(pod.id);
    window.sessionStorage.setItem("resonance_selected_pod", JSON.stringify(pod));
    window.sessionStorage.setItem("resonance_theme", pod.sharedThemes.join(", "));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-7 h-7 text-primary animate-pulse" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Building your pod options...</h2>
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

      <div className="max-w-5xl mx-auto px-8 pt-16 pb-12">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-3">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-700">Pod options ready</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-3">Choose the pod that fits best</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Your intake may overlap with more than one theme, so the demo now offers multiple therapist-led pods.
            We still mark the strongest match as recommended.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.3fr_0.9fr] gap-6">
          <div className="space-y-4">
            {podOptions.map((pod, index) => {
              const isSelected = pod.id === selectedPod.id;
              const isRecommended = index === 0;
              return (
                <button
                  key={pod.id}
                  type="button"
                  onClick={() => choosePod(pod)}
                  className={`w-full text-left rounded-3xl border transition-all ${
                    isSelected
                      ? "border-primary shadow-lg ring-2 ring-primary/15"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  <Card className="border-0 shadow-none">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div>
                          {isRecommended && <Badge variant="secondary" className="mb-3 text-xs">Recommended pod</Badge>}
                          {!isRecommended && <Badge variant="outline" className="mb-3 text-xs">Alternative option</Badge>}
                          <h2 className="text-2xl font-bold text-foreground">{pod.name}</h2>
                          <p className="text-muted-foreground text-sm mt-2 leading-relaxed">{pod.description}</p>
                        </div>
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                          <Users className="w-6 h-6 text-primary" />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-5">
                        <StatItem icon={<Users className="w-4 h-4" />} label="Members" value={`${pod.memberCount} members`} />
                        <StatItem icon={<Calendar className="w-4 h-4" />} label="Format" value={pod.meetingType} />
                        <StatItem icon={<Clock className="w-4 h-4" />} label="Next session" value={pod.nextSession} />
                      </div>

                      <div className="mb-5 rounded-xl border border-border/70 bg-card p-4">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Why this fits</p>
                        <p className="text-sm text-muted-foreground">{pod.fitReason}</p>
                      </div>

                      <div className="mb-5 rounded-xl border border-border/70 bg-card p-4">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Between sessions</p>
                        <p className="text-sm text-muted-foreground">{pod.chatDescription}</p>
                      </div>

                      <div className="bg-muted/50 rounded-xl p-4">
                        <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">Shared themes in this pod</p>
                        <div className="flex flex-wrap gap-2">
                          {pod.sharedThemes.map((theme) => (
                            <Badge key={theme} variant="outline" className="text-sm capitalize">
                              {theme}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </button>
              );
            })}
          </div>

          <div className="space-y-4">
            <Card className="border-2 border-primary/20 shadow-lg">
              <CardContent className="p-6">
                <Badge variant="secondary" className="mb-3 text-xs">Current selection</Badge>
                <h2 className="text-xl font-bold text-foreground mb-2">{selectedPod.name}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{selectedPod.description}</p>
                <div className="space-y-3">
                  <div className="rounded-xl bg-muted/40 p-4">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Top intake themes</p>
                    <div className="flex flex-wrap gap-2">
                      {themes.map((theme) => (
                        <Badge key={theme} variant="secondary" className="text-xs capitalize">{theme}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl bg-muted/40 p-4">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Fit score</p>
                    <p className="text-sm font-medium text-foreground">{Math.round(selectedPod.fitScore * 100)}% match</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <p className="text-sm font-medium text-muted-foreground mb-4">Who&apos;s in this pod</p>
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
              Enter Pod Workspace
              <ArrowRight className="w-4 h-4" />
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Your selected pod will carry into the demo session workspace
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function fallbackPod(): PodOption {
  return {
    id: "career-burnout-pod",
    name: DEMO_POD.name,
    description: DEMO_POD.description,
    sharedThemes: DEMO_POD.sharedThemes,
    memberCount: DEMO_POD.memberCount,
    meetingType: DEMO_POD.meetingType,
    nextSession: DEMO_POD.nextSession,
    chatDescription: DEMO_POD.chatDescription,
    fitReason: "This is the default demo pod when no intake-specific match is available.",
    fitScore: 0.82,
  };
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
