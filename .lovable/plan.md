## What I'll do

Manually wire this app to your external Supabase project `lqgdiuovlutugreuzqkl`. No Lovable Cloud, no schema, no UI changes.

### Step 1 — Request 6 secrets via the secure secrets form

You'll paste these once; values are stored encrypted and exposed as env vars to server + browser bundles as appropriate.

Server-only (`process.env.*`):
- `SUPABASE_URL` = `https://lqgdiuovlutugreuzqkl.supabase.co`
- `SUPABASE_PUBLISHABLE_KEY` (anon key)
- `SUPABASE_SERVICE_ROLE_KEY`

Browser-visible (`import.meta.env.VITE_*`):
- `VITE_SUPABASE_URL` = same URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` = same anon key
- `VITE_SUPABASE_PROJECT_ID` = `lqgdiuovlutugreuzqkl`

The service role key is **never** mirrored to a `VITE_` var.

### Step 2 — Install SDK
```
bun add @supabase/supabase-js
```

### Step 3 — Generate 3 integration files

- `src/integrations/supabase/client.ts` — browser client, publishable key, session persistence. Imported by React components.
- `src/integrations/supabase/client.server.ts` — admin client, service role key. Server-only via `.server.ts` extension (bundler refuses any client import).
- `src/integrations/supabase/auth-middleware.ts` — `requireSupabaseAuth` middleware for `createServerFn`.

No `types.ts` yet — that gets generated later from your schema.

### Step 4 — Touch nothing else

- All routes, components, and mock data stay exactly as they are.
- No imports added anywhere outside `src/integrations/supabase/`.
- App continues rendering from mock data only.

### Confirmation I'll deliver after wiring

1. **Active project ref**: `lqgdiuovlutugreuzqkl` (verified by reading back `SUPABASE_URL`).
2. **Env vars configured**: list from `fetch_secrets` showing all 6 names present (values hidden).
3. **Integration files generated**: the 3 paths above.
4. **Mock-data-only state**: `rg` for any import of `@/integrations/supabase/` outside `src/integrations/` — expected result is zero matches, proving no UI/data path is using Supabase yet.

### Rollback if you ever want to detach
- Delete `src/integrations/supabase/`
- Delete the 6 secrets in the secrets UI
- `bun remove @supabase/supabase-js`

### One honest caveat
Lovable cannot read your Supabase **organization name** from inside the editor (no OAuth binding to your dashboard). The org is whatever owns `lqgdiuovlutugreuzqkl` in `supabase.com/dashboard` — that's your source of truth. I will not fabricate it.

Approve and I'll trigger the secrets form first, then create the files.
