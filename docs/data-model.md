# Data Model

> Finalized: April 2026 — v3

## Overview

```
auth.users (Supabase-managed)
  └─── profiles
         ├─── events (via created_by)
         │      └─── activities
         ├─── event_invitations
         ├─── activity_invitations
         └─── rsvps
```

All `id` columns are UUIDs. All timestamps are `timestamptz`.

---

## Tables

### `profiles`

Public-facing user data. PK is the same UUID as `auth.users.id` — no separate `auth_id` column needed.

| Column       | Type         | Constraints                              |
| ------------ | ------------ | ---------------------------------------- |
| id           | UUID         | PK, FK → auth.users.id ON DELETE CASCADE |
| display_name | text         | not null                                 |
| phone        | text         | nullable                                 |
| avatar_url   | text         | nullable                                 |
| created_at   | timestamptz  | default now()                            |
| updated_at   | timestamptz  | default now()                            |

- Email lives in `auth.users` — not duplicated here
- Admin flag lives in `auth.users.raw_app_meta_data.is_admin` — not duplicated here
- A database trigger on `auth.users` INSERT auto-creates the profile row

### `events`

Top-level container for a group of activities.

| Column      | Type        | Constraints                        |
| ----------- | ----------- | ---------------------------------- |
| id          | UUID        | PK, default gen_random_uuid()      |
| created_by  | UUID        | FK → profiles.id, not null         |
| name        | text        | not null                           |
| description | text        | nullable                           |
| start_date  | timestamptz | not null                           |
| end_date    | timestamptz | nullable                           |
| location    | text        | nullable                           |
| published   | boolean     | default false                      |
| created_at  | timestamptz | default now()                      |
| updated_at  | timestamptz | default now()                      |

- No `is_public` — event visibility is controlled entirely by `event_invitations`
- `published = false` → draft, only visible to admin
- `published = true` → live, visible to invited guests

### `activities`

Individual things within an event (dinner, party, brunch, etc.).

| Column       | Type        | Constraints                                   |
| ------------ | ----------- | --------------------------------------------- |
| id           | UUID        | PK, default gen_random_uuid()                 |
| event_id     | UUID        | FK → events.id ON DELETE CASCADE, not null     |
| created_by   | UUID        | FK → profiles.id, not null                    |
| name         | text        | not null                                      |
| description  | text        | nullable                                      |
| start_time   | timestamptz | not null                                      |
| end_time     | timestamptz | nullable                                      |
| location     | text        | nullable                                      |
| published    | boolean     | default false                                 |
| public       | boolean     | default true                                  |
| max_capacity | integer     | nullable                                      |
| sort_order   | integer     | default 0                                     |
| created_at   | timestamptz | default now()                                 |
| updated_at   | timestamptz | default now()                                 |

- `published = false` → draft, only visible to admin
- `public = true` → visible to all event invitees
- `public = false` → exclusive, requires an `activity_invitations` row
- `max_capacity` → nullable, for future headcount limits

### `event_invitations`

Controls who can see which event. Composite primary key.

| Column     | Type        | Constraints                                |
| ---------- | ----------- | ------------------------------------------ |
| user_id    | UUID        | FK → profiles.id ON DELETE CASCADE         |
| event_id   | UUID        | FK → events.id ON DELETE CASCADE           |
| invited_at | timestamptz | default now()                              |

- **PK(user_id, event_id)**

### `activity_invitations`

Controls who can see exclusive (non-public) activities. Composite primary key.

| Column      | Type        | Constraints                                |
| ----------- | ----------- | ------------------------------------------ |
| user_id     | UUID        | FK → profiles.id ON DELETE CASCADE         |
| activity_id | UUID        | FK → activities.id ON DELETE CASCADE       |
| invited_at  | timestamptz | default now()                              |

- **PK(user_id, activity_id)**
- Only needed for activities where `public = false`

### `rsvps`

Guest responses to activities. Composite primary key — one RSVP per user per activity.

| Column       | Type        | Constraints                                |
| ------------ | ----------- | ------------------------------------------ |
| user_id      | UUID        | FK → profiles.id ON DELETE CASCADE         |
| activity_id  | UUID        | FK → activities.id ON DELETE CASCADE       |
| status       | enum        | `going`, `not_going`, `maybe`              |
| plus_count   | integer     | default 0                                  |
| note         | text        | nullable                                   |
| responded_at | timestamptz | default now()                              |

- **PK(user_id, activity_id)**
- No event-level RSVPs — event attendance is derived from activity RSVPs

---

## Visibility Rules

### Events

```sql
-- Events visible to a guest:
WHERE events.published = true
  AND EXISTS (
    SELECT 1 FROM event_invitations
    WHERE event_invitations.event_id = events.id
      AND event_invitations.user_id = :current_user
  )
```

### Activities

```sql
-- Activities visible to a guest within an event:
WHERE activities.published = true
  AND (
    -- Public activities: visible to all event invitees
    (activities.public = true AND EXISTS (
      SELECT 1 FROM event_invitations
      WHERE event_invitations.event_id = activities.event_id
        AND event_invitations.user_id = :current_user
    ))
    OR
    -- Exclusive activities: requires explicit invitation
    EXISTS (
      SELECT 1 FROM activity_invitations
      WHERE activity_invitations.activity_id = activities.id
        AND activity_invitations.user_id = :current_user
    )
  )
```

### Headcount

```sql
-- Headcount for an activity (including plus-ones):
SELECT
  COUNT(*) FILTER (WHERE status = 'going') AS going_count,
  COALESCE(SUM(plus_count) FILTER (WHERE status = 'going'), 0) AS plus_ones,
  COUNT(*) FILTER (WHERE status = 'going')
    + COALESCE(SUM(plus_count) FILTER (WHERE status = 'going'), 0) AS total_attending,
  COUNT(*) FILTER (WHERE status = 'maybe') AS maybe_count
FROM rsvps
WHERE activity_id = :activity_id
```

---

## Auth Flow

1. Admin invites a guest by email
2. Backend calls `supabase.auth.admin.createUser({ email })` — pre-creates the auth user
3. Database trigger on `auth.users` INSERT creates the `profiles` row
4. Invitation row is created FK'd to the profile UUID
5. Guest logs in via Supabase email OTP → uses the existing auth user → sees their invitations

Admin is identified by `auth.users.raw_app_meta_data.is_admin = true`, included in the JWT automatically.

---

## Cascade Behavior

| When you delete…       | Also deletes…                                          |
| ---------------------- | ------------------------------------------------------ |
| An `auth.users` row    | → `profiles` → all their invitations and RSVPs         |
| An `events` row        | → all `activities`, `event_invitations` for that event  |
| An `activities` row    | → all `activity_invitations`, `rsvps` for that activity |

---

## Future Considerations

These are not in the current schema but are compatible with it:

| Feature          | Likely table/column                                |
| ---------------- | -------------------------------------------------- |
| Comments         | `comments` (FK → activity_id, user_id)             |
| Photos           | `photos` (FK → event/activity, Supabase Storage)   |
| Notifications    | `notifications` (email queue)                      |
| Waitlist         | Enforced via `max_capacity` + RSVP count check     |
| Cost splitting   | `cost` column on `activities`                      |
