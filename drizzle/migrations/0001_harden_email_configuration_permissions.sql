REVOKE ALL ON public.email_businesses, public.business_email_connections, public.business_email_audit FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT ON public.email_businesses, public.business_email_connections TO authenticated;
GRANT SELECT ON public.business_email_audit TO authenticated;
GRANT ALL ON public.email_businesses, public.business_email_connections, public.business_email_audit TO service_role;
ALTER TABLE public.business_email_connections ADD CONSTRAINT namecheap_tls_hosts CHECK (provider <> 'namecheap' OR (imap_host = 'mail.privateemail.com' AND smtp_host = 'mail.privateemail.com'));
CREATE OR REPLACE FUNCTION public.audit_business_email_configuration() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
 IF auth.uid() IS NULL OR NOT EXISTS (SELECT 1 FROM public.workspaces w WHERE w.id = NEW.workspace_id AND w.owner_id = auth.uid()) THEN RAISE EXCEPTION 'Authenticated owner required'; END IF;
 IF TG_TABLE_NAME = 'email_businesses' THEN
  INSERT INTO public.business_email_audit(workspace_id,business_id,actor_id,action) VALUES(NEW.workspace_id,NEW.id,auth.uid(),'business_created');
 ELSE
  INSERT INTO public.business_email_audit(workspace_id,business_id,connection_id,actor_id,action) VALUES(NEW.workspace_id,NEW.business_id,NEW.id,auth.uid(),'configuration_saved');
 END IF;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.audit_business_email_configuration() FROM PUBLIC, anon, authenticated;