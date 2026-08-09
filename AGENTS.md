# AGENTS.md — NiveshLoop

You are building NiveshLoop: a free, ad-free web app that teaches beginners Indian stock-market investing by connecting each lesson directly to a simulated trading action, then reflecting their own behavior back to them. No real money, no real broker integration — simulation only.

Read these before writing any code, in this order:
- @docs/PRD.md — what we're building and why, and what's explicitly out of scope
- @docs/ARCHITECTURE.md — stack, data model, API design, folder structure
- @docs/PHASES.md — the build order. Work one phase at a time, in order.

## Working style

- Follow `docs/PHASES.md` sequentially. Do not start Phase 2 work while Phase 1's "Definition of done" isn't met. If you think a later phase's work is needed to finish an earlier one, stop and say so instead of quietly reordering.
- Before writing code for a new phase, restate that phase's deliverables and definition of done back to the user and get a go-ahead.
- If a request conflicts with something in PRD.md's "Non-goals" section (e.g., real money, real brokerage orders, personalized financial advice, real-time licensed data), stop and flag the conflict instead of implementing it.

## Tech stack (do not substitute without discussion)

- Next.js (App Router) + TypeScript, single repo for frontend and backend
- Tailwind CSS for styling
- Supabase for Postgres + Auth
- Deployment target: Vercel, free tier only — every dependency added must have a free tier sufficient for this project's scale

## Code quality

- TypeScript strict mode; no `any` without a comment explaining why
- Keep files under ~300 lines; split by feature, not by type
- All Supabase queries that touch money (`portfolios`, `holdings`, `transactions`) happen in server-side API routes only, never directly from client components
- Every function that changes `cash_balance` or `holdings` must be covered by at least a basic test before being considered done

## Safety guardrails

- Never hardcode secrets. All keys come from environment variables listed in `docs/ARCHITECTURE.md` §7.
- Never remove or shrink the "simulated portfolio, delayed prices, not real money, not investment advice" disclaimer from any screen that shows a price or portfolio value.
- Never write UI copy, lesson content, or insight messages that could read as personalized financial advice ("you should buy X"). Insights describe patterns in the user's own past behavior only — they never recommend future action.
- Ask for confirmation before running a Supabase migration that drops or alters an existing table.

## Git conventions

- Conventional commits (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`)
- One phase's work = roughly one feature branch / one PR, not one giant commit
