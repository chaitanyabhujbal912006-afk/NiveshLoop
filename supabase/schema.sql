-- NiveshLoop schema
-- Run this in the Supabase SQL editor on a fresh project.
-- Auth is handled by Supabase's built-in `auth.users` table; we reference auth.users(id).

create extension if not exists "uuid-ossp";

-- One portfolio per user, created on signup.
create table portfolios (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  cash_balance numeric(14,2) not null default 100000.00,
  created_at timestamptz not null default now(),
  unique (user_id)
);

create table holdings (
  id uuid primary key default uuid_generate_v4(),
  portfolio_id uuid not null references portfolios(id) on delete cascade,
  symbol text not null,          -- e.g. 'RELIANCE.NS'
  qty numeric(14,4) not null default 0,
  avg_price numeric(14,4) not null default 0,
  updated_at timestamptz not null default now(),
  unique (portfolio_id, symbol)
);

create table transactions (
  id uuid primary key default uuid_generate_v4(),
  portfolio_id uuid not null references portfolios(id) on delete cascade,
  symbol text not null,
  side text not null check (side in ('buy', 'sell')),
  qty numeric(14,4) not null,
  price numeric(14,4) not null,
  had_stop_loss boolean not null default false,
  created_at timestamptz not null default now()
);

create table lessons (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique,
  title text not null,
  body_md text not null,
  order_index int not null,
  unlocks_action text  -- e.g. 'first_trade', 'stop_loss_nudge'; null if no unlock
);

create table lesson_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references lessons(id) on delete cascade,
  completed_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

create table insights (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null,          -- e.g. 'quick_sell', 'no_stop_loss', 'concentration'
  message text not null,
  computed_at timestamptz not null default now()
);

-- Cache for delayed price lookups so we don't hammer the free price source.
create table price_cache (
  symbol text primary key,
  price numeric(14,4) not null,
  fetched_at timestamptz not null default now()
);

-- Row Level Security: users can only ever see/modify their own data.
alter table portfolios enable row level security;
alter table holdings enable row level security;
alter table transactions enable row level security;
alter table lesson_progress enable row level security;
alter table insights enable row level security;

create policy "own portfolio" on portfolios
  for all using (auth.uid() = user_id);

create policy "own holdings" on holdings
  for all using (
    portfolio_id in (select id from portfolios where user_id = auth.uid())
  );

create policy "own transactions" on transactions
  for all using (
    portfolio_id in (select id from portfolios where user_id = auth.uid())
  );

create policy "own lesson progress" on lesson_progress
  for all using (auth.uid() = user_id);

create policy "own insights" on insights
  for all using (auth.uid() = user_id);

-- lessons and price_cache are readable by anyone signed in, written only by the server
-- (server uses the service role key, which bypasses RLS).
alter table lessons enable row level security;
create policy "lessons readable" on lessons for select using (true);

alter table price_cache enable row level security;
create policy "price_cache readable" on price_cache for select using (true);

