# e-Hinga AI

AI agricultural expert for Rwandan farmers — Frontiers GenAI Hackathon.

**Demo story (3 minutes):** Farmer → Crop Doctor scan → visible AI reasoning → diagnosis → escalate → Officer priority feed.

## Architecture

```
Frontend (Next.js PWA)
        ↓
Django REST API  /api/v1/ai/...
        ↓
AI Orchestration Service
        ↓
Model Router → Gemini (vision / chat / voice)
```

UI never calls Google AI directly. Keys live in `.env` only (`GOOGLE_AI_API_KEY`).

## PostgreSQL setup

1. Create a free Postgres DB (Neon, Supabase, Railway, or Render).
2. Copy the connection string into `.env`:

```bash
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DBNAME?sslmode=require
```

3. Run:

```bash
./scripts/setup_db.sh
# or:
python manage.py migrate
python manage.py seed_demo
```

SQLite (`sqlite:///db.sqlite3`) works for local-only demos; use Postgres for the hackathon deploy.

## Phone video field scan

Phone uploads sample **5 frames on-device (Nano Banana)**, then Gemini analyzes those frames.
Full video is only uploaded if under 8 MB. Upload limit is **50 MB**.

## Quick start

### 1. Backend

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # set GOOGLE_AI_API_KEY
python manage.py migrate
python manage.py seed_demo
python manage.py runserver
```

### 2. Frontend

```bash
cd citizen-frontend
cp .env.local.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo accounts

| Role   | Phone          | Password  |
|--------|----------------|-----------|
| Farmer | +250788000001  | demo1234  |
| Officer| +250788000010  | demo1234  |

Farmer: Jean Habimana · maize land in Cyabararika, Musanze  
Officer: Alice Uwase · cell agronomist

## Judge demo script (40 seconds)

1. Open http://localhost:3000 → **Enter as Farmer** → login (`+250788000001` / `demo1234`)
2. Keep **Demo ON** for a guaranteed smooth path
3. See **Muraho Jean** + Farm Health Score 98%
4. Tap **Diagnose My Crop** → Analyze → escalate
5. Or **Field Video Sweep** → Nano Banana → Gemini locate crops + heatmap
6. Logout → portal → **Enter as Officer** (`+250788000010`) → priority feed

Optional wow: glowing FAB → WhatsApp-style chat → voice / photo messages with streaming replies.

## AI API

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/v1/ai/crop-scan/` | Multimodal crop diagnosis |
| POST | `/api/v1/ai/field-scan/` | Field video / frames sweep |
| POST | `/api/v1/ai/escalate/` | Create expert case |
| POST | `/api/v1/ai/voice/transcribe/` | Speech → text |
| POST | `/api/v1/ai/voice/speak/` | TTS hint (browser playback) |
| GET | `/api/v1/ai/officer/priority-feed/` | Officer AI alerts |

## Deferred (architecture hooks only)

Full multi-agent swarm, advanced RAG, offline-first, farming calendar, video field intelligence — stubs/comments in `ai/agents/` and model router (`FIELD_VIDEO`).

## Security

Never commit `.env` or API keys. Prefer `GOOGLE_AI_API_KEY` (alias: `GEMINI_API_KEY`).
