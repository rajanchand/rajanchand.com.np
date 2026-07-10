-- Contact form submissions.
-- No migration tooling is wired up in this repo — run this manually in the
-- Supabase SQL editor (Project > SQL Editor > New query) once.

create table if not exists public.messages (
  id bigint generated always as identity primary key,
  name text not null,
  email text not null,
  subject text,
  message text not null,
  status text not null default 'unread' check (status in ('unread', 'read')),
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

-- No policies added intentionally: only the server-side client (using
-- SUPABASE_SERVICE_ROLE_KEY, which bypasses RLS) reads/writes this table,
-- matching the existing portfolio/visitors tables in this project. RLS with
-- zero policies denies all access via the public anon key by default.
