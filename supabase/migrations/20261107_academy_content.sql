-- Tai Wén Academy: only explicitly granted editors can change lesson content.
-- Add the owner's auth.users.id in Supabase SQL Editor after applying this migration.
create table if not exists public.academy_editors (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.academy_editors enable row level security;
revoke all on public.academy_editors from anon, authenticated;
grant select on public.academy_editors to authenticated;
create policy academy_editors_read_self on public.academy_editors
  for select to authenticated using ((select auth.uid()) = user_id);

create table if not exists public.academy_lesson_content (
  lesson_id text not null,
  status text not null check (status in ('draft', 'published')),
  content jsonb not null,
  updated_by uuid not null references auth.users(id),
  updated_at timestamptz not null default now(),
  primary key (lesson_id, status)
);
alter table public.academy_lesson_content enable row level security;
revoke all on public.academy_lesson_content from anon, authenticated;
grant select on public.academy_lesson_content to anon;
grant select, insert, update, delete on public.academy_lesson_content to authenticated;
create policy academy_content_read_public_or_editor on public.academy_lesson_content
  for select to anon, authenticated
  using (status = 'published' or exists (
    select 1 from public.academy_editors where user_id = (select auth.uid())
  ));
create policy academy_content_insert_editor on public.academy_lesson_content
  for insert to authenticated
  with check (updated_by = (select auth.uid()) and exists (
    select 1 from public.academy_editors where user_id = (select auth.uid())
  ));
create policy academy_content_update_editor on public.academy_lesson_content
  for update to authenticated
  using (exists (select 1 from public.academy_editors where user_id = (select auth.uid())))
  with check (updated_by = (select auth.uid()) and exists (
    select 1 from public.academy_editors where user_id = (select auth.uid())
  ));
create policy academy_content_delete_editor on public.academy_lesson_content
  for delete to authenticated
  using (exists (select 1 from public.academy_editors where user_id = (select auth.uid())));
-- Original textbook/workbook files remain outside this table.
