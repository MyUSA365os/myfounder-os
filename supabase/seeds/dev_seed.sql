-- ─────────────────────────────────────────────────────────────────────────────
-- Dev Seed — Founder Revenue OS
-- Run AFTER signing in at least once (so your workspace row exists).
--
-- Step 1: Get your workspace ID:
--   SELECT id FROM workspaces WHERE owner_id = auth.uid();
--
-- Step 2: Replace ALL occurrences of '2342fdfe-731f-4f05-961c-a4b1e70a0367' below with that UUID.
-- Step 3: Paste the full file into Supabase SQL Editor → Run.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Revenue lanes ─────────────────────────────────────────────────────────────
INSERT INTO public.revenue_lanes (workspace_id, name, mrr_cents, share_pct, delta_pct, sort_order)
VALUES
  ('2342fdfe-731f-4f05-961c-a4b1e70a0367', 'Productized service',  1840000, 42,  12,  1),
  ('2342fdfe-731f-4f05-961c-a4b1e70a0367', 'Cohort program',        1120000, 26,   4,  2),
  ('2342fdfe-731f-4f05-961c-a4b1e70a0367', 'Templates & kits',       680000, 16,  -3,  3),
  ('2342fdfe-731f-4f05-961c-a4b1e70a0367', 'Affiliate / rev-share',  490000, 11,  22,  4),
  ('2342fdfe-731f-4f05-961c-a4b1e70a0367', '1:1 advisory',           230000,  5,  -8,  5)
ON CONFLICT DO NOTHING;

-- ── Offer tiers ───────────────────────────────────────────────────────────────
INSERT INTO public.offer_tiers (workspace_id, name, price_label, price_cents, conv_rate_pct, active_count, sort_order)
VALUES
  ('2342fdfe-731f-4f05-961c-a4b1e70a0367', 'Lead magnet',  'Free',      0,      NULL,  1284, 1),
  ('2342fdfe-731f-4f05-961c-a4b1e70a0367', 'Tripwire',     '$29',     2900,      6.4,    82, 2),
  ('2342fdfe-731f-4f05-961c-a4b1e70a0367', 'Core offer',  '$499',    49900,      9.1,    47, 3),
  ('2342fdfe-731f-4f05-961c-a4b1e70a0367', 'Expansion',   '$1.9k/mo',190000,    22.0,    19, 4),
  ('2342fdfe-731f-4f05-961c-a4b1e70a0367', 'Inner circle','$8k/qtr', 800000,    11.0,     4, 5)
ON CONFLICT DO NOTHING;

-- ── Revenue events (wins feed) ────────────────────────────────────────────────
INSERT INTO public.revenue_events (workspace_id, customer_name, description, amount_cents, event_type, occurred_at)
VALUES
  ('2342fdfe-731f-4f05-961c-a4b1e70a0367', 'Acme Roofing',   'Upgraded to Expansion',  190000, 'upgrade', NOW() - INTERVAL '2 hours'),
  ('2342fdfe-731f-4f05-961c-a4b1e70a0367', 'Riverline Co.',  'Renewed annual',          598800, 'renewal', NOW() - INTERVAL '1 day'),
  ('2342fdfe-731f-4f05-961c-a4b1e70a0367', 'Northbeam',      'Closed Core offer',        49900, 'sale',    NOW() - INTERVAL '1 day'),
  ('2342fdfe-731f-4f05-961c-a4b1e70a0367', 'Studio Ovo',     'Cohort seat sold',         120000, 'sale',    NOW() - INTERVAL '2 days')
ON CONFLICT DO NOTHING;

-- ── Revenue KPI snapshot ──────────────────────────────────────────────────────
INSERT INTO public.revenue_snapshots (
  workspace_id, net_mrr_cents, new_cash_cents, avg_order_value_cents,
  refund_rate_pct, net_mrr_delta_pct, new_cash_delta_pct, aov_delta_pct, refund_delta_pct
)
VALUES (
  '2342fdfe-731f-4f05-961c-a4b1e70a0367', 4360000, 1182000, 61200,
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
  ('2342fdfe-731f-4f05-961c-a4b1e70a0367', 'Marcus J.', 'Atlanta, GA',  'active',     124000, '2026-03-01'),
  ('2342fdfe-731f-4f05-961c-a4b1e70a0367', 'Diane R.',  'Phoenix, AZ',  'active',      89000, '2026-03-15'),
  ('2342fdfe-731f-4f05-961c-a4b1e70a0367', 'Troy W.',   'Nashville, TN','onboarding',       0, '2026-05-01')
ON CONFLICT DO NOTHING;

-- ── Leads ─────────────────────────────────────────────────────────────────────
INSERT INTO public.leads (workspace_id, name, vertical, stage, score, last_touch_at)
VALUES
  ('2342fdfe-731f-4f05-961c-a4b1e70a0367', 'AutoNation Gwinnett',   'Auto Dealer',    'email_1_sent', 82, '2026-05-10'),
  ('2342fdfe-731f-4f05-961c-a4b1e70a0367', 'Precision Auto Repair', 'Auto Repair',    'replied',      91, '2026-05-11'),
  ('2342fdfe-731f-4f05-961c-a4b1e70a0367', 'Desert Tire & Auto',    'Tire/Detailing', 'new',          67, NULL),
  ('2342fdfe-731f-4f05-961c-a4b1e70a0367', 'Phoenix Collision Ctr', 'Collision',      'email_2_sent', 74, '2026-05-09')
ON CONFLICT DO NOTHING;

-- ── Legacy allocations ────────────────────────────────────────────────────────
INSERT INTO public.legacy_allocations (workspace_id, label, pct, sort_order)
VALUES
  ('2342fdfe-731f-4f05-961c-a4b1e70a0367', 'Operating Expenses',   30, 1),
  ('2342fdfe-731f-4f05-961c-a4b1e70a0367', 'Reinvestment',          20, 2),
  ('2342fdfe-731f-4f05-961c-a4b1e70a0367', 'Owner Pay',             35, 3),
  ('2342fdfe-731f-4f05-961c-a4b1e70a0367', 'Legacy / Family Fund',  15, 4)
ON CONFLICT DO NOTHING;

-- ── Legacy fund ───────────────────────────────────────────────────────────────
INSERT INTO public.legacy_fund (workspace_id, balance_cents, target_cents)
VALUES ('2342fdfe-731f-4f05-961c-a4b1e70a0367', 389100, 1000000)
ON CONFLICT (workspace_id) DO UPDATE
  SET balance_cents = EXCLUDED.balance_cents,
      target_cents  = EXCLUDED.target_cents;
