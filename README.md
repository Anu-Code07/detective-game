<p align="center">
  <img src="public/images/hero-detective-office.png" alt="Case Files" width="100%" />
</p>

<h1 align="center">Case Files</h1>
<p align="center"><strong>AI-Powered Detective Investigation Simulator</strong></p>
<p align="center">
  <em>Not a chatbot. Not a visual novel. A realistic homicide investigation platform.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Groq-Llama_3.3-f55036?style=flat-square" />
  <img src="https://img.shields.io/badge/Supabase-Cloud-3FCF8E?style=flat-square&logo=supabase&logoColor=white" />
</p>

---

## Product Demo

**Case Files** is a premium web game where players solve self-contained criminal cases through evidence, interrogation, and deduction. The AI never reveals the answer — players must prove guilt beyond reasonable doubt.

### Live Experience Flow

```
Receive Case → Read FIR → Study Crime Scene → Collect Evidence
     → Interview Witnesses → Interrogate Suspects → Analyze Reports
          → Build Timeline → Connect Evidence → Develop Theory
               → Request Warrants → Search Locations → Prepare Chargesheet
                    → Submit Accusation → Receive Court Verdict
```

### What Makes It Different

| Feature | Case Files | Typical AI Games |
|---------|------------|------------------|
| Solution | Hidden rule engine + evidence gates | AI can leak answers |
| Suspects | Groq LLM with guardrails & memory | Random chatbot replies |
| Cases | 5 standalone, logically solvable puzzles | One endless thread |
| Evidence | Forensics, documents, CCTV, financials | Text-only clues |
| Verdict | Scored court simulation | Win/lose binary |

---

## Case Roster

Each case is **fully self-contained** — inspired by true crime patterns, entirely fictional.

| # | Case | Difficulty | Crime Type | Est. Time |
|---|------|------------|------------|-----------|
| 1 | **The Meridian Ledger** | Easy | Corporate garage homicide | ~35 min |
| 2 | **Blood Tide** | Medium | Harbor container murder | ~45 min |
| 3 | **The Lilac Room** | Medium | Philanthropist poisoning | ~50 min |
| 4 | **Ash and Embers** | Hard | Arson-disguised homicide | ~55 min |
| 5 | **The Last Broadcast** | Hard | Journalist execution | ~60 min |

<p align="center">
  <img src="public/images/case-01-meridian-ledger.png" width="32%" />
  <img src="public/images/case-02-blood-tide.png" width="32%" />
  <img src="public/images/case-03-lilac-room.png" width="32%" />
</p>

---

## Tech Stack

### Frontend
- **Next.js 15** (App Router) — SSR, API routes, image optimization
- **React 19** + **TypeScript** — type-safe case engine
- **Tailwind CSS v4** — dark cinematic glassmorphism UI
- **Framer Motion** — premium page transitions
- **Zustand** — investigation state + local persistence
- **React Flow** — interactive evidence case board

### AI Layer
- **Groq API** (`llama-3.3-70b-versatile`) — suspect interrogation dialogue
- **Rule engine** — fact tracking, contradiction detection, solution guardrails
- **Sanitization layer** — blocks solution leaks, meta-prompt injection
- **Auto-categorization** — notebook notes sorted by AI (facts, motives, contradictions)

### Backend & Data
- **Next.js API Routes** — `/api/interrogate`, `/api/notebook`, `/api/cases`
- **Supabase** — optional cloud save for player progress
- **LocalStorage** — offline-first investigation saves via Zustand persist

### Assets
- **AI-generated cinematic imagery** — hero, case covers, crime scene evidence photos
- Authentic document styling — FIR, autopsy, lab reports, bank subpoenas

---

## Architecture

```
src/
├── app/                    # Next.js pages & API
│   ├── page.tsx            # Landing / product hero
│   ├── cases/              # Case file archive
│   ├── investigate/[id]/   # Detective dashboard
│   └── api/                # Groq interrogation, notebook AI
├── components/investigation/
│   ├── OverviewPanel       # Case briefing
│   ├── EvidencePanel       # Evidence locker + photos
│   ├── DocumentsPanel      # Police files (FIR, autopsy, etc.)
│   ├── InterrogatePanel    # Groq-powered suspect room
│   ├── CaseBoardPanel      # React Flow evidence graph
│   ├── TimelinePanel       # Contradiction tracking
│   ├── ChargesheetPanel    # Final accusation builder
│   └── VerdictPanel        # Court scoring
├── lib/
│   ├── cases/              # 5 case definitions (extensible)
│   ├── case-engine/        # Verdict scoring, state logic
│   └── ai/                 # Groq client + guardrails
├── store/game-store.ts     # Zustand investigation state
└── types/case.ts           # Full case schema
```

### Adding a New Case

```typescript
// src/lib/cases/case-06-your-case.ts
export const case06 = defineCase(6, {
  meta: { id: "case-06-...", title: "...", coverImage: "/images/..." },
  suspects: [...],
  evidence: [...],
  documents: [...],
  solution: { guiltyPartyId: "...", requiredEvidence: [...] },
});

// src/lib/cases/index.ts
export const ALL_CASES = [..., case06];
```

---

## Detective Dashboard

| Section | Description |
|---------|-------------|
| **Briefing** | FIR summary, victim profile, detective notes |
| **Evidence Locker** | Physical, digital, forensic items with crime scene photos |
| **Documents** | FIR, autopsy, toxicology, bank records, CCTV logs |
| **Suspects** | Profiles, stress/truthfulness meters, alibis |
| **Witnesses** | Imperfect testimonies to cross-reference |
| **Interrogate** | Ask anything, present evidence, AI reacts emotionally |
| **Timeline** | Interactive chronology with contradiction flags |
| **Case Board** | Drag-connect evidence, people, events |
| **Map** | Search locations, unlock hidden evidence |
| **Notebook** | AI-organized facts, questions, motives |
| **Chargesheet** | Build prosecution case, submit to court |
| **Verdict** | Logic, evidence quality, efficiency scoring |

---

## Quick Start

```bash
git clone <repo>
cd case-files
cp .env.example .env
```

```env
GROQ_API_KEY=your_groq_key
GROQ_MODEL=llama-3.3-70b-versatile
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
```

```bash
npm install
npm run dev
```

Open **http://localhost:3000**

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | Yes | Groq API key for suspect interrogation |
| `GROQ_MODEL` | No | Default: `llama-3.3-70b-versatile` |
| `NEXT_PUBLIC_SUPABASE_URL` | No | Supabase project URL for cloud saves |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | No | Supabase publishable key |

---

## Core Philosophy

- Players **never** simply ask AI "who is the killer?"
- AI **never** reveals the solution
- Every mystery is **solvable through evidence**
- Every suspect has **believable motivations**
- No random guessing — **fair puzzles only**

---

## Scoring

Players are graded on:

- **Logic** — theory coherence
- **Evidence Quality** — critical vs circumstantial
- **Efficiency** — investigation time
- **Accuracy** — correct suspect
- **Court Success** — charges hold up against defense challenges

---

## Disclaimer

All cases are fictional narratives inspired by documented crime patterns. No real persons, events, or copyrighted content are depicted.

---

<p align="center">
  <strong>Case Files</strong> — Built for detectives, not spectators.
</p>
