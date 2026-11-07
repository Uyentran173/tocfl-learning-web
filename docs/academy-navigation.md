# Tai Wén Academy navigation and content

## Course hierarchy

`Learning Path → Textbook Series → Volume → Lesson → Learning Activity`

The first path is `taiwen-academy-path`. The first series is `contemporary-chinese`, with volume `cc1-v1` and 15 stable lesson IDs (`cc1-v1-l01` through `cc1-v1-l15`). Every lesson may contain the five activity kinds `lecture`, `vocabulary`, `grammar`, `practice`, and `assessment`; activity IDs are `<lesson-id>-<kind>`. The catalog and publication state live in `lib/academy-catalog.ts`.

The public routes are `/academy` (bookshelf), `/academy/contemporary-chinese/cc1-v1` (journey), and `/academy/cc1/lesson/01` (sample workspace). Lessons 02–15 are draft nodes with no learner route. They must not be linked until complete, reviewed content is published. The sample Lesson 01 is original Tai Wén material; it does not reproduce the copyrighted textbook/workbook pages.

Lesson 01 links to the existing textbook vocabulary records by stable word IDs. Its progress key is `taiwen-activity:v1:academy:cc1-v1-l01`, with the current activity, completed activity IDs, and question answers. This key participates in the existing guest/account progress storage and Supabase synchronization. Guest/account answer conflicts retain the guest choice separately.

## Owner editing

The owner editor is `/academy/cc1/lesson/01/edit`. It is inaccessible unless the signed-in Supabase user has an entry in `public.academy_editors`. The API checks that membership on every read/write, and Postgres RLS independently enforces it. No service-role key is used in the app. A draft and a published version are stored separately, so saving a draft does not replace the public lesson. Publishing validates the content and keeps stable question IDs.

To activate editing on the existing Supabase project:

1. Apply `supabase/migrations/20261107_academy_content.sql` through the project's normal migration process.
2. Find the owner's **auth user ID** in Supabase Authentication → Users.
3. In the Supabase SQL Editor, grant only that verified ID:

   ```sql
   insert into public.academy_editors (user_id)
   values ('<OWNER_AUTH_UID>')
   on conflict (user_id) do nothing;
   ```

4. Sign in as that user and open `/academy/cc1/lesson/01/edit`. Verify that a guest or another account receives 404, while the owner can save a draft and publish.

Until that migration and owner grant are applied, the public original sample remains readable but the editor stays closed. Keep unreviewed lessons as drafts; do not present empty lessons as available.

## Audio and source rights

The Academy workspace keeps the existing Lesson 01 audio activity UI behind an optional section. Its files remain in ignored `.private/academy/cc1/`, never in `public/`, Git or Vercel. Production audio remains unavailable until permission to distribute it has been confirmed. Original test datasets, exam audio and scoring are unrelated to these Academy files.
