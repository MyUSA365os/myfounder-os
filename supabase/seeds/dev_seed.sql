-- ─────────────────────────────────────────────────────────────────────────────
-- Dev Seed — Founder Revenue OS
-- Run AFTER signing in at least once (so your workspace row exists).
--
-- Step 1: Get your workspace ID:
--   SELECT id FROM workspaces WHERE owner_id = auth.uid();
--
-- Step 2: Replace ALL occurrences of 'YOUR_WORKSPACE_ID' below with that UUID.
-- Step 3: Paste the full file into Supabase SQL Editor → Run.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Revenue lanes ─────────────────────────────────────────────────────────────
INSERT INTO public.revenue_lanes (workspace_id, name, mrr_cents, share_pct, delta_pct, sort_order)
VALUES
  ('YOUR_WORKSPACE_ID', 'Productized service',  1840000, 42,  12,  1),
  ('YOUR_WORKSPACE_ID', 'Cohort program',        1120000, 26,   4,  2),
  ('YOUR_WORKSPACE_ID', 'Templates & kits',       680000, 16,  -3,  3),
  ('YOUR_WORKSPACE_ID', 'Affiliate / rev-share',  490000, 11,  22,  4),
  ('YOUR_WORKSPACE_ID', '1:1 advisory',           230000,  5,  -8,  5)
ON CONFLICT DO NOTHING;

-- ── Offer tiers ───────────────────────────────────────────────────────────────
INSERT INTO public.offer_tiers (workspace_id, name, price_label, price_cents, conv_rate_pct, active_count, sort_order)
VALUES
  ('YOUR_WORKSPACE_ID', 'Lead magnet',  'Free',      0,      NULL,  1284, 1),
  ('YOUR_WORKSPACE_ID', 'Tripwire',     '$29',     2900,      6.4,    82, 2),
  ('YOUR_WORKSPACE_ID', 'Core offer',  '$499',    49900,      9.1,    47, 3),
  ('YOUR_WORKSPACE_ID', 'Expansion',   '$1.9k/mo',190000,    22.0,    19, 4),
  ('YOUR_WORKSPACE_ID', 'Inner circle','$8k/qtr', 800000,    11.0,     4, 5)
ON CONFLICT DO NOTHING;

-- ── Revenue events (wins feed) ────────────────────────────────────────────────
INSERT INTO public.revenue_events (workspace_id, customer_name, description, amount_cents, event_type, occurred_at)
VALUES
  ('YOUR_WORKSPACE_ID', 'Acme Roofing',   'Upgraded to Expansion',  190000, 'upgrade', NOW() - INTERVAL '2 hours'),
  ('YOUR_WORKSPACE_ID', 'Riverline Co.',  'Renewed annual',          598800, 'renewal', NOW() - INTERVAL '1 day'),
  ('YOUR_WORKSPACE_ID', 'Northbeam',      'Closed Core offer',        49900, 'sale',    NOW() - INTERVAL '1 day'),
  ('YOUR_WORKSPACE_ID', 'Studio Ovo',     'Cohort seat sold',         120000, 'sale',    NOW() - INTERVAL '2 days')
ON CONFLICT DO NOTHING;

-- ── Revenue KPI snapshot ──────────────────────────────────────────────────────
INSERT INTO public.revenue_snapshots (
  workspace_id, net_mrr_cents, new_cash_cents, avg_order_value_cents,
  refund_rate_pct, net_mrr_delta_pct, new_cash_delta_pct, aov_delta_pct, refund_delta_pct
)
VALUES (
  'YOUR_WORKSPACE_ID', 4360000, 1182000, 61200,
  1.8, 9, 14, 3, -0.4
)
ON CONFLICT (workspace_id, snapshot_date) DO UPDATE
  SET net_mrr_cents = EXCLUDED.net_mrr_cents,
      new_cash_cents = EXCLUDED.new_cash_cents,
      avg_order_value_cents = EXCLUDED.avg_order_value_cents,
      refund_rate_pct = EXCLUDED.refund_rate_pct;

-- ── Partners ──────────────────────────────────────────────────────────────────
INSERT INTO public.partners (workspace_id, name, market, status, mrr_cents, joined_at)
VALUES
  ('YOUR_WORKSPACE_ID', 'Marcus J.', 'Atlanta, GA',  'active',     124000, '2026-03-01'),
  ('YOUR_WORKSPACE_ID', 'Diane R.',  'Phoenix, AZ',  'active',      89000, '2026-03-15'),
  ('YOUR_WORKSPACE_ID', 'Troy W.',   'Nashville, TN','onboarding',       0, '2026-05-01')
ON CONFLICT DO NOTHING;

-- ── Leads ─────────────────────────────────────────────────────────────────────
INSERT INTO public.leads (workspace_id, name, vertical, stage, score, last_touch_at)
VALUES
  ('YOUR_WORKSPACE_ID', 'AutoNation Gwinnett',   'Auto Dealer',    'email_1_sent', 82, '2026-05-10'),
  ('YOUR_WORKSPACE_ID', 'Precision Auto Repair', 'Auto Repair',    'replied',      91, '2026-05-11'),
  ('YOUR_WORKSPACE_ID', 'Desert Tire & Auto',    'Tire/Detailing', 'new',          67, NULL),
  ('YOUR_WORKSPACE_ID', 'Phoenix Collision Ctr', 'Collision',      'email_2_sent', 74, '2026-05-09')
ON CONFLICT DO NOTHING;

-- ── Legacy allocations ────────────────────────────────────────────────────────
INSERT INTO public.legacy_allocations (workspace_id, label, pct, sort_order)
VALUES
  ('YOUR_WORKSPACE_ID', 'Operating Expenses',   30, 1),
  ('YOUR_WORKSPACE_ID', 'Reinvestment',          20, 2),
  ('YOUR_WORKSPACE_ID', 'Owner Pay',             35, 3),
  ('YOUR_WORKSPACE_ID', 'Legacy / Family Fund',  15, 4)
ON CONFLICT DO NOTHING;

-- ── Legacy fund ───────────────────────────────────────────────────────────────
INSERT INTO public.legacy_fund (workspace_id, balance_cents, target_cents)
VALUES ('YOUR_WORKSPACE_ID', 389100, 1000000)
ON CONFLICT (workspace_id) DO UPDATE
  SET balance_cents = EXCLUDED.balance_cents,
      target_cents  = EXCLUDED.target_cents;
