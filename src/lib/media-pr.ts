export const mediaKinds = {
  campaign: "Campaigns",
  pitch: "Pitches",
  relationship: "Journalist relationships",
  response: "Responses",
  interview: "Interviews",
  coverage: "Coverage",
  backlink: "Backlinks",
  referral: "Referral visits",
  lead: "Attributed leads",
  client_result: "Client results",
} as const;

export type MediaKind = keyof typeof mediaKinds;
export type MediaStage = "draft" | "review" | "recorded" | "archived";
export type MediaRecord = {
  id: string;
  workspace_id: string;
  company: string;
  campaign: string;
  kind: MediaKind;
  title: string;
  stage: MediaStage;
  source_ref: string | null;
  quantity: number | null;
  occurred_on: string;
  created_at: string;
};

export const mediaStages: Record<MediaStage, string> = {
  draft: "Draft",
  review: "In review",
  recorded: "Recorded",
  archived: "Archived",
};

export function isQuantityKind(kind: MediaKind) {
  return kind === "referral" || kind === "lead" || kind === "client_result";
}

export function summarizeMedia(records: MediaRecord[]) {
  const totals: Record<MediaKind, number> = {
    campaign: 0,
    pitch: 0,
    relationship: 0,
    response: 0,
    interview: 0,
    coverage: 0,
    backlink: 0,
    referral: 0,
    lead: 0,
    client_result: 0,
  };
  for (const record of records) {
    if (record.stage !== "recorded") continue;
    totals[record.kind] +=
      record.kind === "referral" || record.kind === "lead" ? (record.quantity ?? 0) : 1;
  }
  return totals;
}
