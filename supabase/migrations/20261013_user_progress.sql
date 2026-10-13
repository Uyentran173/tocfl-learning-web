-- Tai Wén stores shared test/vocabulary source content in the app.
-- Only account profile and learning state belong in these user-owned tables.
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- Durable per-key snapshots let the existing client resume on another device
-- without changing its test and vocabulary source-data formats.
create table if not exists public.progress_documents (
  user_id uuid not null references auth.users(id) on delete cascade,
  storage_key text not null,
  category text not null check (category in ('vocabulary', 'vocabulary_progress', 'test', 'annotation', 'activity')),
  payload text not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, storage_key)
);

create table if not exists public.vocabulary_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  progress_key text not null,
  progress_data jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, progress_key)
);

create table if not exists public.learned_vocabulary (
  user_id uuid not null references auth.users(id) on delete cascade,
  vocabulary_id text not null,
  source_record_id text,
  band text,
  level text,
  mastery_status text,
  learned_at timestamptz,
  last_reviewed_at timestamptz,
  correct_count integer not null default 0 check (correct_count >= 0),
  wrong_count integer not null default 0 check (wrong_count >= 0),
  removed boolean not null default false,
  word_data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, vocabulary_id)
);

create table if not exists public.test_attempts (
  user_id uuid not null references auth.users(id) on delete cascade,
  test_id text not null,
  started_at timestamptz not null,
  completed_at timestamptz not null,
  mode text not null check (mode in ('practice', 'simulation')),
  script text not null check (script in ('traditional', 'simplified')),
  scope text not null check (scope in ('full', 'listening', 'reading')),
  correct integer not null check (correct >= 0),
  total integer not null check (total >= 0),
  earned_points numeric not null default 0,
  max_points numeric not null default 0,
  listening_correct integer,
  reading_correct integer,
  answers jsonb not null default '{}'::jsonb,
  result_data jsonb not null,
  primary key (user_id, test_id, started_at)
);
create index if not exists test_attempts_recent_idx on public.test_attempts (user_id, completed_at desc);

create table if not exists public.practice_annotations (
  user_id uuid not null references auth.users(id) on delete cascade,
  test_id text not null,
  script text not null check (script in ('traditional', 'simplified')),
  question_id text not null,
  anchor_id text not null,
  highlighted boolean not null default false,
  note text,
  anchor_data jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, test_id, script, anchor_id)
);

create table if not exists public.activity_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  activity_key text not null,
  activity_data jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, activity_key)
);

-- No guest/anon access to private progress. The browser uses only the
-- publishable key; the authenticated JWT and these policies restrict rows.
do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'profiles', 'progress_documents', 'vocabulary_progress',
    'learned_vocabulary', 'test_attempts', 'practice_annotations', 'activity_progress'
  ] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('revoke all on public.%I from anon, authenticated', table_name);
    execute format('grant select, insert, update, delete on public.%I to authenticated', table_name);
    execute format('create policy %I on public.%I for select to authenticated using ((select auth.uid()) = user_id)', table_name || '_select_own', table_name);
    execute format('create policy %I on public.%I for insert to authenticated with check ((select auth.uid()) = user_id)', table_name || '_insert_own', table_name);
    execute format('create policy %I on public.%I for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)', table_name || '_update_own', table_name);
    execute format('create policy %I on public.%I for delete to authenticated using ((select auth.uid()) = user_id)', table_name || '_delete_own', table_name);
  end loop;
end $$;
