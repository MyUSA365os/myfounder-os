-- ─────────────────────────────────────────────────────────────────────────────
-- RLS Smoke Test — Revenue tables
-- Run in: SQL Editor while signed in as the founder account.
-- Each block is independent; run them one at a time and check the result.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 0. Confirm you're authenticated ───────────────────────────────────────────
-- Should return your auth.users.id (NOT NULL).
SELECT auth.uid() AS my_user_id;

-- ── 1. Confirm profile + workspace were auto-created on signup ────────────────
-- Should each return exactly 1 row.
SELECT * FROM public.profiles   WHERE id        = auth.uid();
SELECT * FROM public.workspaces WHERE owner_id = auth.uid();

-- ── 2. Confirm the helper function returns your workspace id ──────────────────
SELECT public.my_workspace_id() AS my_workspace;

-- ── 3. READ test — should return your seeded rows (after running dev_seed) ────
SELECT id, name, mrr_cents FROM public.revenue_lanes ORDER BY sort_order;
SELECT id, name, price_label FROM public.offer_tiers ORDER BY sort_order;
SELECT customer_name, amount_cents FROM public.revenue_events ORDER BY occurred_at DESC LIMIT 4;

-- ── 4. WRITE test — insert a new revenue event under your workspace ──────────
-- Expected: 1 row inserted.
INSERT INTO public.revenue_events (workspace_id, customer_name, description, amount_cents, event_type)
VALUES (public.my_workspace_id(), 'RLS Test Co.', 'RLS write check', 12345, 'sale')
RETURNING id, customer_name, workspace_id;

-- ── 5. WRITE-WITH-CHECK enforcement — try to insert with the WRONG workspace ─
-- Expected: ERROR "new row violates row-level security policy for table revenue_events"
INSERT INTO public.revenue_events (workspace_id, customer_name, amount_cents)
VALUES (gen_random_uuid(), 'Should fail', 0);

-- ── 6. CLEANUP — remove the test row ──────────────────────────────────────────
DELETE FROM public.revenue_events WHERE customer_name = 'RLS Test Co.';

-- ── 7. Index sanity check ─────────────────────────────────────────────────────
-- Should list all idx_* indexes on workspace-scoped tables (12 rows expected).
SELECT schemaname, tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public' AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- ── 8. RLS-on check ───────────────────────────────────────────────────────────
-- Every row's rowsecurity column should be `t` (true).
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('profiles','workspaces','revenue_lanes','offer_tiers',
                    'revenue_events','revenue_snapshots','partners','leads',
                    'dreaming_reports','legacy_allocations','legacy_fund')
ORDER BY tablename;
