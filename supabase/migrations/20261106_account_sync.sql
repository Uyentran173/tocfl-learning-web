-- Apply after 20261013_user_progress.sql. Source tests and vocabulary stay global.
-- A revision prevents two devices from silently replacing each other's progress.
alter table public.progress_documents
  add column if not exists revision bigint not null default 1,
  add column if not exists deleted boolean not null default false;

alter table public.profiles
  add column if not exists ui_locale text check (ui_locale in ('vi', 'en', 'zh-CN', 'zh-TW')),
  add column if not exists theme text check (theme in ('light', 'dark', 'system'));

alter table public.test_attempts
  alter column completed_at drop not null,
  alter column result_data drop not null;
alter table public.test_attempts
  add column if not exists band text check (band in ('novice', 'A', 'B', 'C')),
  add column if not exists status text not null default 'submitted' check (status in ('in-progress', 'submitted')),
  add column if not exists current_index integer not null default 0 check (current_index >= 0),
  add column if not exists active_section text check (active_section in ('listening', 'reading')),
  add column if not exists deadline_at timestamptz,
  add column if not exists remaining_seconds integer check (remaining_seconds >= 0),
  add column if not exists section_completed jsonb not null default '{"listening":false,"reading":false}'::jsonb,
  add column if not exists updated_at timestamptz not null default now();
create index if not exists test_attempts_in_progress_idx
  on public.test_attempts (user_id, updated_at desc) where status = 'in-progress';

create table if not exists public.personalized_vocabulary_sets (
  user_id uuid not null references auth.users(id) on delete cascade,
  set_id text not null,
  config jsonb not null,
  words jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, set_id)
);
alter table public.personalized_vocabulary_sets enable row level security;
revoke all on public.personalized_vocabulary_sets from anon, authenticated;
grant select, insert, update, delete on public.personalized_vocabulary_sets to authenticated;
create policy personalized_sets_select_own on public.personalized_vocabulary_sets for select to authenticated using ((select auth.uid()) = user_id);
create policy personalized_sets_insert_own on public.personalized_vocabulary_sets for insert to authenticated with check ((select auth.uid()) = user_id);
create policy personalized_sets_update_own on public.personalized_vocabulary_sets for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy personalized_sets_delete_own on public.personalized_vocabulary_sets for delete to authenticated using ((select auth.uid()) = user_id);

-- SECURITY INVOKER keeps the existing auth.uid() RLS policies in force.
-- Deleted documents remain as tombstones so stale devices cannot recreate them.
create or replace function public.write_progress_document(
  p_storage_key text,
  p_category text,
  p_payload text,
  p_expected_revision bigint
) returns bigint
language plpgsql
security invoker
set search_path = ''
as $$
declare
  owner_id uuid := (select auth.uid());
  current_revision bigint;
  next_revision bigint;
begin
  if owner_id is null then raise exception 'authentication_required' using errcode = '42501'; end if;
  if p_storage_key is null or length(p_storage_key) < 1 or length(p_storage_key) > 300 then
    raise exception 'invalid_progress_key' using errcode = '22023';
  end if;
  if p_category is null or p_category not in ('vocabulary', 'vocabulary_progress', 'test', 'annotation', 'activity') then
    raise exception 'invalid_progress_category' using errcode = '22023';
  end if;
  if p_expected_revision is null or p_expected_revision < 0 then
    raise exception 'invalid_progress_revision' using errcode = '22023';
  end if;

  select revision into current_revision from public.progress_documents
    where user_id = owner_id and storage_key = p_storage_key for update;
  if not found then
    if p_expected_revision <> 0 then raise exception 'progress_conflict' using errcode = 'P0001'; end if;
    insert into public.progress_documents (user_id, storage_key, category, payload, deleted, revision)
      values (owner_id, p_storage_key, p_category, coalesce(p_payload, ''), p_payload is null, 1)
      on conflict (user_id, storage_key) do nothing;
    if not found then raise exception 'progress_conflict' using errcode = 'P0001'; end if;
    return 1;
  end if;

  if current_revision <> p_expected_revision then raise exception 'progress_conflict' using errcode = 'P0001'; end if;
  next_revision := current_revision + 1;
  update public.progress_documents set category = p_category,
    payload = coalesce(p_payload, ''), deleted = p_payload is null,
    revision = next_revision, updated_at = now()
    where user_id = owner_id and storage_key = p_storage_key;
  return next_revision;
end;
$$;
revoke all on function public.write_progress_document(text, text, text, bigint) from public, anon;
grant execute on function public.write_progress_document(text, text, text, bigint) to authenticated;
