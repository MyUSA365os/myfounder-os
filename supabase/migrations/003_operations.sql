-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 003 — Operations tables
-- Depends on: 001_core.sql, 002_revenue.sql
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Partners (operator network) ───────────────────────────────────────────────

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

COMMENT ON TABLE public.partners IS 'Licensed operators in the MyUSA network.';
CREATE INDEX IF NOT EXISTS idx_partners_workspace ON public.partners(workspace_id);

-- ── Leads (outreach pipeline) ─────────────────────────────────────────────────

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

COMMENT ON TABLE public.leads IS 'Outreach pipeline — local business prospects.';
CREATE INDEX IF NOT EXISTS idx_leads_workspace ON public.leads(workspace_id, stage);

-- ── Dreaming Engine reports ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.dreaming_reports (
  id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id     UUID         NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  recommendations  JSONB        NOT NULL DEFAULT '[]',
  token_cost_usd   NUMERIC(10,4) NOT NULL DEFAULT 0,
  model_breakdown  JSONB        NOT NULL DEFAULT '{}',
  generated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.dreaming_reports IS 'Dreaming Engine daily AI recommendation outputs.';
CREATE INDEX IF NOT EXISTS idx_dreaming_reports_workspace ON public.dreaming_reports(workspace_id, generated_at DESC);

-- ── Legacy allocations (Family Legacy Mode — revenue splits) ──────────────────

CREATE TABLE IF NOT EXISTS public.legacy_allocations (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID        NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  label        TEXT        NOT NULL,
  pct          INT         NOT NULL CHECK (pct >= 0 AND pct <= 100),
  sort_order   INT         NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.legacy_allocations IS 'Revenue split percentages for Family Legacy Mode.';

-- ── Legacy fund balance ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.legacy_fund (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  UUID        NOT NULL UNIQUE REFERENCES public.workspaces(id) ON DELETE CASCADE,
  balance_cents BIGINT      NOT NULL DEFAULT 0,
  target_cents  BIGINT      NOT NULL DEFAULT 1000000,   -- $10,000 default target
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.legacy_fund IS 'Running legacy fund balance and target for Family Legacy Mode.';
