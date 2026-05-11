-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 005 — RLS performance indexes
-- Patches two missing indexes that hot RLS paths depend on.
--
-- Run AFTER 001-004 (safe to run on existing data — uses IF NOT EXISTS).
-- ─────────────────────────────────────────────────────────────────────────────

-- ── workspaces.owner_id ───────────────────────────────────────────────────────
-- my_workspace_id() does `SELECT id FROM workspaces WHERE owner_id = auth.uid()`
-- on every RLS check on every workspace-scoped table. This index turns that
-- lookup into a single index seek instead of a sequential scan.

CREATE INDEX IF NOT EXISTS idx_workspaces_owner ON public.workspaces(owner_id);

-- ── legacy_allocations.workspace_id ───────────────────────────────────────────
-- All other workspace-scoped tables already have this index from 002/003.
-- This one was missed.

CREATE INDEX IF NOT EXISTS idx_legacy_allocations_workspace
  ON public.legacy_allocations(workspace_id, sort_order);
