# Ubuhinzi / e-Hinga AI — Demo Production Guide

## 1. Prerequisites (run before demo day)

```bash
# 1. Backend
cp .env.example .env              # Fill in DATABASE_URL + GOOGLE_AI_API_KEY
source .venv/bin/activate
bash scripts/setup_db.sh          # migrate + seed demo users
python manage.py runserver 0.0.0.0:8000

# 2. Frontend
cd citizen-frontend
cp .env.local.example .env.local  # Set NEXT_PUBLIC_API_URL=http://localhost:8000
npm install
npm run dev                       # opens at http://localhost:3000
```

Verify all 5 demo cases work before recording.

---

## 2. Demo Flow — 3-Minute Video Script

### Act 1 — Farmer Onboarding + Diagnosis (0:00–0:45)

| Time | Screen | Narrator script |
|------|--------|----------------|
| 0:00 | Portal chooser | *"Meet Jean Habimana, a smallholder farmer in Musanze, Rwanda. His maize is failing and he doesn't know why. He opens Ubuhinzi on his basic smartphone."* |
| 0:05 | Farmer Login (pre-filled) | Tap **"Farmer portal"** → phone already filled → tap **"Continue as Farmer"** |
| 0:10 | Onboarding — crop type | *"Jean picks his crop — maize — and the app instantly connects him to Rwanda's AI agronomist."* |
| 0:18 | Home screen (scan actions) | *"Three options: snap a photo, sweep a video of his field, or chat with the AI in Kinyarwanda."* |
| 0:22 | Tap **"Snap a Photo"** | *"He uploads a photo of a diseased leaf from his gallery."* |
| 0:27 | Diagnosis loading — "thinking" animation | *"In seconds, Gemini analyzes the visual symptoms, cross-referencing with known crop diseases in East Africa."* |
| 0:38 | Diagnosis result — Northern Corn Leaf Blight, 96% confidence | *"Northern Corn Leaf Blight — 96% confidence. AI shows exactly which areas are affected and gives Jean a treatment plan in Kinyarwanda."* |

### Act 2 — Escalation + Officer Response (0:45–1:30)

| Time | Screen | Narrator script |
|------|--------|----------------|
| 0:45 | Diagnosis card → tap **"Escalate to Officer"** | *"The disease is aggressive. Jean taps 'Call My Agriculture Officer' to alert the cell agronomist immediately."* |
| 0:52 | Escalation animation (step-by-step progress) | *"AI packages the diagnosis, finds Jean's local officer Alice Uwase, and sends a priority alert with GPS location and AI summary."* |
| 1:00 | Escalation done — Officer contact card (Alice Uwase) | *"Alice is notified. Jean can call her directly with one tap."* |
| 1:05 | Switch to **Officer Portal** — login with Alice's credentials | *"Meanwhile, Officer Alice Uwase logs into her Command Center and sees a live priority feed of AI-flagged cases in her cell."* |
| 1:20 | Priority Feed with multiple alerts | *"The AI has already triaged: Northern Corn Leaf Blight at 96% severity at the top, followed by a suspected fungal infection on tomatoes. Alice dispatches field inspection teams based on AI recommendations."* |

### Act 3 — Field Video Scan + Chat (1:30–2:30)

| Time | Screen | Narrator script |
|------|--------|----------------|
| 1:30 | Go back to Farmer → tap **"Sweep Your Field"** | *"Back on Jean's phone, he can also walk through his field while recording a short video for AI analysis."* |
| 1:37 | Record/upload video → AI analyzing | *"Gemini processes each frame, identifying the spatial spread of the infection across his plot."* |
| 1:48 | Field scan result — heatmap overlay | *"A heatmap shows 18% of his field affected. The AI recommends targeted spraying of just the infected zone — saving money and reducing chemical use."* |
| 2:00 | Tap **"AI Chat"** → WhatsApp-style interface | *"Jean can also have a conversation with the AI in Kinyarwanda — asking follow-up questions like 'How much fungicide should I apply?'"* |
| 2:10 | Type / voice question → streaming AI reply | *"The AI speaks back in Kinyarwanda with voice synthesis. It remembers the diagnosis context and gives personalized, actionable advice."* |
| 2:30 | Chat shows treatment plan | *"From detection to treatment to expert escalation — all in under 2 minutes on a basic smartphone, offline-capable, in the farmer's own language."* |

### Act 4 — Close (2:30–3:00)

