-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create profiles table
create table if not exists profiles (
  id uuid references auth.users not null primary key,
  email text,
  username text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create game_results table
create table if not exists game_results (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) not null,
  score integer not null,
  total_rounds integer not null,
  correct_answers integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes
create index if not exists game_results_user_id_idx on game_results(user_id);
create index if not exists game_results_score_idx on game_results(score desc);
create index if not exists game_results_created_at_idx on game_results(created_at desc);

-- Enable RLS
alter table profiles enable row level security;
alter table game_results enable row level security;

-- RLS policies for profiles
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

-- RLS policies for game_results
create policy "Users can view own results"
  on game_results for select
  using (auth.uid() = user_id);

create policy "Users can insert own results"
  on game_results for insert
  with check (auth.uid() = user_id);

create policy "Anyone can view leaderboard"
  on game_results for select
  using (true);

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

-- Trigger to create profile on signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
