-- =============================================================================
-- Seed data for local development
-- Runs automatically on `supabase db reset` (after migrations)
-- =============================================================================

-- ─── Auth Users ──────────────────────────────────────────────────────────────
-- Inserting into auth.users triggers our handle_new_user() function,
-- which auto-creates the profiles rows.
--
-- Fixed UUIDs so we can reference them in subsequent inserts.
-- Passwords are hashed "password123" — only for local dev.

-- Admin user (you)
INSERT INTO auth.users (
  instance_id, id, aud, role, email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new,
  email_change
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'a1111111-1111-1111-1111-111111111111',
  'authenticated', 'authenticated', 'admin@test.com',
  crypt('password123', gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"], "is_admin": true}',
  '{"display_name": "Diego"}',
  now(), now(),
  '', '', '', ''
);

-- Guest user
INSERT INTO auth.users (
  instance_id, id, aud, role, email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new,
  email_change
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'b2222222-2222-2222-2222-222222222222',
  'authenticated', 'authenticated', 'guest@test.com',
  crypt('password123', gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"display_name": "Alex"}',
  now(), now(),
  '', '', '', ''
);

-- At this point, the trigger has auto-created profiles for both users.
-- Let's update the admin's profile with a phone number for demo purposes.
UPDATE public.profiles
SET phone = '555-0100'
WHERE id = 'a1111111-1111-1111-1111-111111111111';

-- ─── Events ──────────────────────────────────────────────────────────────────

INSERT INTO public.events (id, created_by, name, description, start_date, end_date, location, published) VALUES
(
  'e1111111-1111-1111-1111-111111111111',
  'a1111111-1111-1111-1111-111111111111',
  'Diego''s 30th Birthday Weekend',
  'A weekend of food, friends, and fun to celebrate the big 3-0!',
  '2026-07-10 18:00:00+00',
  '2026-07-12 14:00:00+00',
  'Austin, TX',
  true
);

-- ─── Activities ──────────────────────────────────────────────────────────────

-- Public activity: Dinner (visible to all event invitees)
INSERT INTO public.activities (id, event_id, created_by, name, description, start_time, end_time, location, published, public, max_capacity, sort_order) VALUES
(
  'c1111111-1111-1111-1111-111111111111',
  'e1111111-1111-1111-1111-111111111111',
  'a1111111-1111-1111-1111-111111111111',
  'Birthday Dinner',
  'Fancy dinner to kick off the weekend. Dress nice!',
  '2026-07-10 19:00:00+00',
  '2026-07-10 22:00:00+00',
  'Uchi Austin',
  true,
  true,
  20,
  1
);

-- Public activity: Party (visible to all event invitees)
INSERT INTO public.activities (id, event_id, created_by, name, description, start_time, end_time, location, published, public, sort_order) VALUES
(
  'c2222222-2222-2222-2222-222222222222',
  'e1111111-1111-1111-1111-111111111111',
  'a1111111-1111-1111-1111-111111111111',
  'House Party',
  'The main event. Music, drinks, and good vibes.',
  '2026-07-11 20:00:00+00',
  '2026-07-12 02:00:00+00',
  'Diego''s Place',
  true,
  true,
  2
);

-- Exclusive activity: Brunch (only visible to specifically invited guests)
INSERT INTO public.activities (id, event_id, created_by, name, description, start_time, end_time, location, published, public, max_capacity, sort_order) VALUES
(
  'c3333333-3333-3333-3333-333333333333',
  'e1111111-1111-1111-1111-111111111111',
  'a1111111-1111-1111-1111-111111111111',
  'Recovery Brunch',
  'Chill brunch for the inner circle. Bloody marys mandatory.',
  '2026-07-12 11:00:00+00',
  '2026-07-12 14:00:00+00',
  'Paperboy',
  true,
  false,
  8,
  3
);

-- Smash Bros Tournament
INSERT INTO public.activities (id, event_id, created_by, name, description, start_time, end_time, location, published, public, sort_order) VALUES
(
  'd1111111-1111-1111-1111-111111111111',
  'e1111111-1111-1111-1111-111111111111',
  'a1111111-1111-1111-1111-111111111111',
  'Smash Bros Tournament',
  'Think you can beat the birthday boy? Sign up and prove it. Single elimination. Winner gets glory.',
  '2026-07-11 14:00:00+00',
  '2026-07-11 18:00:00+00',
  'Diego''s Place',
  true,
  true,
  4
);

-- Hot Wings Challenge
INSERT INTO public.activities (id, event_id, created_by, name, description, start_time, end_time, location, published, public, sort_order) VALUES
(
  'd2222222-2222-2222-2222-222222222222',
  'e1111111-1111-1111-1111-111111111111',
  'a1111111-1111-1111-1111-111111111111',
  'Hot Wings Challenge',
  '10 wings. 10 levels of pain. No milk until the end. Sign up if you dare.',
  '2026-07-11 13:00:00+00',
  '2026-07-11 14:00:00+00',
  'Diego''s Place',
  true,
  true,
  5
);

-- ─── Event Invitations ───────────────────────────────────────────────────────

-- Guest is invited to the event
INSERT INTO public.event_invitations (user_id, event_id) VALUES
('b2222222-2222-2222-2222-222222222222', 'e1111111-1111-1111-1111-111111111111');

-- Admin is also an invitee (so they see the event as a guest too)
INSERT INTO public.event_invitations (user_id, event_id) VALUES
('a1111111-1111-1111-1111-111111111111', 'e1111111-1111-1111-1111-111111111111');

-- ─── Activity Invitations ────────────────────────────────────────────────────

-- Guest is invited to the exclusive brunch
INSERT INTO public.activity_invitations (user_id, activity_id) VALUES
('b2222222-2222-2222-2222-222222222222', 'c3333333-3333-3333-3333-333333333333');

-- Admin too
INSERT INTO public.activity_invitations (user_id, activity_id) VALUES
('a1111111-1111-1111-1111-111111111111', 'c3333333-3333-3333-3333-333333333333');

-- ─── RSVPs ───────────────────────────────────────────────────────────────────

-- Guest is going to dinner, bringing +1
INSERT INTO public.rsvps (user_id, activity_id, status, plus_count, note) VALUES
('b2222222-2222-2222-2222-222222222222', 'c1111111-1111-1111-1111-111111111111', 'going', 1, 'Can''t wait! Bringing my partner.');

-- Guest is maybe for the party
INSERT INTO public.rsvps (user_id, activity_id, status, plus_count) VALUES
('b2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', 'maybe', 0);

-- Admin is going to everything
INSERT INTO public.rsvps (user_id, activity_id, status, plus_count) VALUES
('a1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'going', 0),
('a1111111-1111-1111-1111-111111111111', 'c2222222-2222-2222-2222-222222222222', 'going', 0),
('a1111111-1111-1111-1111-111111111111', 'c3333333-3333-3333-3333-333333333333', 'going', 0);

-- ─── Signups ─────────────────────────────────────────────────────────────────
-- Smash Bros contenders
INSERT INTO public.signups (activity_id, name) VALUES
('d1111111-1111-1111-1111-111111111111', 'Diego'),
('d1111111-1111-1111-1111-111111111111', 'Alex'),
('d1111111-1111-1111-1111-111111111111', 'Jordan');

-- Hot Wings challengers
INSERT INTO public.signups (activity_id, name) VALUES
('d2222222-2222-2222-2222-222222222222', 'Diego'),
('d2222222-2222-2222-2222-222222222222', 'Sam');
