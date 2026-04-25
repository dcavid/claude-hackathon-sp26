// Text-to-speech for spoken facilitator interventions.
// Uses Google TTS if API key is available, falls back to Web Speech API.

export async function speak(text: string, voice?: string): Promise<void> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_TTS_API_KEY;

  if (apiKey) {
    await speakWithGoogleTTS(text, apiKey, voice);
  } else {
    speakWithWebSpeech(text);
  }
}

async function speakWithGoogleTTS(text: string, apiKey: string, voice?: string): Promise<void> {
  const res = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: { text },
        voice: {
          languageCode: "en-US",
          name: voice || "en-US-Neural2-F",
          ssmlGender: "FEMALE",
        },
        audioConfig: { audioEncoding: "MP3", speakingRate: 0.95, pitch: -1 },
      }),
    }
  );

  if (!res.ok) {
    speakWithWebSpeech(text);
    return;
  }

  const data = await res.json();
  const audioContent = data.audioContent;
  const audioBlob = new Blob(
    [Uint8Array.from(atob(audioContent), (c) => c.charCodeAt(0))],
    { type: "audio/mp3" }
  );
  const url = URL.createObjectURL(audioBlob);
  const audio = new Audio(url);
  await audio.play();
  audio.onended = () => URL.revokeObjectURL(url);
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
