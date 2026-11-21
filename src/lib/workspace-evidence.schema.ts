import { z } from "zod";

// Identifiers and fixed codes only; never accept narrative/action/contact fields.
const code = z
  .string()
  .min(1)
  .max(160)
  .regex(/^[A-Za-z0-9_.:/-]+$/);
const timestamp = z.string().datetime({ offset: true }).nullable();
const count = z.number().int().nonnegative().safe().nullable();
const cost = z
  .object({
    aiKnownMicrocents: count,
    aiUnknownRuns: count,
    capabilityKnownMicrocents: count,
    capabilityUnknownRuns: count,
  })
  .strict();
const run = z
  .object({
    id: code,
    workflowKey: code.nullable(),
    status: code.nullable(),
    currentStepKey: code.nullable(),
    waitingReason: code.nullable(),
    correlationId: code.nullable(),
    createdAt: timestamp,
    updatedAt: timestamp,
    cost: cost.nullable(),
  })
  .strict();
const humanAction = z
  .object({
    id: code,
    actionType: code.nullable(),
    status: code.nullable(),
    priority: code.nullable(),
    correlationId: code.nullable(),
    workflowRunId: code.nullable(),
    createdAt: timestamp,
  })
  .strict();
const envelope = z
  .object({
    data: z
      .object({
        source: z.literal("ugotleads_operating_memory"),
        scope: z.object({ subAccountId: code }).strict(),
        sampling: z
          .object({
            bounded: z.literal(true),
            capPerCollection: z.literal(100),
            sampleLimited: z.boolean(),
            noTotalClaims: z.literal(true),
          })
          .strict(),
        runs: z.array(run).max(100),
        humanActions: z.array(humanAction).max(100),
      })
      .strict(),
  })
  .strict();

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
