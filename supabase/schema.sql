-- Case Files — Supabase schema
-- Run in Supabase SQL Editor

create table if not exists player_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  guest_id text,
  completed_cases text[] default '{}',
  case_scores jsonb default '{}',
  investigations jsonb default '{}',
  updated_at timestamptz default now(),
  unique(user_id),
  unique(guest_id)
);

alter table player_progress enable row level security;

create policy "Users read own progress"
  on player_progress for select
  using (auth.uid() = user_id or guest_id is not null);

create policy "Users upsert own progress"
  on player_progress for all
  using (auth.uid() = user_id or guest_id is not null);
