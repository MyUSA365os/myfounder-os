-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 001 — Core: profiles + workspaces
-- Project: lqgdiuovlutugreuzqkl  (Founder Revenue OS — NOT MyUSALocal)
--
-- Run in: Supabase Dashboard → SQL Editor → New query → paste → Run
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Profiles ──────────────────────────────────────────────────────────────────
-- Auth-linked. One row per auth.users entry. Created automatically on signup.

CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.profiles IS 'One row per Supabase auth user. Auto-created via trigger.';

-- Auto-create profile on signup
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

-- ── Workspaces ────────────────────────────────────────────────────────────────
-- One workspace per founder. Auto-created alongside their profile.

CREATE TABLE IF NOT EXISTS public.workspaces (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL DEFAULT 'Founder HQ',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.workspaces IS 'One workspace per founder. All data scoped to workspace_id.';

-- Auto-create workspace when profile is created
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
