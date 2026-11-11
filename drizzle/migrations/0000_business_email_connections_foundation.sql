CREATE TABLE public.email_businesses (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 workspace_id uuid NOT NULL REFERENCES public.workspaces(id),
 name text NOT NULL CHECK (length(btrim(name)) BETWEEN 1 AND 120),
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE (workspace_id, id), UNIQUE (workspace_id, name)
);
GRANT SELECT, INSERT ON public.email_businesses TO authenticated;
GRANT ALL ON public.email_businesses TO service_role;
ALTER TABLE public.email_businesses ENABLE ROW LEVEL SECURITY;
CREATE POLICY email_businesses_owner ON public.email_businesses FOR ALL TO authenticated
 USING (EXISTS (SELECT 1 FROM public.workspaces w WHERE w.id = workspace_id AND w.owner_id = auth.uid()))
 WITH CHECK (EXISTS (SELECT 1 FROM public.workspaces w WHERE w.id = workspace_id AND w.owner_id = auth.uid()));

CREATE TABLE public.business_email_connections (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 workspace_id uuid NOT NULL REFERENCES public.workspaces(id),
 business_id uuid NOT NULL,
 email text NOT NULL CHECK (length(email) BETWEEN 3 AND 254 AND email = lower(email)),
 provider text NOT NULL CHECK (provider IN ('namecheap','manual')),
 imap_host text NOT NULL CHECK (length(imap_host) BETWEEN 3 AND 253),
 imap_port integer NOT NULL DEFAULT 993 CHECK (imap_port = 993),
 imap_tls boolean NOT NULL DEFAULT true CHECK (imap_tls),
 smtp_host text NOT NULL CHECK (length(smtp_host) BETWEEN 3 AND 253),
 smtp_port integer NOT NULL DEFAULT 465 CHECK (smtp_port = 465),
 smtp_tls boolean NOT NULL DEFAULT true CHECK (smtp_tls),
 status text NOT NULL DEFAULT 'needs_credentials' CHECK (status IN ('not_connected','needs_credentials')),
 created_by uuid NOT NULL DEFAULT auth.uid() CHECK (created_by = auth.uid()),
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY (workspace_id, business_id) REFERENCES public.email_businesses(workspace_id, id),
 UNIQUE (workspace_id, business_id, email)
);
GRANT SELECT, INSERT ON public.business_email_connections TO authenticated;
GRANT ALL ON public.business_email_connections TO service_role;
ALTER TABLE public.business_email_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY business_email_connections_owner ON public.business_email_connections FOR ALL TO authenticated
 USING (EXISTS (SELECT 1 FROM public.workspaces w WHERE w.id = workspace_id AND w.owner_id = auth.uid()))
 WITH CHECK (EXISTS (SELECT 1 FROM public.workspaces w WHERE w.id = workspace_id AND w.owner_id = auth.uid()));

CREATE TABLE public.business_email_audit (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 workspace_id uuid NOT NULL REFERENCES public.workspaces(id),
 business_id uuid NOT NULL,
 connection_id uuid REFERENCES public.business_email_connections(id),
 actor_id uuid NOT NULL,
 action text NOT NULL CHECK (action IN ('business_created','configuration_saved')),
 created_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY (workspace_id, business_id) REFERENCES public.email_businesses(workspace_id, id)
);
GRANT SELECT ON public.business_email_audit TO authenticated;
GRANT ALL ON public.business_email_audit TO service_role;
ALTER TABLE public.business_email_audit ENABLE ROW LEVEL SECURITY;
CREATE POLICY business_email_audit_owner_read ON public.business_email_audit FOR SELECT TO authenticated
 USING (EXISTS (SELECT 1 FROM public.workspaces w WHERE w.id = workspace_id AND w.owner_id = auth.uid()));

CREATE FUNCTION public.audit_business_email_configuration() RETURNS trigger
 LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authenticated owner required'; END IF;
 IF TG_TABLE_NAME = 'email_businesses' THEN
  INSERT INTO public.business_email_audit(workspace_id,business_id,actor_id,action)
  VALUES(NEW.workspace_id,NEW.id,auth.uid(),'business_created');
 ELSE
  INSERT INTO public.business_email_audit(workspace_id,business_id,connection_id,actor_id,action)
  VALUES(NEW.workspace_id,NEW.business_id,NEW.id,auth.uid(),'configuration_saved');
 END IF;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.audit_business_email_configuration() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER audit_email_business AFTER INSERT ON public.email_businesses FOR EACH ROW EXECUTE FUNCTION public.audit_business_email_configuration();
CREATE TRIGGER audit_email_connection AFTER INSERT ON public.business_email_connections FOR EACH ROW EXECUTE FUNCTION public.audit_business_email_configuration();
CREATE INDEX business_email_audit_workspace_time ON public.business_email_audit(workspace_id,created_at DESC);
COMMENT ON TABLE public.business_email_connections IS 'Configuration only: no credentials, no verified connections, no sending. Secure transport adapter required.';