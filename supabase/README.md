# Tai Wén account setup

The app keeps exam and vocabulary source content global. Only individual learning state is stored in Supabase. Guest learning works without Supabase configuration.

1. Create or select a Supabase project. Run [20261013_user_progress.sql](migrations/20261013_user_progress.sql) once in its SQL Editor or through Supabase migrations. All user tables use row-level security and restrict reads/writes to `auth.uid() = user_id`.
2. In Supabase Authentication → URL Configuration, set the site URL to `https://tocfl-learning-web.vercel.app` and allow `https://tocfl-learning-web.vercel.app/auth/callback`. For local testing, also allow `http://localhost:3000/auth/callback`.
3. Enable Google in Supabase Authentication → Providers. Configure a Google OAuth web app with the Supabase callback shown in the Google provider settings (normally `https://<project-ref>.supabase.co/auth/v1/callback`). Store the Google client ID and secret in Supabase only.
4. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in the existing Vercel project for Production (and in ignored `.env.local` for local testing). Redeploy through the existing GitHub `main` workflow. Never use a service-role/secret key in a `NEXT_PUBLIC_` variable.
5. Facebook is prepared but disabled. Configure a Meta app and the Facebook provider in Supabase, then set `NEXT_PUBLIC_FACEBOOK_OAUTH_ENABLED=true` in Vercel. The Meta redirect URI is the Supabase callback shown in the Facebook provider settings.

After OAuth, the learner reaches `/account`. Account progress is separated by the verified Supabase user ID and synced to the protected tables. Existing guest `localStorage` data stays in place. The learner can explicitly choose **Gộp tiến độ khách**; the guest copy is preserved.

If Supabase or the network is unavailable, the per-account local copy remains on the device and pending changes are retried when the app opens again. Cloud progress is not ready for real accounts until the SQL migration and environment variables have been applied.
