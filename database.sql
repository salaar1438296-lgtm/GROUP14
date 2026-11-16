-- Run this SQL in Supabase Dashboard -> SQL Editor.

create table if not exists public.players (
  id uuid primary key references auth.users(id) on delete cascade,
  player_name text not null,
  best_score integer not null default 0
);

create table if not exists public.game_scores (
  id bigint generated always as identity primary key,
  player_id uuid not null references auth.users(id) on delete cascade,
  level_number integer not null,
  points integer not null,
  created_at timestamp with time zone default now()
);

alter table public.players enable row level security;
alter table public.game_scores enable row level security;

-- A signed-in player can view and update only their own player record.
create policy "Players can view their own profile"
on public.players for select
using (auth.uid() = id);

create policy "Players can add their own profile"
on public.players for insert
with check (auth.uid() = id);

create policy "Players can update their own profile"
on public.players for update
using (auth.uid() = id)
with check (auth.uid() = id);

-- A player can add and view only their own game scores.
create policy "Players can add their own scores"
on public.game_scores for insert
with check (auth.uid() = player_id);

create policy "Players can view their own scores"
on public.game_scores for select
using (auth.uid() = player_id);
