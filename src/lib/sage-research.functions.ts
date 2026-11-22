import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { readSageResearch } from "./sage-research.server";
import { readSageAssignment } from "./sage-assignment.server";
import { z } from "zod";

export const reviewSageProspects = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    setResponseHeader("Cache-Control", "no-store");
    return readSageResearch(context.userId, {
      ownerUid: process.env["FOUNDER_HQ_OWNER_UID"],
      key: process.env["UGOTLEADS_SAGE_RESEARCH_READONLY_KEY"],
      mainId: process.env["UGOTLEADS_MAIN_SUB_ACCOUNT_ID"],
    });
  });

export const getSageAssignment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .string()
      .regex(/^[A-Za-z0-9_-]{1,160}$/)
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    setResponseHeader("Cache-Control", "no-store");
    return readSageAssignment(context.userId, data, {
      ownerUid: process.env["FOUNDER_HQ_OWNER_UID"],
      key: process.env["UGOTLEADS_SAGE_RESEARCH_READONLY_KEY"],
      mainId: process.env["UGOTLEADS_MAIN_SUB_ACCOUNT_ID"],
    });
  });
