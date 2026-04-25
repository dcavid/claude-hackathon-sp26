// Text-to-speech for spoken facilitator interventions.
// Uses the server-side Deepgram route when available, falls back to Web Speech.

export async function speak(text: string, voice?: string): Promise<void> {
  const played = await speakWithDeepgram(text, voice);
  if (!played) speakWithWebSpeech(text);
}

async function speakWithDeepgram(text: string, voice?: string): Promise<boolean> {
  const res = await fetch("/api/speak", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, voice }),
  }).catch(() => null);

  if (!res?.ok) return false;

  const audioBlob = await res.blob();
  const url = URL.createObjectURL(audioBlob);
  const audio = new Audio(url);
  await audio.play().catch(() => {
    URL.revokeObjectURL(url);
    throw new Error("Audio playback failed");
  });
  audio.onended = () => URL.revokeObjectURL(url);
  return true;
}

function speakWithWebSpeech(text: string): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.9;
  utterance.pitch = 1.0;
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find((v) => v.name.includes("Samantha") || v.name.includes("Karen") || v.lang === "en-US");
  if (preferred) utterance.voice = preferred;
  window.speechSynthesis.speak(utterance);
}
