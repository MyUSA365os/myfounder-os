import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const BRANDS = [{ name: "CleanMyTap", subAccountId: "7EEuME2zYZSLui2b3BOX" }];

export type CampaignRow = {
  source: string | null;
  medium: string | null;
  campaign: string | null;
  content: string | null;
  leads: number;
  qualifiedLeads: number;
  appointmentsBooked: number;
  appointmentsCompleted: number;
  appointmentsNoShow: number;
  dealsWon: number;
  wonValueByCurrency: Record<string, number>;
};

export type BrandReport = {
  brand: string;
  rows: CampaignRow[];
  truncated: boolean;
  error: string | null;
};

export type CampaignReport =
  | { configured: false }
  | { configured: true; brands: BrandReport[] };

export const getCampaignPerformance = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { days?: number } | undefined) => {
    const d = input?.days;
    return { days: d === 7 || d === 90 ? d : 30 };
  })
  .handler(async ({ data }): Promise<CampaignReport> => {
    const key = process.env["UGOTLEADS_REPORTS_KEY"];
    if (!key) return { configured: false };

    const brands = await Promise.all(
      BRANDS.map(async (b): Promise<BrandReport> => {
        try {
          const url = `https://app.ugotleads.io/api/agent/v1/reports/campaigns?subAccountId=${encodeURIComponent(b.subAccountId)}&days=${data.days}`;
          const res = await fetch(url, { headers: { Authorization: `Bearer ${key}` } });
          if (res.status !== 200) {
            return { brand: b.name, rows: [], truncated: false, error: "unavailable" };
          }
          const json = (await res.json()) as unknown;
          const obj = (Array.isArray(json) ? { rows: json } : json) as {
            rows?: CampaignRow[];
            truncated?: boolean;
          };
          return {
            brand: b.name,
            rows: Array.isArray(obj.rows) ? obj.rows : [],
            truncated: !!obj.truncated,
            error: null,
          };
        } catch {
          return { brand: b.name, rows: [], truncated: false, error: "unavailable" };
        }
      }),
    );
    return { configured: true, brands };
  });
