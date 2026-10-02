-- Clout Chaser cloud schema for Supabase (run once in the SQL editor)
-- Accounts use Supabase Auth (email + password). Row level security keeps each player's save private.

create table if not exists public.saves (
  user_id uuid primary key references auth.users on delete cascade,
  data text not null,
  day int default 0,
  saved_at bigint default 0,
  game_id text
);
create table if not exists public.players (
  id uuid primary key references auth.users on delete cascade,
  handle text,
  profile jsonb,
  updated_at bigint default 0
);
create index if not exists players_handle on public.players (lower(handle));
create table if not exists public.friends (
  user_id uuid references auth.users on delete cascade,
  friend_id uuid references auth.users on delete cascade,
  primary key (user_id, friend_id)
);
create table if not exists public.gifts (
  id bigint generated always as identity primary key,
  to_id uuid references auth.users on delete cascade,
  from_id uuid references auth.users on delete cascade,
  from_handle text,
  kind text not null check (kind in ('energy', 'cash', 'xp', 'collab')),
  amount bigint default 0 check (amount between 0 and 100000000),
  note text,
  claimed boolean default false,
  created_at timestamptz default now()
);

alter table public.saves enable row level security;
alter table public.players enable row level security;
alter table public.friends enable row level security;
alter table public.gifts enable row level security;

-- saves: only the owner
create policy "own save read" on public.saves for select using (auth.uid() = user_id);
create policy "own save write" on public.saves for insert with check (auth.uid() = user_id);
create policy "own save update" on public.saves for update using (auth.uid() = user_id);
-- players: everyone signed in can read profiles (to find friends); you write only yours
create policy "profiles readable" on public.players for select using (auth.role() = 'authenticated');
create policy "own profile insert" on public.players for insert with check (auth.uid() = id);
create policy "own profile update" on public.players for update using (auth.uid() = id);
-- friends: you manage your own list
create policy "own friends read" on public.friends for select using (auth.uid() = user_id);
create policy "own friends add" on public.friends for insert with check (auth.uid() = user_id);
create policy "own friends remove" on public.friends for delete using (auth.uid() = user_id);
-- gifts: you can send as yourself, only to people who added you or you added; the recipient reads and claims
create policy "send gifts" on public.gifts for insert with check (auth.uid() = from_id and exists (select 1 from public.friends f where f.user_id = auth.uid() and f.friend_id = to_id));
create policy "read my gifts" on public.gifts for select using (auth.uid() = to_id);
create policy "claim my gifts" on public.gifts for update using (auth.uid() = to_id) with check (auth.uid() = to_id);
