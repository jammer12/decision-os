-- Decisions table: one row per decision, scoped by user
create table if not exists public.decisions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default '',
  context text not null default '',
  options text[] not null default '{}',
  outcome text,
  created_at timestamptz not null default now(),
  decided_at timestamptz
);

-- Index for listing a user's decisions
create index if not exists decisions_user_id_created_at_idx
  on public.decisions (user_id, created_at desc);

-- RLS: users can only see and modify their own decisions
alter table public.decisions enable row level security;

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
