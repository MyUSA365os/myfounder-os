CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF COALESCE(NEW.raw_user_meta_data->>'provisioned_by', '') <> 'owner'
     AND EXISTS (SELECT 1 FROM auth.users WHERE id <> NEW.id) THEN
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
$function$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.provision_user_workspace(user_id uuid, workspace_name text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  ws_id uuid;
BEGIN
  UPDATE public.workspaces
     SET name = workspace_name, updated_at = now()
   WHERE owner_id = user_id
  RETURNING id INTO ws_id;

  RETURN ws_id;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.provision_user_workspace(uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.provision_user_workspace(uuid, text) TO service_role;