# 🎂 30th Birthday Party

A birthday party planning site where guests can view events, discover activities, and RSVP.

## Stack

| Layer         | Choice                                              |
| ------------- | --------------------------------------------------- |
| **Framework** | React Router v7 (framework mode, SPA — no SSR)     |
| **ORM**       | Drizzle                                             |
| **Database**  | PostgreSQL (Supabase free tier)                     |
| **Auth**      | Supabase email OTP + `is_admin` in JWT app_metadata |
| **Hosting**   | Heroku (hobby plan)                                 |
| **PWA**       | Service worker + web app manifest (TBD)             |

## Data Model

```
users
  ├── id, name, email, phone

events
  ├── id, name, description, date, location, is_public

activities
  ├── id, event_id (FK → events), name, description, start_time, location, is_public

event_invitations       — who can see which event
  ├── user_id (FK), event_id (FK)

activity_invitations    — who can see which exclusive activity
  ├── user_id (FK), activity_id (FK)

rsvps
  ├── user_id (FK), activity_id (FK), status (going | not_going | maybe)
```

### Visibility Rules

- A guest sees an **event** only if they have a row in `event_invitations`
- A guest sees an **activity** if:
  - `is_public = true` AND they're invited to the parent event, **OR**
  - They have an explicit row in `activity_invitations`
- This allows exclusive/hidden activities within a public event

### Auth Flow

- Everyone logs in via **Supabase email OTP** (magic code)
- Admin (host) has `is_admin: true` set in Supabase `app_metadata` → included in JWT
- Loaders/actions check the JWT claim to gate admin routes

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
