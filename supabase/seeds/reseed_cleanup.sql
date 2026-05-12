-- ─────────────────────────────────────────────────────────────────────────────
-- Reseed Cleanup — remove orphan workspace and its data
--
-- Run this in Supabase SQL Editor BEFORE re-running dev_seed.sql
-- This removes rows tied to the previous (deleted) auth user.
-- ─────────────────────────────────────────────────────────────────────────────

-- Delete child data first
DELETE FROM public.revenue_lanes      WHERE workspace_id = '6d3f74a4-048b-4a2c-9c2a-46d6250f7766';
DELETE FROM public.offer_tiers        WHERE workspace_id = '6d3f74a4-048b-4a2c-9c2a-46d6250f7766';
DELETE FROM public.revenue_events     WHERE workspace_id = '6d3f74a4-048b-4a2c-9c2a-46d6250f7766';
DELETE FROM public.revenue_snapshots  WHERE workspace_id = '6d3f74a4-048b-4a2c-9c2a-46d6250f7766';
DELETE FROM public.partners           WHERE workspace_id = '6d3f74a4-048b-4a2c-9c2a-46d6250f7766';
DELETE FROM public.leads              WHERE workspace_id = '6d3f74a4-048b-4a2c-9c2a-46d6250f7766';
DELETE FROM public.legacy_allocations WHERE workspace_id = '6d3f74a4-048b-4a2c-9c2a-46d6250f7766';
DELETE FROM public.legacy_fund        WHERE workspace_id = '6d3f74a4-048b-4a2c-9c2a-46d6250f7766';

-- Then delete the orphan workspace itself
DELETE FROM public.workspaces WHERE id = '6d3f74a4-048b-4a2c-9c2a-46d6250f7766';

-- Verify only your current workspace remains
SELECT id, owner_id, name FROM public.workspaces;
