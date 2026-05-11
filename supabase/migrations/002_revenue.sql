-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 002 — Revenue tables
-- Depends on: 001_core.sql
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Revenue lanes (bar chart — MRR split by offer type) ───────────────────────
-- Manually updated by founder or via future automation.

CREATE TABLE IF NOT EXISTS public.revenue_lanes (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID         NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name         TEXT         NOT NULL,
  mrr_cents    BIGINT       NOT NULL DEFAULT 0,       -- stored in cents, displayed as dollars
  share_pct    NUMERIC(5,2) NOT NULL DEFAULT 0,       -- % of total MRR
  delta_pct    NUMERIC(5,2) NOT NULL DEFAULT 0,       -- % change vs prev period
  sort_order   INT          NOT NULL DEFAULT 0,
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.revenue_lanes IS 'MRR breakdown by monetization lane (productized, cohort, etc).';
CREATE INDEX IF NOT EXISTS idx_revenue_lanes_workspace ON public.revenue_lanes(workspace_id, sort_order);

-- ── Offer tiers (product ladder / conversion funnel) ──────────────────────────

CREATE TABLE IF NOT EXISTS public.offer_tiers (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  UUID         NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name          TEXT         NOT NULL,
  price_label   TEXT         NOT NULL DEFAULT 'Free',
  price_cents   BIGINT,                               -- NULL = free
  conv_rate_pct NUMERIC(5,2),                         -- NULL = n/a (e.g. lead magnet)
  active_count  INT          NOT NULL DEFAULT 0,
  sort_order    INT          NOT NULL DEFAULT 0,
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.offer_tiers IS 'Offer ladder — each tier in the product/service stack.';
CREATE INDEX IF NOT EXISTS idx_offer_tiers_workspace ON public.offer_tiers(workspace_id, sort_order);

-- ── Revenue events (wins feed + deal activity) ────────────────────────────────

CREATE TABLE IF NOT EXISTS public.revenue_events (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  UUID        NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  customer_name TEXT        NOT NULL,
  description   TEXT,
  amount_cents  BIGINT      NOT NULL DEFAULT 0,
  event_type    TEXT        NOT NULL DEFAULT 'sale'
                            CHECK (event_type IN ('sale', 'renewal', 'upgrade', 'refund', 'churn')),
  occurred_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.revenue_events IS 'Closed deals, renewals, upgrades — the wins feed.';
CREATE INDEX IF NOT EXISTS idx_revenue_events_workspace_time ON public.revenue_events(workspace_id, occurred_at DESC);

-- ── Revenue KPI snapshots (top stat cards) ────────────────────────────────────
-- One row per day per workspace. Manually updated or via future cron.

CREATE TABLE IF NOT EXISTS public.revenue_snapshots (
  id                    UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id          UUID         NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  net_mrr_cents         BIGINT       NOT NULL DEFAULT 0,
  new_cash_cents        BIGINT       NOT NULL DEFAULT 0,
  avg_order_value_cents BIGINT       NOT NULL DEFAULT 0,
  refund_rate_pct       NUMERIC(5,2) NOT NULL DEFAULT 0,
  net_mrr_delta_pct     NUMERIC(5,2) NOT NULL DEFAULT 0,
  new_cash_delta_pct    NUMERIC(5,2) NOT NULL DEFAULT 0,
  aov_delta_pct         NUMERIC(5,2) NOT NULL DEFAULT 0,
  refund_delta_pct      NUMERIC(5,2) NOT NULL DEFAULT 0,
  snapshot_date         DATE         NOT NULL DEFAULT CURRENT_DATE,
  created_at            TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE(workspace_id, snapshot_date)
);

COMMENT ON TABLE public.revenue_snapshots IS 'Daily KPI snapshots for Revenue stat cards.';
CREATE INDEX IF NOT EXISTS idx_revenue_snapshots_workspace_date ON public.revenue_snapshots(workspace_id, snapshot_date DESC);
