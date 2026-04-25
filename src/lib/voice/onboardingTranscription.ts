// Non-real-time transcription for onboarding voice reflections.
// Uploads completed audio blob and transcribes once.

export async function transcribeRecordedReflection(audioBlob: Blob): Promise<string> {
  const formData = new FormData();
  formData.append("audio", audioBlob, "reflection.webm");

  const res = await fetch("/api/transcribe", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`Transcription failed: ${res.status}`);
  }

  const data = await res.json();
  return data.transcript ?? "";
}
