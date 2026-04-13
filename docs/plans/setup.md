# Setup Plan

## Decisions Made

- **SSR mode** — loaders/actions run on Node server; Drizzle needs direct Postgres connection, admin ops need service role key
- **Drizzle migrations → `supabase/migrations/`** — one migration folder, `supabase db reset` runs everything
- **Hand-written trigger migration** for `profiles` auto-create (Drizzle can't manage triggers)
- **`supabase init` from project root** — `supabase/` lives alongside `app/`

## Setup Phases

### Phase 1 — Local Supabase
- [x] `supabase init`
- [x] `supabase start` (custom ports to avoid conflicts)
- [x] Copy credentials → `.env`

### Phase 2 — Drizzle
- [x] `pnpm add drizzle-orm postgres`
- [x] `pnpm add -D drizzle-kit`
- [x] Create `drizzle.config.ts` (`out: ./supabase/migrations`, `verbose`, `strict`, `timestamp` prefix)
- [x] Create `app/db/schema/*.ts` (profiles, events, activities, invitations, rsvps)
- [x] Create `app/db/index.ts` (Drizzle client)
- [x] `pnpm drizzle-kit generate`

### Phase 3 — Profile Trigger
- [x] `supabase migration new profile-trigger`
- [x] Write trigger SQL

### Phase 4 — Apply & Verify
- [x] `supabase db reset`
- [x] Verify tables in Studio (`localhost:54423`)

### Phase 5 — Supabase Auth Wiring
- [x] `pnpm add @supabase/supabase-js @supabase/ssr`
- [x] Create `app/lib/supabase.server.ts`
- [x] Create `app/lib/supabase.client.ts`
- [x] Create `app/lib/auth.server.ts`
