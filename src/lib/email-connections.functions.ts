import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { setResponseHeader } from "@tanstack/react-start/server";
import {
  workspaceInput, businessInput, connectionInput, MAILBOX_BACKEND, publicConnection,
  type Business, type EmailConnection, type EmailAudit,
} from "./email-connections.schema";

export const listEmailWorkspaces = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    setResponseHeader("Cache-Control", "no-store");
    const { data, error } = await context.supabase.from("workspaces")
      .select("id, name").eq("owner_id", context.userId).order("name");
    if (error) throw new Error("Email administration is unavailable right now.");
    return data ?? [];
  });

export const getEmailAdministration = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => workspaceInput.parse(input))
  .handler(async ({ data, context }) => {
    setResponseHeader("Cache-Control", "no-store");
    const { data: workspace } = await context.supabase.from("workspaces")
      .select("id").eq("id", data.workspaceId).eq("owner_id", context.userId).maybeSingle();
    if (!workspace) throw new Error("You do not have permission to manage this workspace.");
    const [businesses, connections, audit] = await Promise.all([
      context.supabase.from("email_businesses").select("id, workspace_id, name, created_at").eq("workspace_id", workspace.id).order("name"),
      context.supabase.from("business_email_connections")
        .select("id, workspace_id, business_id, email, provider, imap_host, imap_port, imap_tls, smtp_host, smtp_port, smtp_tls, status, created_by, created_at, updated_at")
        .eq("workspace_id", workspace.id).order("created_at", { ascending: false }),
      context.supabase.from("business_email_audit")
        .select("id, workspace_id, business_id, connection_id, actor_id, action, created_at")
        .eq("workspace_id", workspace.id).order("created_at", { ascending: false }).limit(30),
    ]);
    if (businesses.error || connections.error || audit.error) throw new Error("Email administration is unavailable right now.");
    return {
      businesses: (businesses.data ?? []) as Business[],
      connections: (connections.data ?? []).map((row) => publicConnection(row as EmailConnection)),
      audit: (audit.data ?? []) as EmailAudit[],
      backend: MAILBOX_BACKEND,
    };
  });

export const createEmailBusiness = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => businessInput.parse(input))
  .handler(async ({ data, context }) => {
    setResponseHeader("Cache-Control", "no-store");
    const { data: workspace } = await context.supabase.from("workspaces").select("id")
      .eq("id", data.workspaceId).eq("owner_id", context.userId).maybeSingle();
    if (!workspace) throw new Error("You do not have permission to manage this workspace.");
    const { data: business, error } = await context.supabase.from("email_businesses")
      .insert({ workspace_id: workspace.id, name: data.name })
      .select("id, workspace_id, name, created_at").single();
    if (error || !business) return { ok: false as const, error: "Unable to add business. Check whether it already exists." };
    return { ok: true as const, business: business as Business };
  });

export const saveEmailConfiguration = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => connectionInput.parse(input))
  .handler(async ({ data, context }) => {
    setResponseHeader("Cache-Control", "no-store");
    const { data: workspace } = await context.supabase.from("workspaces").select("id")
      .eq("id", data.workspaceId).eq("owner_id", context.userId).maybeSingle();
    if (!workspace) throw new Error("You do not have permission to manage this workspace.");
    const { data: business } = await context.supabase.from("email_businesses").select("id")
      .eq("id", data.businessId).eq("workspace_id", workspace.id).maybeSingle();
    if (!business) throw new Error("You do not have permission to manage this business.");
    const { error } = await context.supabase.from("business_email_connections").insert({
      workspace_id: workspace.id, business_id: business.id, email: data.email,
      provider: data.provider, imap_host: data.imapHost, imap_port: data.imapPort,
      imap_tls: data.imapTls, smtp_host: data.smtpHost, smtp_port: data.smtpPort,
      smtp_tls: data.smtpTls, status: "needs_credentials", created_by: context.userId,
    });
    if (error) return { ok: false as const, error: "Unable to save configuration. Check whether this mailbox already exists." };
    return { ok: true as const };
  });

// Intentionally no credential, connection-test, sync or send endpoint.
// Adding a project secret does not enable transport. See docs/business-email-backend.md.