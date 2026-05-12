# Architecture

Read this before adding features. Captures the decisions made, not just the structure.

---

## 1. Data isolation model — workspace-per-user

Every founder gets exactly **one workspace**, auto-created on signup. All operational data (revenue, partners, leads, etc.) is scoped to `workspace_id`.

```
auth.users (Supabase managed)
    │  1
    │  └─ trigger: handle_new_user
    ▼  1
profiles
    │  1
    │  └─ trigger: handle_new_workspace
    ▼  1
workspaces
    │  1
    │  M
    ▼  M
revenue_lanes, offer_tiers, revenue_events, revenue_snapshots,
partners, leads, dreaming_reports, legacy_allocations, legacy_fund
```

**Why one-workspace-per-user, not many?**
- Founder OS is a personal command center, not a multi-tenant SaaS
- Simpler RLS (no membership tables, no role joins)
- Future expansion (teams, partners co-editing) can layer on top by adding a `workspace_members` table without breaking existing policies

**Why store `owner_id` on `workspaces` instead of joining through `profiles`?**
- One fewer join in every RLS policy
- `auth.uid() = owner_id` is a direct index hit on `idx_workspaces_owner`

---

## 2. RLS architecture

Every workspace-scoped table has the same policy shape:

```sql
CREATE POLICY "<table>_workspace" ON public.<table>
  FOR ALL
  USING (workspace_id = public.my_workspace_id())
  WITH CHECK (workspace_id = public.my_workspace_id());
```

The helper function `public.my_workspace_id()` is marked `STABLE` + `SECURITY DEFINER`. **It runs once per query, not once per row** — critical for performance. Without `STABLE`, Postgres would re-execute it for every row checked, turning every list query into N+1.

```sql
CREATE OR REPLACE FUNCTION public.my_workspace_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT id FROM public.workspaces WHERE owner_id = auth.uid() LIMIT 1;
$$;
```

**Hot-path indexes** (migration 005):
- `idx_workspaces_owner` on `workspaces(owner_id)` — fires on every RLS check
- `idx_legacy_allocations_workspace` — patched the one table we forgot in 002/003
- Every other workspace-scoped table got its `workspace_id` index in 002 or 003

**Why `WITH CHECK` matters:** without it, RLS only enforces reads. A signed-in user could `INSERT` rows with someone else's `workspace_id`. `WITH CHECK` blocks that. There's a smoke test in `supabase/verify/rls_smoke_test.sql` that confirms this.

---

## 3. Money is stored in cents (BIGINT)

Every monetary column is `<thing>_cents BIGINT`, e.g. `mrr_cents`, `amount_cents`, `price_cents`. Formatters in `src/hooks/useRevenue.ts` (`formatDollars`) convert at display time.

**Why:**
- Postgres `NUMERIC` is slow for arithmetic
- Floating-point dollars round wrong (`0.1 + 0.2 = 0.30000000000000004`)
- BIGINT cents avoids both
- `4360000` is unambiguous; `43600.00` invites parse errors

---

## 4. Auth flow

```
User clicks "Add user" in Supabase Auth dashboard
    │
    ▼
INSERT INTO auth.users
    │
    ├─ trigger on_auth_user_created → handle_new_user()
    │      INSERT INTO profiles (id = auth.uid, full_name from email)
    │
    └─ trigger on_profile_created → handle_new_workspace()
           INSERT INTO workspaces (owner_id = auth.uid, name = 'Founder HQ')

User visits /login → signInWithEmail() → supabase.auth.signInWithPassword()
    │
    ▼
Session stored in localStorage (sb-<project>-auth-token)
    │
    ▼
AuthContext.onAuthStateChange fires → session state updates
    │
    ▼
useWorkspace() runs → workspace_id available to all hooks
    │
    ▼
All page hooks (useRevenueLanes, useHotProspects, etc.) become enabled
```

**Why no app-side signup yet?** Founder OS is internal — onboarding new operators is a deliberate, manual step (Supabase dashboard or a future admin tool). A public signup form invites bots and accidental account creation.

---

## 5. Route guard (`src/components/require-auth.tsx`)

Client-side only. Wraps protected routes in `__root.tsx`. Logic:

```
isLoading?  → show "Loading…"
!session?   → navigate({ to: "/login", search: { redirect: pathname } })
session?    → render children
```

After sign-in, `LoginPage` reads `?redirect=` and navigates back to the original target. The `/login` route is the only one rendered outside `<RequireAuth>` — that prevents redirect loops.

