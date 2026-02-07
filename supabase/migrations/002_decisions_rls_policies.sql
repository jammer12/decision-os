-- Ensure decisions are private: enable RLS and (re)create policies.
-- Run this in Supabase SQL Editor if decisions are visible to everyone.
-- Safe to run multiple times (drops existing policies then recreates).

alter table public.decisions enable row level security;

drop policy if exists "Users can read own decisions" on public.decisions;
drop policy if exists "Users can insert own decisions" on public.decisions;
drop policy if exists "Users can update own decisions" on public.decisions;
drop policy if exists "Users can delete own decisions" on public.decisions;

create policy "Users can read own decisions"
  on public.decisions for select
  using (auth.uid() = user_id);

create policy "Users can insert own decisions"
  on public.decisions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own decisions"
  on public.decisions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own decisions"
  on public.decisions for delete
  using (auth.uid() = user_id);
