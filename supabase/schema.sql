-- Supabase schema for Namely MVP
create extension if not exists "pgcrypto";

create table if not exists public.structures (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.managers (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null references auth.users (id) on delete cascade,
  structure_id uuid not null references public.structures (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (auth_user_id)
);

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  structure_id uuid not null references public.structures (id) on delete cascade,
  name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  structure_id uuid not null references public.structures (id) on delete cascade,
  team_id uuid not null references public.teams (id) on delete cascade,
  name text not null,
  role text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.votes (
  id uuid primary key default gen_random_uuid(),
  structure_id uuid not null references public.structures (id) on delete cascade,
  team_id uuid references public.teams (id) on delete set null,
  employee_id uuid references public.employees (id) on delete set null,
  rating integer not null check (rating in (1, 2, 3)),
  created_at timestamptz not null default now(),
  constraint votes_target_check check (
    (team_id is not null and employee_id is null) or
    (team_id is null and employee_id is not null)
  )
);

create table if not exists public.issues (
  id uuid primary key default gen_random_uuid(),
  structure_id uuid not null references public.structures (id) on delete cascade,
  message text not null check (char_length(message) <= 140),
  room_or_name text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.notification_emails (
  id uuid primary key default gen_random_uuid(),
  structure_id uuid not null references public.structures (id) on delete cascade,
  email text not null,
  notify_issues boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists managers_structure_id_idx on public.managers (structure_id);
create index if not exists teams_structure_id_idx on public.teams (structure_id);
create index if not exists employees_structure_team_idx on public.employees (structure_id, team_id);
create index if not exists votes_structure_id_idx on public.votes (structure_id);
create index if not exists issues_structure_id_idx on public.issues (structure_id, is_read);
create index if not exists notification_emails_structure_id_idx on public.notification_emails (structure_id);