**Why not a server-side guard / loader-based redirect?** TanStack Start SSR doesn't have access to the user's session during initial render (cookies aren't wired through). Client-side is the simpler correct answer here. If we move to SSR with cookies later, the guard moves into `beforeLoad`.

---

## 6. Data layer pattern

Every page follows the same shape. **If you depart from this pattern, document why.**

```typescript
// src/hooks/useThings.ts
export function useThings(workspaceId: string | undefined) {
  return useQuery<Thing[]>({
    queryKey: ['things', workspaceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('things')
        .select('*')
        .eq('workspace_id', workspaceId!)
        .order(/* a stable column */)
      if (error) throw new Error(`useThings: ${error.message}`)
      return data
    },
    enabled: !!workspaceId,
  })
}
```

```typescript
// src/routes/things.tsx
function ThingsPage() {
  const { data: workspace } = useWorkspace()
  const { data: things, isLoading } = useThings(workspace?.id)
  // ...render with Skeleton while isLoading, empty-state when array is empty
}
```

**Why React Query (vs. TanStack Router loaders)?**
- Loaders run server-side first; we don't have server-side Supabase auth wired through SSR yet
- React Query handles refetch/cache/staleTime out of the box
- Same pattern works inside any component, not just route components
- TanStack Router loaders become more attractive once we add server-side cookie-based auth

---

## 7. Schema reference

11 tables. Every workspace-scoped table has `workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE`.

| Table | Purpose | Backing page |
|-------|---------|--------------|
| `profiles` | Extends auth.users | All |
| `workspaces` | One per founder | All |
| `revenue_lanes` | MRR by lane (productized, cohort, etc.) | /revenue |
| `offer_tiers` | Product ladder conversion funnel | /revenue |
| `revenue_events` | Closed deals / wins feed | /revenue |
| `revenue_snapshots` | Daily KPI cache (Net MRR, AOV, refund rate) | /revenue |
| `partners` | Licensed operator network | /partners |
| `leads` | Outreach pipeline with stage enum | /outreach, future /inbound |
| `dreaming_reports` | Daily AI recommendation JSONB blobs | future /home or /revenue |
| `legacy_allocations` | Revenue splits for Family Legacy Mode | future page |
| `legacy_fund` | Running balance for legacy fund | future page |

---

## 8. File organization conventions

- **One route per file** in `src/routes/`. TanStack Router file-based routing turns `src/routes/revenue.tsx` into `/revenue`.
- **One hook file per domain** in `src/hooks/`. `useRevenue.ts` holds all revenue queries + formatters. `useLeads.ts` holds all lead queries. Keeps the import surface narrow.
- **Formatters live next to queries** in the same hook file. Not in `src/lib/utils.ts`. Reason: formatters are domain-specific and change together with the schema.
- **Shadcn components stay in `src/components/ui/`** unmodified. App-specific composites go in `src/components/` or `src/components/dashboard/`.

---

## 9. Known gotchas (and why)

### `bun dev` fails on Windows
Bun creates symlinks/hardlinks in `node_modules` that Vite's esbuild can't traverse on Windows. Use `npm run dev`. Bun is fine for installing — just not for running the dev server.

### `Duplicate declaration "hot"` in routes
TanStack router-plugin's code-splitter generates an internal `hot` identifier during HMR processing. If a route file has a top-level `const hot = [...]`, it collides and breaks **client hydration for the entire app** — not just that page. Hit this once in `outreach.tsx`. Lesson: never declare top-level `hot` in `src/routes/*`.

### Cents vs. dollars in display
Don't `toFixed(2)` on `mrr_cents`. Pipe through `formatDollars()` from `useRevenue.ts`. If you need a different format (e.g. for charts), add a new formatter next to it.

### Supabase Site URL defaults to localhost:3000
The app runs on `:8080`. Password reset emails will fail until you set Site URL to `http://localhost:8080` in Supabase Project Settings → Auth → URL Configuration.

### TanStack Start security advisory
`@tanstack/start-plugin-core@1.169.20` is flagged for a compromised optional dep (`@tanstack/setup`). The malicious package was NOT installed (npm skipped it). When TanStack ships a patched `@tanstack/react-start`, upgrade.

---

## 10. Adding a new table — full checklist

1. **Write migration** `supabase/migrations/0XX_<name>.sql`:
   - `CREATE TABLE IF NOT EXISTS public.<name>` with `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
   - `workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE`
   - Index on `(workspace_id, <commonly_filtered_column>)` if relevant
   - `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
2. **Add RLS policies** in same or sibling migration:
   - `ALTER TABLE public.<name> ENABLE ROW LEVEL SECURITY;`
   - `CREATE POLICY "<name>_workspace" ON public.<name> FOR ALL USING (workspace_id = public.my_workspace_id()) WITH CHECK (workspace_id = public.my_workspace_id());`
3. **Update types** in `src/types/database.ts`. Pattern: `Row` is exhaustive; `Insert` has `?` on every column with a default; `Update` has `?` on everything.
4. **Run migration** in Supabase SQL Editor.
5. **Verify RLS** by running the relevant block of `supabase/verify/rls_smoke_test.sql` against the new table.
6. **Build hook + wire route** following the pattern in section 6.

---

## 11. Long-term direction

What's intentionally deferred:

- **Server-side auth in TanStack Start loaders** — requires `@supabase/ssr` and cookie wiring. Worth doing when we add multiple workspaces or admin-impersonation.
- **Workspace membership / teams** — add a `workspace_members(workspace_id, user_id, role)` table and update `my_workspace_id()` to a `SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()` (returns set, RLS adjusts to `IN`).
- **Realtime subscriptions** — Supabase supports it; React Query has `useQuery` integration. Add when KPI cards need to update without manual refresh.
- **Mutations** — currently every page is read-only. Adding a "create lead" form on Outreach tests the RLS WITH CHECK enforcement and is the natural first write path.
- **pgvector** — schema doesn't have embeddings yet. When the Dreaming Engine needs semantic search over past wins/leads, add a `vector(1536)` column on the relevant table.
- **Campaigns table** — Outreach page has static campaigns. Replace when the email automation backend lives somewhere queryable.

---

## 12. Decisions log

| Date | Decision | Why |
|------|----------|-----|
| 2026-05-12 | One workspace per user | Founder OS is personal, not multi-tenant |
| 2026-05-12 | BIGINT cents over NUMERIC dollars | Speed + correctness |
| 2026-05-12 | Client-side RequireAuth, not SSR loader | SSR session not wired through cookies yet |
| 2026-05-12 | React Query over loaders | Loaders need SSR session; flexible reuse |
| 2026-05-12 | npm over bun for dev server | Bun symlink layout breaks Vite on Windows |
| 2026-05-12 | Public-facing signup deliberately omitted | Internal tool — onboarding is manual |
