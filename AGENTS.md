# AGENTS.md

## Cursor Cloud specific instructions

**Case Files** is a single Next.js 15 (App Router) + React 19 + TypeScript web app (an AI detective game). There is no monorepo, no backend service beyond the Next.js API routes, and no local database. Node 22 is available; `npm` is the package manager (see `package-lock.json`).

### Services
- **Next.js app** (only service): frontend UI + API routes (`/api/cases`, `/api/interrogate`, `/api/notebook`). Standard commands are in `package.json`: `npm run dev` (port 3000), `npm run build`, `npm run start`, `npm run lint`.

### Non-obvious notes
- Copy env before running: `cp .env.example .env` (gitignored). The app boots fine with empty values.
- **Groq is only needed for the Interrogate and Notebook AI features.** `GROQ_API_KEY` (and optional `GROQ_MODEL`) power `/api/interrogate` and `/api/notebook`; without a key those endpoints return errors, but the rest of the game works. Set `GROQ_API_KEY` as a secret to test interrogation.
- **Supabase is optional and currently unused by the app flow.** The client wrappers (`src/lib/supabase/`) and `supabase/schema.sql` exist but are not imported; game state persists offline via Zustand + browser LocalStorage. No local DB setup is required to play/test end to end.
- Core gameplay (cases list, evidence, documents, timeline, case board, chargesheet, verdict scoring) is fully offline — a complete end-to-end playthrough needs only `npm run dev`.
