# Resonance — AI-Facilitated Peer Support Circles

> Voice-first. Emotionally safe. Human.

Resonance helps people join recurring support circles where AI facilitates peer conversations — structured, warm, and built on trust.

## Demo Flow

1. **Landing** (`/`) — Learn about Resonance, click "Join a Circle"
2. **Onboarding** (`/onboarding`) — Record a voice reflection or type what's on your mind. Select topics and support preferences.
3. **Pod Match** (`/match`) — AI matches you into a support circle based on your reflection themes.
4. **Live Session** (`/session`) — Join the live circle. Watch the demo conversation stream in. Use the right panel to:
   - Generate a facilitator prompt
   - Trigger the Safety Copilot
   - React to messages ("I relate", "I hear you", "Thank you for sharing")
5. **Summary** (`/summary`) — Post-session reflection: themes, personal takeaway, next step, next pod meeting.

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:3000 — no API keys required. The app falls back to smart mock responses.

## API Keys (Optional)

Copy `.env.local.example` to `.env.local` and fill in keys to enable real AI/voice:

```bash
cp .env.local.example .env.local
```

| Variable | Purpose |
|---|---|
| `GEMINI_API_KEY` | Gemini Flash for facilitation, safety, matching, summaries |
| `GOOGLE_SPEECH_API_KEY` | Google Speech-to-Text for voice transcription |
| `NEXT_PUBLIC_GOOGLE_TTS_API_KEY` | Google TTS for spoken facilitator interventions |

All features work without keys using mock responses that look real.

## Architecture

```
src/
├── app/
│   ├── page.tsx                  # Landing page
│   ├── onboarding/page.tsx       # Voice onboarding
│   ├── match/page.tsx            # Pod match
│   ├── session/page.tsx          # Live support circle (main demo)
│   ├── summary/page.tsx          # Post-session reflection
│   └── api/
│       ├── transcribe/route.ts   # Google Speech-to-Text (non-streaming)
│       ├── match/route.ts        # Gemini pod matching
│       ├── facilitate/route.ts   # Gemini facilitator prompts
│       ├── safety/route.ts       # Gemini safety analysis
│       └── summary/route.ts      # Gemini session summary
└── lib/
    ├── ai/
    │   ├── facilitator.ts        # generateFacilitatorPrompt()
    │   ├── safety.ts             # analyzeSafety()
    │   └── summary.ts            # generateSessionSummary()
    ├── voice/
    │   ├── onboardingTranscription.ts  # Non-real-time transcription
    │   ├── liveTranscription.ts        # Real-time/simulated transcription
    │   └── textToSpeech.ts             # Spoken facilitator (Google TTS / Web Speech)
    └── demo/
        └── seedData.ts           # Demo participants, transcript, pod data
```

## Tech Stack

- **Next.js 16 + TypeScript + Tailwind CSS + shadcn/ui**
- **Gemini Flash** — facilitation, safety analysis, pod matching, session summaries
- **Google Speech-to-Text** — async onboarding transcription
- **Google Text-to-Speech** — spoken facilitator interventions (with Web Speech API fallback)

## Design Principles

- **No real auth, no real DB** — this is a demo, not production
- **Every AI call has a mock fallback** — demo works completely offline
- **Voice-first** — onboarding uses audio recording; sessions support mic input
- **Safety-first language** — never diagnostic, never clinical, always warm
