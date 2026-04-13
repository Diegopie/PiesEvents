# Setup Plan

## Decisions Made

- **SSR mode** — loaders/actions run on Node server; Drizzle needs direct Postgres connection, admin ops need service role key
- **Drizzle migrations → `supabase/migrations/`** — one migration folder, `supabase db reset` runs everything
- **Hand-written trigger migration** for `profiles` auto-create (Drizzle can't manage triggers)
- **`supabase init` from project root** — `supabase/` lives alongside `app/`

## Setup Phases

### Phase 1 — Local Supabase
- [ ] `supabase init`
- [ ] `supabase start` (stop other instances if port conflict)
- [ ] Copy credentials → `.env`

### Phase 2 — Drizzle
- [ ] `pnpm add drizzle-orm postgres`
- [ ] `pnpm add -D drizzle-kit`
- [ ] Create `drizzle.config.ts` (`out: ./supabase/migrations`)
- [ ] Create `app/db/schema/*.ts` (profiles, events, activities, invitations, rsvps)
- [ ] Create `app/db/index.ts` (Drizzle client)
- [ ] `pnpm drizzle-kit generate`

### Phase 3 — Profile Trigger
- [ ] `supabase migration new profile-trigger`
- [ ] Write trigger SQL

### Phase 4 — Apply & Verify
- [ ] `supabase db reset`
- [ ] Verify tables in Studio (`localhost:54323`)

### Phase 5 — Supabase Auth Wiring
- [ ] `pnpm add @supabase/supabase-js @supabase/ssr`
- [ ] Create `app/lib/supabase.server.ts`
- [ ] Create `app/lib/supabase.client.ts`
- [ ] Create `app/lib/auth.server.ts`
