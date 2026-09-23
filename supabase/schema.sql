-- LingoNote AI — Supabase schema
-- ဒီ script တစ်ခုလုံးကို Supabase project ရဲ့ "SQL Editor" ထဲမှာ paste လုပ်ပြီး "Run" နှိပ်ပါ (တစ်ကြိမ်တည်း လုံလောက်ပါတယ်)။

create extension if not exists pgcrypto;

create table if not exists lessons (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  title text not null,
  dialogue jsonb not null default '[]',
  vocabulary jsonb not null default '[]',
  grammar jsonb not null default '[]',
  created_at timestamptz not null default now()
);

-- ဘာသာစကား အများကြီး ထောက်ပံ့ဖို့ ထပ်ထည့်ထားတဲ့ column (ရှိပြီးသား table ဖြစ်ရင်လည်း ဒီတစ်ကြောင်းက အဆင်ပြေအောင် ထည့်ပေးပါလိမ့်မယ်)
alter table lessons add column if not exists language text not null default 'ko';

create table if not exists quiz_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  correct int not null,
  total int not null,
  taken_on date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists wrong_answers (
  user_id uuid references auth.users not null,
  key text not null,
  type text not null,
  count int not null default 1,
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);

create table if not exists study_dates (
  user_id uuid references auth.users not null,
  study_date date not null,
  primary key (user_id, study_date)
);

alter table lessons enable row level security;
alter table quiz_results enable row level security;
alter table wrong_answers enable row level security;
alter table study_dates enable row level security;

drop policy if exists "own lessons" on lessons;
create policy "own lessons" on lessons for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own quiz_results" on quiz_results;
create policy "own quiz_results" on quiz_results for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own wrong_answers" on wrong_answers;
create policy "own wrong_answers" on wrong_answers for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own study_dates" on study_dates;
create policy "own study_dates" on study_dates for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function increment_wrong_answer(p_key text, p_type text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into wrong_answers (user_id, key, type, count, updated_at)
  values (auth.uid(), p_key, p_type, 1, now())
  on conflict (user_id, key)
  do update set count = wrong_answers.count + 1, updated_at = now();
end;
$$;
