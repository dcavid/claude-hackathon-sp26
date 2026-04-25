// Text-to-speech for spoken facilitator interventions.
// Uses the server-side Deepgram route when available, falls back to Web Speech.

let speechQueue: Promise<void> = Promise.resolve();

export async function speak(text: string, voice?: string): Promise<void> {
  speechQueue = speechQueue
    .catch(() => {})
    .then(async () => {
      const played = await speakWithDeepgram(text, voice);
      if (!played) {
        await speakWithWebSpeech(text);
      }
      await wait(350);
    });

  return speechQueue;
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
  await audio.play();
  await new Promise<void>((resolve, reject) => {
    audio.onended = () => {
      URL.revokeObjectURL(url);
      resolve();
    };
    audio.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Audio playback failed"));
    };
  }).catch(() => {
    throw new Error("Audio playback failed");
  });
  return true;
}

function speakWithWebSpeech(text: string): Promise<void> {
  if (typeof window === "undefined" || !window.speechSynthesis) return Promise.resolve();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.9;
  utterance.pitch = 1.0;
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find((v) => v.name.includes("Samantha") || v.name.includes("Karen") || v.lang === "en-US");
  if (preferred) utterance.voice = preferred;
  return new Promise((resolve, reject) => {
    utterance.onend = () => resolve();
    utterance.onerror = () => reject(new Error("Speech synthesis failed"));
    window.speechSynthesis.speak(utterance);
  });
}

function wait(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
}
