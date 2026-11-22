import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { MediaDatabase } from "@/types/database";
import { probePressRanger } from "./press-ranger.server";

export const checkPressRanger = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    setResponseHeader("Cache-Control", "no-store");
    return probePressRanger(
      context.userId,
      {
        ownerUid: process.env.FOUNDER_HQ_OWNER_UID,
        token: process.env.SAGE_PRESS_RANGER_TOKEN,
      },
      async () => {
        const { data: workspace, error } = await context.supabase
          .from("workspaces")
          .select("id")
          .eq("owner_id", context.userId)
          .single();
        if (error || !workspace) throw new Error("Workspace unavailable");
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const admin = supabaseAdmin as unknown as SupabaseClient<MediaDatabase>;
        const { error: auditError } = await admin.from("media_pr_audit").insert({
          workspace_id: workspace.id,
          actor_id: context.userId,
          action: "mcp_probe",
        });
        if (auditError) throw auditError;
      },
    );
  });
