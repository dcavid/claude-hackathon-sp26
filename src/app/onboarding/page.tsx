"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, Square, Heart, ArrowRight, Check, Loader2 } from "lucide-react";

const TOPIC_CHIPS = [
  "Grief",
  "Burnout",
  "Loneliness",
  "Life transitions",
  "Trauma",
  "Relationships",
  "Anxiety",
  "Caregiving stress",
];

const SUPPORT_PREFS = [
  { id: "listening", label: "I want space to process" },
  { id: "structure", label: "I want a structured session" },
  { id: "peer-support", label: "I want peer support between meetings" },
  { id: "support-others", label: "I also want to support others" },
];

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
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedPrefs, setSelectedPrefs] = useState<string[]>([]);
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

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setRecordingState("transcribing");
        try {
          const formData = new FormData();
          formData.append("audio", blob, "reflection.webm");
          const res = await fetch("/api/transcribe", { method: "POST", body: formData });
          const data = await res.json();
          setTranscript(data.transcript || "");
        } catch {
          setTranscript("I've been feeling like everyone around me is doing more than me and like I don't belong here.");
        }
        setRecordingState("recorded");
      };

      recorder.start();
      setRecordingState("recording");
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000);
    } catch {
      setTranscript("I've been feeling like everyone around me is doing more than me and like I don't belong here.");
      setRecordingState("recorded");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    mediaRecorderRef.current?.stop();
  }, []);

  const toggleTopic = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  const togglePref = (id: string) => {
    setSelectedPrefs((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, topics: selectedTopics, preferences: selectedPrefs }),
      });
      const data = await res.json();
      const themes = data.themes || selectedTopics;
      const podOptions = Array.isArray(data.podOptions) ? data.podOptions : [];
      const recommendedPod = data.recommendedPod || podOptions[0] || null;
      // Pass context to session page via sessionStorage
      const themeString = [...themes, ...selectedTopics].join(", ");
      sessionStorage.setItem("resonance_theme", themeString || "support, grief, and life transitions");
      sessionStorage.setItem("resonance_transcript", transcript || "");
      sessionStorage.setItem("resonance_match_themes", JSON.stringify(themes));
      sessionStorage.setItem("resonance_match_pods", JSON.stringify(podOptions));
      if (recommendedPod) {
        sessionStorage.setItem("resonance_selected_pod", JSON.stringify(recommendedPod as PodOption));
      }
      router.push("/match");
    } catch {
      router.push("/match");
    }
  };

  const canSubmit = transcript.trim().length > 0 || selectedTopics.length > 0;
  const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

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

      <div className="max-w-xl mx-auto px-8 pt-14 pb-16">
        {/* Header */}
        <div className="mb-10">
          <Badge variant="secondary" className="mb-4 text-xs">Step 1 of 2</Badge>
          <h1 className="text-3xl font-bold text-foreground mb-3">What&apos;s been on your mind lately?</h1>
          <p className="text-muted-foreground leading-relaxed">
            Share a short intake reflection or type below. We use this to match you into a therapist-led pod with people facing similar challenges.
          </p>
        </div>

        {/* Voice recorder */}
        <Card className="mb-6 border-2 border-dashed border-border">
          <CardContent className="p-8 flex flex-col items-center">
            {recordingState === "idle" && (
              <>
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-5">
                  <Mic className="w-9 h-9 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground mb-5 text-center">
                  Tap to record your intake reflection — usually 30–60 seconds
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
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="wave-bar w-1.5 bg-white rounded-full h-6" />
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
          </CardContent>
        </Card>

        {/* Transcript / text fallback */}
        <div className="mb-6">
          <label className="text-sm font-medium text-foreground block mb-2">
            {recordingState === "recorded" ? "Your reflection (edit if needed)" : "Or type your reflection"}
          </label>
          <Textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="I've been feeling like everyone around me is doing more than me..."
            className="min-h-[100px] resize-none text-sm"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Demo note: voice is transcribed with Deepgram, and Gemini uses your reflection plus selected topics for pod matching.
          </p>
        </div>

        {/* Topics */}
        <div className="mb-6">
          <label className="text-sm font-medium text-foreground block mb-3">What topics feel most relevant?</label>
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

        {/* Support preferences */}
        <div className="mb-10">
          <label className="text-sm font-medium text-foreground block mb-3">What kind of support would help most?</label>
          <div className="grid grid-cols-2 gap-2">
            {SUPPORT_PREFS.map((pref) => (
              <button
                key={pref.id}
                onClick={() => togglePref(pref.id)}
                className={`p-3 rounded-xl text-sm border text-left transition-all ${
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

        <Button
          className="w-full gap-2 text-base py-6"
          disabled={!canSubmit || isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Finding your circle...</>
          ) : (
            <><ArrowRight className="w-4 h-4" /> Find My Circle</>
          )}
        </Button>
      </div>
    </div>
  );
}
