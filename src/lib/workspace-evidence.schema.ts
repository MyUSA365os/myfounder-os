import { z } from "zod";

// Identifiers and fixed codes only; never accept narrative/action/contact fields.
const code = z
  .string()
  .min(1)
  .max(160)
  .regex(/^[A-Za-z0-9_.:/-]+$/);
const timestamp = z.string().datetime({ offset: true });
const count = z.number().int().nonnegative().safe();
const cost = z.object({
  aiKnownMicrocents: count,
  aiUnknownRuns: count,
  capabilityKnownMicrocents: count,
  capabilityUnknownRuns: count,
});
const run = z.object({
  id: code,
  workflowKey: code,
  status: code,
  currentStepKey: code.nullable(),
  waitingReason: code.nullable(),
  correlationId: code.nullable(),
  createdAt: timestamp,
  updatedAt: timestamp,
  cost: cost.nullable(),
});
const humanAction = z.object({
  id: code,
  actionType: code,
  status: code,
  priority: code,
  correlationId: code.nullable(),
  workflowRunId: code.nullable(),
  createdAt: timestamp,
});
const envelope = z.object({
  data: z.object({
    source: z.literal("ugotleads_operating_memory"),
    scope: z.object({ subAccountId: code }),
    sampling: z.object({
      bounded: z.literal(true),
      capPerCollection: z.literal(100),
      sampleLimited: z.boolean(),
      noTotalClaims: z.literal(true),
    }),
    runs: z.array(run).max(100),
    humanActions: z.array(humanAction).max(100),
  }),
});

export function projectWorkspaceEvidence(input: unknown, mainId: string) {
  const { data } = envelope.parse(input);
  if (data.scope.subAccountId !== mainId) throw new Error("INVALID_EVIDENCE");
  return {
    source: data.source,
    sampling: data.sampling,
    runs: data.runs.slice(0, 10),
    humanActions: data.humanActions.slice(0, 10),
  };
}

export type WorkspaceEvidence = ReturnType<typeof projectWorkspaceEvidence>;
export type WorkspaceEvidenceResult =
  | { configured: false }
  | { configured: true; available: false; reason: "pending_release" | "unavailable" }
  | { configured: true; available: true; evidence: WorkspaceEvidence };
