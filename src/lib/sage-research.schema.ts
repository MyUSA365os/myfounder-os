import { z } from "zod";

const code = z
  .string()
  .min(1)
  .max(160)
  .regex(/^[A-Za-z0-9_.:/-]+$/);
const optionalCode = code.nullish().transform((value) => value ?? null);
// Business text only: no markup, control characters, emails or phone-like strings.
const text = (max: number) =>
  z
    .string()
    .trim()
    .min(1)
    .max(max)
    .refine(
      (value) =>
        !/[<>@]|\+?\d[\d ().-]{6,}\d/.test(value) &&
        !Array.from(value).some((char) => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127),
    )
    .nullish()
    .transform((value) => value ?? null);
const website = z
  .string()
  .max(2048)
  .refine((value) => {
    try {
      const url = new URL(value);
      return (
        ["http:", "https:"].includes(url.protocol) &&
        !url.username &&
        !url.password &&
        !/[\s\\]/.test(value) &&
        !!url.hostname
      );
    } catch {
      return false;
    }
  })
  // Omit the entire optional website if it could carry private query or fragment data.
  .transform((value) => (/[?#]/.test(value) ? null : value))
  .nullish()
  .transform((value) => value ?? null);
const item = z
  .object({
    prospectId: code,
    businessName: text(120),
    category: text(120),
    website,
    city: text(80),
    state: text(80),
    lifecycleStage: optionalCode,
    verificationState: optionalCode,
    researchPriorityScore: z
      .object({
        value: z.number().finite().nullable().optional(),
        state: optionalCode,
      })
      .strip()
      .nullish(),
    source: z.object({ type: optionalCode, externalId: optionalCode }).strip().nullish(),
    outreach: z.object({ status: optionalCode }).strip().nullish(),
    isQa: z.boolean().nullish(),
    isSynthetic: z.boolean().nullish(),
    isTest: z.boolean().nullish(),
    isDemo: z.boolean().nullish(),
  })
  .strip();
const envelope = z
  .object({
    data: z
      .object({
        subAccountId: code,
        items: z.array(item).max(10),
        nextCursor: z.string().max(2048).nullable(),
      })
      .strict(),
  })
  .strict();
const qaCode = /(?:^|[\s_.:/-])(qa|synthetic|test|demo|example)(?:$|[\s_.:/-])/i;

export function researchContactRule(status: string | null) {
  const normalized = status?.toLowerCase().replace(/[.:/-]/g, "_") ?? "";
  return /suppres|do_not_contact|donotcontact|dnc|unsubscrib|opt_?out|blocked/.test(normalized)
    ? "DO NOT CONTACT"
    : "Owner should verify source, fit and consent before any contact.";
}

export function projectSageResearch(input: unknown, mainId: string) {
  const { data } = envelope.parse(input);
  if (data.subAccountId !== mainId) throw new Error("INVALID_RESEARCH");
  const safeItems = data.items.filter(
    (record) =>
      !record.isQa &&
      !record.isSynthetic &&
      !record.isTest &&
      !record.isDemo &&
      ![
        record.prospectId,
        record.businessName,
        record.category,
        record.lifecycleStage,
        record.verificationState,
        record.source?.type,
        record.source?.externalId,
      ].some((value) => value != null && qaCode.test(value)),
  );
  return {
    excludedCount: data.items.length - safeItems.length,
    items: safeItems.map((record) => ({
      id: record.prospectId,
      businessName: record.businessName,
      category: record.category,
      website: record.website,
      city: record.city,
      state: record.state,
      lifecycleStage: record.lifecycleStage,
      verificationState: record.verificationState,
      priority: record.researchPriorityScore?.value ?? null,
      priorityState: record.researchPriorityScore?.state ?? null,
      source: { type: record.source?.type ?? null, externalId: record.source?.externalId ?? null },
      outreachStatus: record.outreach?.status ?? null,
      nextStep: researchContactRule(record.outreach?.status ?? null),
    })),
  };
}

export type SageResearchReport = ReturnType<typeof projectSageResearch>;
export type SageResearchResult =
  | { configured: false }
  | { configured: true; available: false }
  | { configured: true; available: true; report: SageResearchReport };
