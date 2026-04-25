"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, Square, Heart, ArrowRight, Check, Loader2, Shield, Users, MessageCircleHeart } from "lucide-react";

const LIFE_CHALLENGES = [
  "Grief",
  "Depression",
  "Trauma",
  "Addiction",
  "Major life stress",
  "Loneliness",
];

const TOPIC_CHIPS = [
  "Pet loss",
  "Burnout",
  "Loneliness",
  "Life transitions",
  "Caregiving stress",
  "Relationships",
  "Anxiety",
  "Identity shifts",
];

const SUPPORT_PREFS = [
  { id: "processing", label: "Space to process" },
  { id: "structure", label: "Structured support" },
  { id: "peer-support", label: "Support between sessions" },
  { id: "gentle-advice", label: "Gentle practical advice" },
];

const PRIVACY_PREFS = [
  "Use my first name",
  "Use a chosen display name",
  "Keep camera off by default",
];

const GROUP_SIZES = ["4-6 people", "6-8 people", "No strong preference"];
const ROLE_PREFS = ["I want support", "I want to help others too", "Both"];
const COMMUNICATION_STYLES = ["Venting", "Listening", "Reflection", "Advice"];

type RecordingState = "idle" | "recording" | "recorded" | "transcribing";

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

export default function OnboardingPage() {
  const router = useRouter();
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [transcript, setTranscript] = useState("");
  const [lifeChallenge, setLifeChallenge] = useState("Grief");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedPrefs, setSelectedPrefs] = useState<string[]>([]);
  const [privacyPreference, setPrivacyPreference] = useState("Use my first name");
  const [preferredGroupSize, setPreferredGroupSize] = useState("4-6 people");
  const [rolePreference, setRolePreference] = useState("I want support");
  const [communicationStyle, setCommunicationStyle] = useState<string[]>(["Listening", "Reflection"]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setRecordingState("transcribing");
        try {
          const formData = new FormData();
          formData.append("audio", blob, "reflection.webm");
          const res = await fetch("/api/transcribe", { method: "POST", body: formData });
          const data = await res.json();
          setTranscript(data.transcript || "");
        } catch {
          setTranscript("I've been feeling upset over my dog's death and it has been harder than I expected to get through the day-to-day routines.");
        }
        setRecordingState("recorded");
      };

      recorder.start();
      setRecordingState("recording");
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime((time) => time + 1), 1000);
    } catch {
      setTranscript("I've been feeling upset over my dog's death and it has been harder than I expected to get through the day-to-day routines.");
      setRecordingState("recorded");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    mediaRecorderRef.current?.stop();
  }, []);

  const toggleTopic = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((item) => item !== topic) : [...prev, topic]
    );
  };

  const togglePref = (pref: string) => {
    setSelectedPrefs((prev) =>
      prev.includes(pref) ? prev.filter((item) => item !== pref) : [...prev, pref]
    );
  };

  const toggleCommunicationStyle = (style: string) => {
    setCommunicationStyle((prev) =>
      prev.includes(style) ? prev.filter((item) => item !== style) : [...prev, style]
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const profilePayload = {
      lifeChallenge,
      topics: selectedTopics,
      supportPreferences: selectedPrefs,
      privacyPreference,
      preferredGroupSize,
      rolePreference,
      communicationStyle,
    };

    try {
      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript,
          lifeChallenge,
          topics: selectedTopics,
          preferences: selectedPrefs,
          privacyPreference,
          preferredGroupSize,
          rolePreference,
          communicationStyle,
        }),
      });
      const data = await res.json();
      const themes = data.themes || selectedTopics;
      const podOptions = Array.isArray(data.podOptions) ? data.podOptions : [];
      const recommendedPod = data.recommendedPod || podOptions[0] || null;

      sessionStorage.setItem("resonance_theme", [...themes, ...selectedTopics].join(", ") || "support, grief, and life transitions");
      sessionStorage.setItem("resonance_transcript", transcript || "");
      sessionStorage.setItem("resonance_match_themes", JSON.stringify(themes));
      sessionStorage.setItem("resonance_match_pods", JSON.stringify(podOptions));
      sessionStorage.setItem("resonance_onboarding_profile", JSON.stringify(profilePayload));
      if (recommendedPod) {
        sessionStorage.setItem("resonance_selected_pod", JSON.stringify(recommendedPod as PodOption));
      }
      router.push("/match");
    } catch {
      sessionStorage.setItem("resonance_onboarding_profile", JSON.stringify(profilePayload));
      router.push("/match");
    }
  };

  const canSubmit = transcript.trim().length > 0 || selectedTopics.length > 0;
  const fmtTime = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(190,160,130,0.14),_transparent_38%),linear-gradient(to_bottom,_rgba(255,252,247,1),_rgba(248,243,238,1))]">
      <nav className="flex items-center px-8 py-5 border-b border-border/50 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Heart className="w-4 h-4 text-primary" />
          </div>
          <span className="font-semibold text-lg tracking-tight">Resonance</span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 md:px-8 pt-10 pb-24">
        <div className="mb-10">
          <Badge variant="secondary" className="mb-4 text-xs">Onboarding questionnaire</Badge>
          <h1 className="text-4xl font-bold text-foreground mb-3">Let&apos;s find the right group fit.</h1>
          <p className="text-muted-foreground leading-relaxed max-w-2xl">
            This demo intake captures the life challenge, specific experience, support preferences, privacy preferences,
            group size, role, and communication style that will shape pod matching.
          </p>
        </div>

        <div className="grid gap-5">
          <Card className="rounded-3xl border border-border/70 bg-white/85 shadow-[0_18px_60px_-35px_rgba(90,67,45,0.25)] backdrop-blur">
            <CardContent className="p-6 md:p-7">
              <div className="flex items-start gap-3 mb-5">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Life challenge</h2>
                  <p className="text-sm text-muted-foreground">What broad challenge best describes what is bringing you here?</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {LIFE_CHALLENGES.map((challenge) => (
                  <button
                    key={challenge}
                    onClick={() => setLifeChallenge(challenge)}
                    className={`px-4 py-2 rounded-full text-sm border transition-all ${
                      lifeChallenge === challenge
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-card text-muted-foreground border-border hover:border-primary/50"
                    }`}
                  >
                    {challenge}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border border-border/70 bg-white/85 shadow-[0_18px_60px_-35px_rgba(90,67,45,0.25)] backdrop-blur">
            <CardContent className="p-6 md:p-7">
              <div className="flex items-start gap-3 mb-5">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Mic className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Specific experience</h2>
                  <p className="text-sm text-muted-foreground">Record or type what has been happening in your own words.</p>
                </div>
              </div>

              <div className="rounded-2xl border-2 border-dashed border-border bg-muted/30 p-6 flex flex-col items-center mb-5">
                {recordingState === "idle" && (
                  <>
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-5">
                      <Mic className="w-9 h-9 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-5 text-center">
                      Tap to record your intake reflection. Deepgram will transcribe it for the demo.
                    </p>
                    <Button onClick={startRecording} className="gap-2">
                      <Mic className="w-4 h-4" />
                      Start recording
                    </Button>
                  </>
                )}

                {recordingState === "recording" && (
                  <>
                    <div className="relative mb-5">
                      <div className="recording-ring w-20 h-20 rounded-full bg-red-100 absolute inset-0" />
                      <div className="w-20 h-20 rounded-full bg-red-500 flex items-center justify-center relative">
                        <div className="flex gap-1 items-end h-6">
                          {[1, 2, 3, 4, 5].map((index) => (
                            <div key={index} className="wave-bar w-1.5 bg-white rounded-full h-6" />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-foreground mb-1">Recording... {fmtTime(recordingTime)}</p>
                    <p className="text-xs text-muted-foreground mb-5">Speak naturally — we&apos;re listening</p>
                    <Button variant="outline" onClick={stopRecording} className="gap-2">
                      <Square className="w-4 h-4 fill-current" />
                      Stop recording
                    </Button>
                  </>
                )}

                {recordingState === "transcribing" && (
                  <>
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-5">
                      <Loader2 className="w-9 h-9 text-primary animate-spin" />
                    </div>
                    <p className="text-sm text-muted-foreground">Transcribing your reflection...</p>
                  </>
                )}

                {recordingState === "recorded" && (
                  <>
                    <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-5">
                      <Check className="w-9 h-9 text-green-600" />
                    </div>
                    <p className="text-sm font-medium text-green-700 mb-4">Reflection recorded</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { setRecordingState("idle"); setTranscript(""); }}
                      className="text-muted-foreground text-xs"
                    >
                      Re-record
                    </Button>
                  </>
                )}
              </div>

              <label className="text-sm font-medium text-foreground block mb-2">Reflection</label>
              <Textarea
                value={transcript}
                onChange={(event) => setTranscript(event.target.value)}
                placeholder="I’m feeling upset over my dog's death and I keep getting hit by it in really ordinary moments..."
                className="min-h-[120px] resize-none text-sm rounded-2xl bg-background/70"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Gemini uses this reflection plus your selections to match relevant therapist-led pods.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border border-border/70 bg-white/85 shadow-[0_18px_60px_-35px_rgba(90,67,45,0.25)] backdrop-blur">
            <CardContent className="p-6 md:p-7">
              <div className="flex items-start gap-3 mb-5">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <MessageCircleHeart className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Topics and support preferences</h2>
                  <p className="text-sm text-muted-foreground">Choose the topics and support style that should shape your pod experience.</p>
                </div>
              </div>

              <div className="mb-6">
                <label className="text-sm font-medium text-foreground block mb-3">Relevant topics</label>
                <div className="flex flex-wrap gap-2">
                  {TOPIC_CHIPS.map((topic) => (
                    <button
                      key={topic}
                      onClick={() => toggleTopic(topic)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                        selectedTopics.includes(topic)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card text-muted-foreground border-border hover:border-primary/50"
                      }`}
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-3">Support preferences</label>
                <div className="grid grid-cols-2 gap-2">
                  {SUPPORT_PREFS.map((pref) => (
                    <button
                      key={pref.id}
                      onClick={() => togglePref(pref.id)}
                      className={`p-3 rounded-2xl text-sm border text-left transition-all ${
                        selectedPrefs.includes(pref.id)
                          ? "bg-primary/10 border-primary text-primary"
                          : "bg-card border-border text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      {selectedPrefs.includes(pref.id) && <Check className="w-3 h-3 inline mr-1.5" />}
                      {pref.label}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-5">
            <Card className="rounded-3xl border border-border/70 bg-white/85 shadow-[0_18px_60px_-35px_rgba(90,67,45,0.25)] backdrop-blur">
              <CardContent className="p-6 md:p-7">
                <div className="flex items-start gap-3 mb-5">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">Privacy and group fit</h2>
                    <p className="text-sm text-muted-foreground">Set how you want to show up and how large the pod should feel.</p>
                  </div>
                </div>

                <div className="mb-5">
                  <label className="text-sm font-medium text-foreground block mb-3">Privacy preference</label>
                  <div className="space-y-2">
                    {PRIVACY_PREFS.map((pref) => (
                      <button
                        key={pref}
                        onClick={() => setPrivacyPreference(pref)}
                        className={`w-full p-3 rounded-2xl text-sm border text-left transition-all ${
                          privacyPreference === pref
                            ? "bg-primary/10 border-primary text-primary"
                            : "bg-card border-border text-muted-foreground hover:border-primary/40"
                        }`}
                      >
                        {privacyPreference === pref && <Check className="w-3 h-3 inline mr-1.5" />}
                        {pref}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground block mb-3">Preferred group size</label>
                  <div className="flex flex-wrap gap-2">
                    {GROUP_SIZES.map((size) => (
                      <button
                        key={size}
                        onClick={() => setPreferredGroupSize(size)}
                        className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                          preferredGroupSize === size
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-card text-muted-foreground border-border hover:border-primary/50"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border border-border/70 bg-white/85 shadow-[0_18px_60px_-35px_rgba(90,67,45,0.25)] backdrop-blur">
              <CardContent className="p-6 md:p-7">
                <div className="flex items-start gap-3 mb-5">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">Role and communication style</h2>
                    <p className="text-sm text-muted-foreground">Tell us whether you want support, want to help, or both, and how you like to engage.</p>
                  </div>
                </div>

                <div className="mb-5">
                  <label className="text-sm font-medium text-foreground block mb-3">Role in group spaces</label>
                  <div className="space-y-2">
                    {ROLE_PREFS.map((role) => (
                      <button
                        key={role}
                        onClick={() => setRolePreference(role)}
                        className={`w-full p-3 rounded-2xl text-sm border text-left transition-all ${
                          rolePreference === role
                            ? "bg-primary/10 border-primary text-primary"
                            : "bg-card border-border text-muted-foreground hover:border-primary/40"
                        }`}
                      >
                        {rolePreference === role && <Check className="w-3 h-3 inline mr-1.5" />}
                        {role}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground block mb-3">Communication style</label>
                  <div className="flex flex-wrap gap-2">
                    {COMMUNICATION_STYLES.map((style) => (
                      <button
                        key={style}
                        onClick={() => toggleCommunicationStyle(style)}
                        className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                          communicationStyle.includes(style)
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-card text-muted-foreground border-border hover:border-primary/50"
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Button
          className="w-full gap-2 text-base py-6 mt-8 rounded-2xl shadow-[0_16px_40px_-24px_rgba(113,83,56,0.6)]"
          disabled={!canSubmit || isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Matching you to therapist-led pods...</>
          ) : (
            <><ArrowRight className="w-4 h-4" /> Continue to pod options</>
          )}
        </Button>
      </div>
    </div>
  );
}
