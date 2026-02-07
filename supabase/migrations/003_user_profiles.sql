-- User profiles derived from decisions (user_profile_algo), updated only when decision count increases
create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  user_profile_algo text not null default '{}',
  decisions_count int not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.user_profiles enable row level security;

create policy "Users can read own profile"
  on public.user_profiles for select
  using (auth.uid() = user_id);

create policy "Users can insert own profile"
  on public.user_profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update own profile"
  on public.user_profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
