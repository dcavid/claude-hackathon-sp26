// Real-time / simulated streaming transcription for live pod sessions.
// In production this would use Google Speech-to-Text streaming via WebSocket.
// For demo purposes this simulates live transcription from mic input.

export interface LiveTranscriptChunk {
  text: string;
  isFinal: boolean;
  confidence?: number;
}

export type TranscriptCallback = (chunk: LiveTranscriptChunk) => void;

export interface LiveTranscriptionSession {
  stop: () => void;
}

export async function startLiveTranscription(
  sessionId: string,
  onTranscript: TranscriptCallback
): Promise<LiveTranscriptionSession> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_SPEECH_API_KEY;

  if (!apiKey) {
    return startSimulatedTranscription(sessionId, onTranscript);
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
    let active = true;

    mediaRecorder.ondataavailable = async (event) => {
      if (!active || event.data.size === 0) return;

      const formData = new FormData();
      formData.append("audio", event.data, "chunk.webm");
      formData.append("sessionId", sessionId);

      try {
        const res = await fetch("/api/transcribe", { method: "POST", body: formData });
        const data = await res.json();
        if (data.transcript) {
          onTranscript({ text: data.transcript, isFinal: true, confidence: data.confidence });
        }
      } catch { /* silent drop */ }
    };

    mediaRecorder.start(3000); // chunk every 3s

    return {
      stop: () => {
        active = false;
        mediaRecorder.stop();
        stream.getTracks().forEach((t) => t.stop());
      },
    };
  } catch {
    return startSimulatedTranscription(sessionId, onTranscript);
  }
}

function startSimulatedTranscription(
  _sessionId: string,
  onTranscript: TranscriptCallback
): LiveTranscriptionSession {
  // Demo: simulate incremental transcription with demo phrases
  const phrases = [
    "I've been feeling like everyone around me is doing more than me.",
    "I keep comparing myself to classmates and feeling behind.",
    "I act more confident than I actually feel.",
    "I mostly want to listen today, but I relate to what's being said.",
    "It helps to remember that people only show their polished versions.",
  ];

  let idx = 0;
  let stopped = false;
  let partial = "";
  let charIdx = 0;

  const tickPartial = () => {
    if (stopped || idx >= phrases.length) return;
    const phrase = phrases[idx];
    if (charIdx < phrase.length) {
      partial += phrase[charIdx];
      charIdx++;
      onTranscript({ text: partial, isFinal: false });
      setTimeout(tickPartial, 60);
    } else {
      onTranscript({ text: partial, isFinal: true, confidence: 0.95 });
      partial = "";
      charIdx = 0;
      idx++;
      if (idx < phrases.length) setTimeout(tickPartial, 3000);
    }
  };

  setTimeout(tickPartial, 1500);

  return { stop: () => { stopped = true; } };
}
