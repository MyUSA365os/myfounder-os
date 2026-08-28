REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_workspace() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.my_workspace_id() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.my_workspace_id() TO authenticated;