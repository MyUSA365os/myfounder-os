CREATE OR REPLACE FUNCTION public.signup_allowed()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NOT EXISTS (SELECT 1 FROM auth.users);
$$;

REVOKE ALL ON FUNCTION public.signup_allowed() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.signup_allowed() TO anon, authenticated, service_role;

-- Hard enforcement: the existing signup handler rejects any account after the first.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM auth.users WHERE id <> NEW.id) THEN
    RAISE EXCEPTION 'Signups are closed. This workspace is invite-only.'
      USING ERRCODE = 'check_violation';
  END IF;

  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;