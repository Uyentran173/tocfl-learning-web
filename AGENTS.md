<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Repository and deployment workflow

- Work in this existing repository only: `/Users/macbookpro/Documents/Codex/2026-09-24/you-are-helping-me-build-a`. Do not create a nested copy of the project.
- The GitHub repository is `Uyentran173/tocfl-learning-web`. `main` is the production branch. Pushing `origin/main` triggers the existing automatic Vercel production deployment; do not deploy to Vercel manually unless the user explicitly asks.
- Preserve existing website functionality unless the user explicitly requests a change.
- For website changes, implement the request and test locally as needed. Before pushing, run `pnpm build` and relevant tests or type checks. A failing production build means the task is incomplete.
- Review `git status` and `git diff` before committing. Stage only the completed, relevant changes.
- Never commit `node_modules`, `.next`, `.env` files, API keys, credentials, or secrets. Check staged files and diffs for these before committing.
- Commit completed changes with a clear message, then push the commit to `origin/main`. A local-only change is not complete for a normal website modification task.
- After pushing, report what changed, whether `pnpm build` passed, the commit hash, and whether the push to `origin/main` succeeded.
- If a push fails because of authentication, network access, a merge conflict, or any other cause, stop and report the exact failure. Do not claim the website was updated.
