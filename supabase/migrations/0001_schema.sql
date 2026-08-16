-- World Tourint: core schema
-- regions / countries / cities are reference data (public read, no per-user ownership)
-- profiles / visits / city_visits / wishlist / goals are user-owned data

create table regions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name_ja text not null,
  name_en text not null
);

create table countries (
  id uuid primary key default gen_random_uuid(),
  iso_code text not null unique,
  name_ja text not null,
  name_en text not null,
  region_id uuid not null references regions(id),
  sub_region text,
  difficulty smallint not null check (difficulty between 1 and 5),
  is_un_member boolean not null default true
);
create index countries_region_id_idx on countries(region_id);

create table cities (
  id uuid primary key default gen_random_uuid(),
  country_id uuid not null references countries(id) on delete cascade,
  name_ja text not null,
  name_en text not null,
  tier text not null check (tier in ('capital', 'major'))
);
create index cities_country_id_idx on cities(country_id);

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

create table visits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  country_id uuid not null references countries(id) on delete cascade,
  visited_date date,
  notes text,
  created_at timestamptz not null default now(),
  unique (user_id, country_id)
);
create index visits_user_id_idx on visits(user_id);

create table city_visits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  city_id uuid not null references cities(id) on delete cascade,
  visited_date date,
  created_at timestamptz not null default now(),
  unique (user_id, city_id)
);
create index city_visits_user_id_idx on city_visits(user_id);

create table wishlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  country_id uuid not null references countries(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, country_id)
);
create index wishlist_user_id_idx on wishlist(user_id);

create table goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  type text not null check (type in ('total_countries', 'region_complete', 'specific_country')),
  target_value int,
  region_id uuid references regions(id),
  country_id uuid references countries(id),
  deadline date,
  created_at timestamptz not null default now()
);
create index goals_user_id_idx on goals(user_id);

-- Auto-create a profile row when a new auth user signs up
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data ->> 'display_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Row Level Security
alter table regions enable row level security;
alter table countries enable row level security;
alter table cities enable row level security;
alter table profiles enable row level security;
alter table visits enable row level security;
alter table city_visits enable row level security;
alter table wishlist enable row level security;
alter table goals enable row level security;

-- Reference data: readable by any authenticated user
create policy "regions readable by authenticated" on regions
  for select to authenticated using (true);
create policy "countries readable by authenticated" on countries
  for select to authenticated using (true);
create policy "cities readable by authenticated" on cities
  for select to authenticated using (true);

-- Profiles: user can read/update own profile
create policy "profiles select own" on profiles
  for select to authenticated using (auth.uid() = id);
create policy "profiles update own" on profiles
  for update to authenticated using (auth.uid() = id);

-- User-owned tables: full CRUD limited to own rows
create policy "visits crud own" on visits
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "city_visits crud own" on city_visits
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "wishlist crud own" on wishlist
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "goals crud own" on goals
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
