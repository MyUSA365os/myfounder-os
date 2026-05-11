-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 004 — Row Level Security policies
-- Depends on: 001_core.sql, 002_revenue.sql, 003_operations.sql
-- Run AFTER the other three migrations.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Enable RLS ────────────────────────────────────────────────────────────────
ALTER TABLE public.profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_lanes     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offer_tiers       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_events    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dreaming_reports  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legacy_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legacy_fund       ENABLE ROW LEVEL SECURITY;

-- ── Helper: get caller's workspace_id ────────────────────────────────────────
-- Stable + security definer so it runs once per query, not once per row.
-- Used by all workspace-scoped policies below.

CREATE OR REPLACE FUNCTION public.my_workspace_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.workspaces WHERE owner_id = auth.uid() LIMIT 1;
$$;

-- ── profiles policies ─────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "profiles_own" ON public.profiles;
CREATE POLICY "profiles_own" ON public.profiles
  FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ── workspaces policies ───────────────────────────────────────────────────────
DROP POLICY IF EXISTS "workspaces_own" ON public.workspaces;
CREATE POLICY "workspaces_own" ON public.workspaces
  FOR ALL
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- ── revenue_lanes policies ────────────────────────────────────────────────────
DROP POLICY IF EXISTS "revenue_lanes_workspace" ON public.revenue_lanes;
CREATE POLICY "revenue_lanes_workspace" ON public.revenue_lanes
  FOR ALL
  USING (workspace_id = public.my_workspace_id())
  WITH CHECK (workspace_id = public.my_workspace_id());

-- ── offer_tiers policies ──────────────────────────────────────────────────────
DROP POLICY IF EXISTS "offer_tiers_workspace" ON public.offer_tiers;
CREATE POLICY "offer_tiers_workspace" ON public.offer_tiers
  FOR ALL
  USING (workspace_id = public.my_workspace_id())
  WITH CHECK (workspace_id = public.my_workspace_id());

-- ── revenue_events policies ───────────────────────────────────────────────────
DROP POLICY IF EXISTS "revenue_events_workspace" ON public.revenue_events;
CREATE POLICY "revenue_events_workspace" ON public.revenue_events
  FOR ALL
  USING (workspace_id = public.my_workspace_id())
  WITH CHECK (workspace_id = public.my_workspace_id());

-- ── revenue_snapshots policies ────────────────────────────────────────────────
DROP POLICY IF EXISTS "revenue_snapshots_workspace" ON public.revenue_snapshots;
CREATE POLICY "revenue_snapshots_workspace" ON public.revenue_snapshots
  FOR ALL
  USING (workspace_id = public.my_workspace_id())
  WITH CHECK (workspace_id = public.my_workspace_id());

-- ── partners policies ─────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "partners_workspace" ON public.partners;
CREATE POLICY "partners_workspace" ON public.partners
  FOR ALL
  USING (workspace_id = public.my_workspace_id())
  WITH CHECK (workspace_id = public.my_workspace_id());

-- ── leads policies ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "leads_workspace" ON public.leads;
CREATE POLICY "leads_workspace" ON public.leads
  FOR ALL
  USING (workspace_id = public.my_workspace_id())
  WITH CHECK (workspace_id = public.my_workspace_id());

-- ── dreaming_reports policies ─────────────────────────────────────────────────
DROP POLICY IF EXISTS "dreaming_reports_workspace" ON public.dreaming_reports;
CREATE POLICY "dreaming_reports_workspace" ON public.dreaming_reports
  FOR ALL
  USING (workspace_id = public.my_workspace_id())
  WITH CHECK (workspace_id = public.my_workspace_id());

-- ── legacy_allocations policies ───────────────────────────────────────────────
DROP POLICY IF EXISTS "legacy_allocations_workspace" ON public.legacy_allocations;
CREATE POLICY "legacy_allocations_workspace" ON public.legacy_allocations
  FOR ALL
  USING (workspace_id = public.my_workspace_id())
  WITH CHECK (workspace_id = public.my_workspace_id());

-- ── legacy_fund policies ──────────────────────────────────────────────────────
DROP POLICY IF EXISTS "legacy_fund_workspace" ON public.legacy_fund;
CREATE POLICY "legacy_fund_workspace" ON public.legacy_fund
  FOR ALL
  USING (workspace_id = public.my_workspace_id())
  WITH CHECK (workspace_id = public.my_workspace_id());
