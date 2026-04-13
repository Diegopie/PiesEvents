# 🎂 30th Birthday Party

A birthday party planning site where guests can view events, discover activities, and RSVP.

## Stack

| Layer         | Choice                                              |
| ------------- | --------------------------------------------------- |
| **Framework** | React Router v7 (framework mode, SSR)               |
| **ORM**       | Drizzle                                             |
| **Database**  | PostgreSQL (Supabase free tier)                     |
| **Auth**      | Supabase email OTP + `is_admin` in JWT app_metadata |
| **Hosting**   | Heroku (hobby plan)                                 |
| **PWA**       | Service worker + web app manifest (TBD)             |

## Data Model

```
profiles
  ├── id (UUID, PK + FK → auth.users.id), display_name, phone, avatar_url

events
  ├── id, created_by (FK → profiles), name, description, start_date, end_date, location, published

activities
  ├── id, event_id (FK → events), created_by (FK → profiles)
  ├── name, description, start_time, end_time, location
  ├── published, public, max_capacity, sort_order

event_invitations       — who can see which event         PK(user_id, event_id)
activity_invitations    — who can see exclusive activities PK(user_id, activity_id)
rsvps                   — guest responses                 PK(user_id, activity_id)
  ├── status (going | not_going | maybe), plus_count, note
```

> Full schema, visibility queries, and cascade behavior: [`docs/data-model.md`](docs/data-model.md)

### Key Decisions

- **No `users` table** — email in `auth.users`, display info in `profiles`, admin flag in JWT `app_metadata`
- **No event-level RSVPs** — event attendance derived from activity RSVPs
- **`published`** on events + activities — draft/live control for admin
- **`public`** on activities only — event visibility is purely invitation-based
- **Composite PKs** on join tables — enforces one invitation/RSVP per user at DB level
- **Pre-create auth users** on invite via Supabase admin API — clean FKs everywhere

## Setup

```bash
pnpm install
pnpm dev
```

## Development

- `pnpm dev` — Start dev server
- `pnpm build` — Production build
- `pnpm start` — Serve production build
- `pnpm typecheck` — Run type checking
