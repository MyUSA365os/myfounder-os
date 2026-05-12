# Founder Revenue OS

The MyUSA founder's command center — pulls revenue, partner, and outreach signal into one operating view, backed by Supabase with row-level isolation per workspace.

This is an internal tool, not a customer-facing product. It runs on a fresh Supabase project (`lqgdiuovlutugreuzqkl`) kept fully separate from MyUSALocal.

---

## Quick start

```bash
# 1. Clone
git clone https://github.com/MyUSA365os/myfounder-os.git
cd myfounder-os

# 2. Install (npm, not bun — bun has Windows file-lock issues with Vite)
npm install

# 3. Environment
cp .env.example .env.local
# Edit .env.local — paste your Supabase anon key

# 4. Database — run in Supabase SQL Editor, in order:
#    supabase/migrations/001_core.sql
#    supabase/migrations/002_revenue.sql
#    supabase/migrations/003_operations.sql
#    supabase/migrations/004_rls.sql
#    supabase/migrations/005_rls_indexes.sql

# 5. Create an auth user:
#    https://supabase.com/dashboard/project/<project-ref>/auth/users
#    → "Add user" → enable "Auto Confirm User"
#    (Sign-up flow inside the app is not yet built)

# 6. Get your workspace ID and seed dev data:
#    Open: https://supabase.com/dashboard/project/<project-ref>/sql/new
#    Run: SELECT id FROM workspaces;
#    Replace YOUR_WORKSPACE_ID in supabase/seeds/dev_seed.sql with that UUID
#    Run the seed file

# 7. Start
npm run dev          # → http://localhost:8080
```

Then sign in at `/login` with the email + password you set in step 5.

---

## Pages

| Path | Status | Backed by |
|------|--------|-----------|
| `/login` | ✅ Live | Supabase auth |
| `/revenue` | ✅ Live, real data | `revenue_lanes`, `offer_tiers`, `revenue_events`, `revenue_snapshots` |
| `/outreach` | ✅ Live, real data | `leads` (campaigns table TBD) |
| `/partners` | ✅ Live, real data | `partners` |
| `/compliance` | Placeholder | No schema yet |
| `/content` | Placeholder | No schema yet |
| `/inbound` | Placeholder | Could reuse `leads` |
| `/local-growth` | Placeholder | No schema yet |

---

## Tech stack

| Layer | Tech |
|-------|------|
| Framework | TanStack Start (Vite + React 19 + TS) |
| UI | shadcn/ui + Tailwind v4 |
| Data | Supabase (auth + Postgres + RLS) |
| State | React Query (per-page hooks) |
| Routing | TanStack Router (file-based, in `src/routes/`) |
| Build | Cloudflare Vite plugin (for eventual Workers deploy) |
| Package manager | npm (bun fails on Windows + Vite — see ARCHITECTURE.md) |

---

## Repo layout

```
myfounder-os/
├── src/
│   ├── components/       # AppSidebar, RequireAuth, shadcn ui/
│   ├── context/          # AuthContext (Supabase session hydration)
│   ├── hooks/            # useAuth, useWorkspace, useRevenue, useLeads, usePartners
│   ├── lib/              # supabase.ts (typed client), utils, error capture
│   ├── routes/           # File-based routes — one .tsx per URL
│   ├── types/            # database.ts (Supabase Row/Insert/Update types)
│   ├── server.ts         # SSR entry (Cloudflare Workers compatible)
│   └── start.ts          # Client entry
├── supabase/
│   ├── migrations/       # 001 → 005, run in order
│   ├── seeds/            # dev_seed.sql + reseed_cleanup.sql
│   └── verify/           # rls_smoke_test.sql (8-block RLS verification)
└── ARCHITECTURE.md       # Read this before adding features
```

---

## Adding a new page that uses Supabase data

The pattern is now standard across Revenue, Outreach, and Partners. Mirror what they do:

1. **Schema** — add table(s) in a new migration file (e.g. `006_campaigns.sql`). Include workspace_id FK and indexes on `workspace_id`.
2. **RLS** — add policies to a new migration (`007_rls_campaigns.sql`) using `workspace_id = public.my_workspace_id()` for both USING and WITH CHECK.
3. **Types** — add Row/Insert/Update for the new table in `src/types/database.ts`.
4. **Hook** — create `src/hooks/use<Thing>.ts` with React Query queries. Take `workspaceId` and use `enabled: !!workspaceId`.
5. **Route** — replace the placeholder route's body. Use Skeleton for loading, empty-state copy for no-data.

`ARCHITECTURE.md` covers the why behind each step.

---

## Known issues

| Issue | Workaround |
|-------|------------|
| `bun dev` fails on Windows: `Cannot read directory "node_modules"` | Use `npm run dev` instead |
| `Duplicate declaration "hot"` from TanStack router-plugin | Don't declare a top-level `const hot` in any `src/routes/*.tsx` file. Rename to anything else. |
| Password reset emails redirect to `localhost:3000` (wrong port) | Set Supabase Site URL to `http://localhost:8080` in Project Settings → Auth → URL Configuration, or just reset passwords directly in the Auth users dashboard |
| `@tanstack/start-plugin-core@1.169.20` security advisory | The malicious optional dep `@tanstack/setup` was NOT installed by npm. Upgrade to a patched `@tanstack/react-start` when one is available. |

---

## License

Internal — MyUSA only. Not for external distribution.
