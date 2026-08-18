create table public.interviews (
  id uuid primary key default gen_random_uuid(),

  owner_id uuid not null
    references auth.users(id)
    on delete cascade,

  interviewer_key text not null,
  role text not null,
  company text not null,
  level text not null,
  interview_type text not null,
  persona text not null,
  language text not null,

  answers jsonb not null default '[]'::jsonb,

  score integer not null
    check (score >= 0 and score <= 100),

  summary text not null,

  duration_seconds integer not null
    check (duration_seconds >= 0),

  created_at timestamptz not null default now()
);

alter table public.interviews
  enable row level security;

revoke all on table public.interviews from anon, authenticated;
