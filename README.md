# Resonance — Therapist-Led Pods, AI-Assisted

> Structured group care. Private pod support. AI behind the scenes.

Resonance is a demo prototype for matching people into therapist-led support pods, keeping support going through private group chat, and giving therapists an AI copilot for notes, moderation, participation balance, and recap drafting.

## Demo Flow

1. **Landing** (`/`) — Learn the product positioning: therapist-led pods with AI support.
2. **Onboarding** (`/onboarding`) — Record or type an intake reflection, then choose relevant topics and support preferences.
3. **Pod Match** (`/match`) — Gemini matches the member into a pod based on reflection context, not just broad categories.
4. **Session Workspace** (`/session`) — The therapist leads the pod session while the right panel acts as a therapist workspace for:
   - facilitator guidance recommendations
   - moderation and safety suggestions
   - participation balance signals
   - therapist review workflow cues
5. **Summary + Journal** (`/summary`) — Member-facing recap after therapist review, mocked progress history, and a private journal area.

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:3000. The app falls back to mock responses when API keys are missing.

## API Keys (Optional)

Create a `.env` or `.env.local` file in the project root to enable real AI and voice services:

```bash
cp .env.example .env.local
```

| Variable | Purpose |
|---|---|
| `GEMINI_API_KEY` | Gemini Flash for intake matching, therapist guidance suggestions, safety analysis, and recap drafting |
| `DEEPGRAM_API_KEY` | Deepgram Speech-to-Text for onboarding/session transcription and Text-to-Speech support |

All features work without keys using mock responses that look real.

## Architecture

```
src/
├── app/
│   ├── page.tsx                  # Landing page
│   ├── onboarding/page.tsx       # Voice onboarding
│   ├── match/page.tsx            # Pod match
│   ├── session/page.tsx          # Therapist-led pod session + AI workspace
│   ├── summary/page.tsx          # Therapist-reviewed member recap + private journal
│   └── api/
│       ├── transcribe/route.ts   # Deepgram Speech-to-Text (non-streaming)
│       ├── speak/route.ts        # Deepgram Text-to-Speech proxy
│       ├── match/route.ts        # Gemini pod matching
│       ├── facilitate/route.ts   # Gemini therapist guidance suggestions
│       ├── safety/route.ts       # Gemini safety analysis
│       └── summary/route.ts      # Gemini recap drafting
└── lib/
    ├── ai/
    │   ├── facilitator.ts        # generateFacilitatorPrompt()
    │   ├── safety.ts             # analyzeSafety()
    │   └── summary.ts            # generateSessionSummary()
    ├── voice/
    │   ├── onboardingTranscription.ts  # Non-real-time transcription
    │   ├── liveTranscription.ts        # Real-time/simulated transcription
    │   └── textToSpeech.ts             # Spoken facilitator (Deepgram TTS / Web Speech)
    └── demo/
        └── seedData.ts           # Demo pod, therapist, recap, and progress data
```

## Tech Stack

- **Next.js 16 + TypeScript + Tailwind CSS + shadcn/ui**
- **Gemini Flash** — intake matching, therapist guidance suggestions, safety analysis, recap drafting
- **Deepgram Speech-to-Text** — async onboarding and session transcription
- **Deepgram Text-to-Speech** — available for voice support experiments in the demo

## Design Principles

- **No real auth, no real DB** — this is a demo, not production
- **Every AI call has a mock fallback** — demo works completely offline
- **Therapist remains in charge** — AI recommends actions, but the therapist leads the session and reviews member-facing notes
- **Voice-first intake** — onboarding uses audio recording; sessions support mic input
- **Private journaling** — journal content is member-only in the demo
