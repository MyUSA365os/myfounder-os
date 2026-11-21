import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { readWorkspaceEvidence } from "./workspace-evidence.server";

export const getWorkspaceEvidence = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    setResponseHeader("Cache-Control", "no-store");
    return readWorkspaceEvidence(context.userId, {
      ownerUid: process.env["FOUNDER_HQ_OWNER_UID"],
      key: process.env["UGOTLEADS_WORKSPACE_READONLY_KEY"],
      mainId: process.env["UGOTLEADS_MAIN_SUB_ACCOUNT_ID"],
    });
  });