| Time | Screen | Narrator script |
|------|--------|----------------|
| 2:35 | Officer map view or dashboard | *"For the Ministry of Agriculture, Ubuhinzi provides real-time disease surveillance across every cell in Rwanda — enabling early outbreak detection and targeted extension services."* |
| 2:50 | Logo + URL | *"Ubuhinzi: AI-powered agriculture for every Rwandan farmer. Visit ubuhinzi.rw"* |

---

## 3. Recording Setup

| Tool | Recommendation |
|------|---------------|
| **Screen capture** | **OBS Studio** (free, macOS/Windows) — 1920×1080, 30 fps. Crop to mobile viewport (390×844 iPhone 14 Pro). |
| **Microphone** | Any USB mic or AirPods. Record narration separately, not live. |
| **Editing** | DaVinci Resolve (free) or CapCut (quick). Add captions for accessibility. |
| **Demo device** | Chrome DevTools mobile emulation (iPhone 14 Pro) — or a real Android phone mirrored to desktop via scrcpy. |
| **Pre-canned responses** | Demo mode is **ON by default** — the app uses `src/lib/demo-data.ts` for scripted AI responses. No Gemini API key required for the demo flow. |

### OBS Quick Setup for Mobile Demo

1. Open Chrome → DevTools (`Cmd+Option+I`) → Toggle Device Toolbar → Pick "iPhone 14 Pro"
2. In OBS: Add a "Window Capture" source → pick Chrome → hold `Option` to crop to the 390×844 frame
3. Add a white iPhone frame PNG overlay (optional, from `assets/`)
4. Record at 30 fps, H.264, 20 Mbps

---

## 4. What to Show / What to Skip

### MUST SHOW (in order):

1. ✅ **Farmer login with pre-filled credentials** (speed, no fumbling)
2. ✅ **Crop diagnosis from photo** (the core AI feature — show the "thinking" animation, then the result with confidence %)
3. ✅ **Escalation to officer** (demonstrates the farmer→government pipeline)
4. ✅ **Officer Priority Feed** (shows real-time dashboard, triage by severity)
5. ✅ **Field video scan with heatmap** (most visually impressive — the heatmap overlay wows audiences)

### NICE TO SHOW (if time permits):

6. ✅ **AI Chat in Kinyarwanda with voice** (WhatsApp-style interface is familiar and impressive)
7. ✅ **Language toggle** (EN ↔ RW — shows localization)

### SKIP (or mention only):

- ❌ Login form typing (use pre-filled)
- ❌ Offline "Nano Banana" mode (mention as a footnote: "works without internet")
- ❌ Registration / forgot password
- ❌ Backend code or terminal windows (never show during a demo)

---

## 5. Emergency Fallback Plan

| If… | Then… |
|-----|-------|
| Gemini API is rate-limited / down | **Demo mode is on by default.** The app serves scripted responses. No API key needed. |
| Database not seeded | Run `bash scripts/setup_db.sh` — takes 2 seconds |
| Frontend build fails | Use `npm run dev` (dev mode) — no build step needed |
| Network drops | The chat page uses hardcoded fallback responses. Show offline mode badge. |
| OBS crashes | QuickTime Player → File → New Screen Recording → select Chrome window |

---

## 6. Key Talking Points (for Q&A)

| Question | Answer |
|----------|--------|
| "Is this using real AI or canned?" | *"The app connects to Google Gemini for real-time multimodal analysis. For demo reliability, we've pre-loaded 5 realistic cases. In production, every scan hits the live model."* |
| "How is this different from Plantix?" | *"Ubuhinzi is built for Rwanda's extension system — it doesn't just diagnose, it escalates to the government cell agronomist and aggregates data for the Ministry of Agriculture. It works offline. It speaks Kinyarwanda."* |
| "What about data privacy?" | *"All data is encrypted in transit and at rest. Farmer data belongs to the farmer. The Ministry only sees anonymized aggregate disease surveillance."* |
| "Can it work on basic phones?" | *"Yes — the PWA works on any Android phone with Chrome, requires no app store install, and the offline 'Nano Banana' mode runs a distilled AI model locally."* |
| "What's the business model?" | *"Government SaaS for disease surveillance + free tier for farmers. Premium tier for agri-businesses (cooperatives, exporters) for crop intelligence."* |

---

## 7. Post-Demo Follow-up

- Share the live URL (if deployed) or a recorded MP4
- Include a 1-page PDF with screenshots of each key screen
- Offer to run a live session with the judges' own photos
