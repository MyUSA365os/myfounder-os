-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 001 — Core: profiles + workspaces
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.profiles IS 'One row per Supabase auth user. Auto-created via trigger.';

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE IF NOT EXISTS public.workspaces (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL DEFAULT 'Founder HQ',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.workspaces IS 'One workspace per founder. All data scoped to workspace_id.';

CREATE OR REPLACE FUNCTION public.handle_new_workspace()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.workspaces (owner_id, name)
  VALUES (NEW.id, 'Founder HQ')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_workspace();

-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 002 — Revenue tables
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.revenue_lanes (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID         NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name         TEXT         NOT NULL,
  mrr_cents    BIGINT       NOT NULL DEFAULT 0,
  share_pct    NUMERIC(5,2) NOT NULL DEFAULT 0,
  delta_pct    NUMERIC(5,2) NOT NULL DEFAULT 0,
  sort_order   INT          NOT NULL DEFAULT 0,
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_revenue_lanes_workspace ON public.revenue_lanes(workspace_id, sort_order);

CREATE TABLE IF NOT EXISTS public.offer_tiers (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  UUID         NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name          TEXT         NOT NULL,
  price_label   TEXT         NOT NULL DEFAULT 'Free',
  price_cents   BIGINT,
  conv_rate_pct NUMERIC(5,2),
  active_count  INT          NOT NULL DEFAULT 0,
  sort_order    INT          NOT NULL DEFAULT 0,
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_offer_tiers_workspace ON public.offer_tiers(workspace_id, sort_order);

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
CREATE INDEX IF NOT EXISTS idx_revenue_events_workspace_time ON public.revenue_events(workspace_id, occurred_at DESC);

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
CREATE INDEX IF NOT EXISTS idx_revenue_snapshots_workspace_date ON public.revenue_snapshots(workspace_id, snapshot_date DESC);

-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 003 — Operations tables
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.partners (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID        NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name         TEXT        NOT NULL,
  market       TEXT        NOT NULL,
  status       TEXT        NOT NULL DEFAULT 'onboarding'
                           CHECK (status IN ('active', 'onboarding', 'inactive')),
  mrr_cents    BIGINT      NOT NULL DEFAULT 0,
  joined_at    DATE        NOT NULL DEFAULT CURRENT_DATE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_partners_workspace ON public.partners(workspace_id);

CREATE TABLE IF NOT EXISTS public.leads (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  UUID        NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name          TEXT        NOT NULL,
  vertical      TEXT,
  stage         TEXT        NOT NULL DEFAULT 'new'
                            CHECK (stage IN ('new', 'email_1_sent', 'email_2_sent', 'replied', 'meeting_set', 'closed', 'lost')),
  score         INT         NOT NULL DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  last_touch_at DATE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_leads_workspace ON public.leads(workspace_id, stage);

CREATE TABLE IF NOT EXISTS public.dreaming_reports (
  id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id     UUID         NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  recommendations  JSONB        NOT NULL DEFAULT '[]',
  token_cost_usd   NUMERIC(10,4) NOT NULL DEFAULT 0,
  model_breakdown  JSONB        NOT NULL DEFAULT '{}',
  generated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_dreaming_reports_workspace ON public.dreaming_reports(workspace_id, generated_at DESC);

CREATE TABLE IF NOT EXISTS public.legacy_allocations (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID        NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  label        TEXT        NOT NULL,
  pct          INT         NOT NULL CHECK (pct >= 0 AND pct <= 100),
  sort_order   INT         NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.legacy_fund (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  UUID        NOT NULL UNIQUE REFERENCES public.workspaces(id) ON DELETE CASCADE,
  balance_cents BIGINT      NOT NULL DEFAULT 0,
  target_cents  BIGINT      NOT NULL DEFAULT 1000000,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Data API grants (required by PostgREST; policies scope everything to auth.uid())
-- ─────────────────────────────────────────────────────────────────────────────

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles           TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workspaces         TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.revenue_lanes      TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.offer_tiers        TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.revenue_events     TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.revenue_snapshots  TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.partners           TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leads              TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dreaming_reports   TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.legacy_allocations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.legacy_fund        TO authenticated;

GRANT ALL ON public.profiles           TO service_role;
GRANT ALL ON public.workspaces         TO service_role;
GRANT ALL ON public.revenue_lanes      TO service_role;
GRANT ALL ON public.offer_tiers        TO service_role;
GRANT ALL ON public.revenue_events     TO service_role;
GRANT ALL ON public.revenue_snapshots  TO service_role;
GRANT ALL ON public.partners           TO service_role;
GRANT ALL ON public.leads              TO service_role;
GRANT ALL ON public.dreaming_reports   TO service_role;
GRANT ALL ON public.legacy_allocations TO service_role;
GRANT ALL ON public.legacy_fund        TO service_role;

-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 004 — Row Level Security policies
-- ─────────────────────────────────────────────────────────────────────────────

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

CREATE OR REPLACE FUNCTION public.my_workspace_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.workspaces WHERE owner_id = auth.uid() LIMIT 1;
$$;

DROP POLICY IF EXISTS "profiles_own" ON public.profiles;
CREATE POLICY "profiles_own" ON public.profiles
  FOR ALL TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "workspaces_own" ON public.workspaces;
CREATE POLICY "workspaces_own" ON public.workspaces
  FOR ALL TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "revenue_lanes_workspace" ON public.revenue_lanes;
CREATE POLICY "revenue_lanes_workspace" ON public.revenue_lanes
  FOR ALL TO authenticated
  USING (workspace_id = public.my_workspace_id())
  WITH CHECK (workspace_id = public.my_workspace_id());

DROP POLICY IF EXISTS "offer_tiers_workspace" ON public.offer_tiers;
CREATE POLICY "offer_tiers_workspace" ON public.offer_tiers
  FOR ALL TO authenticated
  USING (workspace_id = public.my_workspace_id())
  WITH CHECK (workspace_id = public.my_workspace_id());

DROP POLICY IF EXISTS "revenue_events_workspace" ON public.revenue_events;
CREATE POLICY "revenue_events_workspace" ON public.revenue_events
  FOR ALL TO authenticated
  USING (workspace_id = public.my_workspace_id())
  WITH CHECK (workspace_id = public.my_workspace_id());

DROP POLICY IF EXISTS "revenue_snapshots_workspace" ON public.revenue_snapshots;
CREATE POLICY "revenue_snapshots_workspace" ON public.revenue_snapshots
  FOR ALL TO authenticated
  USING (workspace_id = public.my_workspace_id())
  WITH CHECK (workspace_id = public.my_workspace_id());

DROP POLICY IF EXISTS "partners_workspace" ON public.partners;
CREATE POLICY "partners_workspace" ON public.partners
  FOR ALL TO authenticated
  USING (workspace_id = public.my_workspace_id())
  WITH CHECK (workspace_id = public.my_workspace_id());

DROP POLICY IF EXISTS "leads_workspace" ON public.leads;
CREATE POLICY "leads_workspace" ON public.leads
  FOR ALL TO authenticated
  USING (workspace_id = public.my_workspace_id())
  WITH CHECK (workspace_id = public.my_workspace_id());

DROP POLICY IF EXISTS "dreaming_reports_workspace" ON public.dreaming_reports;
CREATE POLICY "dreaming_reports_workspace" ON public.dreaming_reports
  FOR ALL TO authenticated
  USING (workspace_id = public.my_workspace_id())
  WITH CHECK (workspace_id = public.my_workspace_id());

DROP POLICY IF EXISTS "legacy_allocations_workspace" ON public.legacy_allocations;
CREATE POLICY "legacy_allocations_workspace" ON public.legacy_allocations
  FOR ALL TO authenticated
  USING (workspace_id = public.my_workspace_id())
  WITH CHECK (workspace_id = public.my_workspace_id());

DROP POLICY IF EXISTS "legacy_fund_workspace" ON public.legacy_fund;
CREATE POLICY "legacy_fund_workspace" ON public.legacy_fund
  FOR ALL TO authenticated
  USING (workspace_id = public.my_workspace_id())
  WITH CHECK (workspace_id = public.my_workspace_id());

-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 005 — RLS performance indexes
-- ─────────────────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_workspaces_owner ON public.workspaces(owner_id);

CREATE INDEX IF NOT EXISTS idx_legacy_allocations_workspace
  ON public.legacy_allocations(workspace_id, sort_order);