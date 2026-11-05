import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Section } from "@/components/dashboard/section";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import {
  getCampaignPerformance,
  type BrandReport,
  type CampaignRow,
} from "@/lib/campaigns.functions";

type Days = 7 | 30 | 90;

function value(r: CampaignRow) {
  return Object.values(r.wonValueByCurrency ?? {}).reduce((a, b) => a + (Number(b) || 0), 0);
}

function formatValue(by: Record<string, number>) {
  const entries = Object.entries(by ?? {}).filter(([, v]) => v);
  if (entries.length === 0) return "—";
  return entries
    .map(([cur, v]) => {
      try {
        return new Intl.NumberFormat("en-US", { style: "currency", currency: cur, maximumFractionDigits: 0 }).format(v);
      } catch {
        return `${v.toLocaleString("en-US")} ${cur}`;
      }
    })
    .join(" + ");
}

function pct(n: number, leads: number) {
  return leads === 0 ? "n/a" : `${Math.round((n / leads) * 100)}%`;
}

function sortRows(rows: CampaignRow[]) {
  return [...rows].sort(
    (a, b) =>
      value(b) - value(a) ||
      b.dealsWon - a.dealsWon ||
      b.appointmentsCompleted - a.appointmentsCompleted ||
      b.appointmentsBooked - a.appointmentsBooked ||
      b.qualifiedLeads - a.qualifiedLeads ||
      b.leads - a.leads,
  );
}

function BrandBlock({ b }: { b: BrandReport }) {
  if (b.error) {
    return <p className="py-4 text-sm text-muted-foreground">Unavailable right now.</p>;
  }
  const rows = sortRows(b.rows);
  const sum = (k: keyof CampaignRow) => rows.reduce((a, r) => a + (Number(r[k]) || 0), 0);
  const totalValue: Record<string, number> = {};
  rows.forEach((r) =>
    Object.entries(r.wonValueByCurrency ?? {}).forEach(([c, v]) => {
      totalValue[c] = (totalValue[c] ?? 0) + (Number(v) || 0);
    }),
  );
  const summary = [
    ["Leads", sum("leads")],
    ["Qualified", sum("qualifiedLeads")],
    ["Booked", sum("appointmentsBooked")],
    ["Completed", sum("appointmentsCompleted")],
    ["No-shows", sum("appointmentsNoShow")],
    ["Won", sum("dealsWon")],
  ] as const;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="text-sm font-semibold text-foreground">{b.brand}</span>
        {summary.map(([l, v]) => (
          <span key={l}>
            {l} <span className="font-medium tabular-nums text-foreground">{v}</span>
          </span>
        ))}
        <span>
          Recorded deal value{" "}
          <span className="font-medium tabular-nums text-foreground">{formatValue(totalValue)}</span>
        </span>
      </div>
      {rows.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">
          No leads from tracked campaign links in this range yet.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Source · Campaign</th>
                <th className="px-3 py-2 text-left font-medium">Post / content</th>
                <th className="px-3 py-2 text-right font-medium">Leads</th>
                <th className="px-3 py-2 text-right font-medium">Qualified</th>
                <th className="px-3 py-2 text-right font-medium">Booked</th>
                <th className="px-3 py-2 text-right font-medium">Completed</th>
                <th className="px-3 py-2 text-right font-medium">Won</th>
                <th className="px-3 py-2 text-right font-medium">Recorded deal value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((r, i) => (
                <tr key={i}>
                  <td className="px-3 py-2 text-foreground">
                    {r.source || "—"} · {r.campaign || "—"}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">{r.content || "—"}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-foreground">{r.leads}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                    {r.qualifiedLeads} <span className="text-xs">({pct(r.qualifiedLeads, r.leads)})</span>
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">{r.appointmentsBooked}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">{r.appointmentsCompleted}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                    {r.dealsWon} <span className="text-xs">({pct(r.dealsWon, r.leads)})</span>
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums font-medium text-foreground">
                    {formatValue(r.wonValueByCurrency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        Recorded deal value is the value of won deals in uGotLeads, not collected payments. Commissions are not tracked.
      </p>
    </div>
  );
}

export function CampaignPerformance() {
  const [days, setDays] = useState<Days>(30);
  const { user } = useAuth();
  const fetchReport = useServerFn(getCampaignPerformance);
  const { data, isLoading, isError } = useQuery({
    queryKey: ["campaign-performance", days],
    queryFn: () => fetchReport({ data: { days } }),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <Section
      title="Campaign performance"
      description="Leads from tracked links (first touch) and what they became · from uGotLeads"
      action={
        <div className="flex gap-1">
          {([7, 30, 90] as Days[]).map((d) => (
            <Button key={d} size="sm" variant={d === days ? "secondary" : "ghost"} className="h-7 px-2 text-xs" onClick={() => setDays(d)}>
              {d}d
            </Button>
          ))}
        </div>
      }
    >
      {isLoading || !user ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      ) : isError || !data ? (
        <p className="py-4 text-sm text-muted-foreground">Unavailable right now.</p>
      ) : !data.configured ? (
        <p className="py-4 text-sm text-muted-foreground">Campaign reporting is not connected yet.</p>
      ) : (
        <div className="space-y-8">
          {data.brands.map((b) => (
            <BrandBlock key={b.brand} b={b} />
          ))}
        </div>
      )}
    </Section>
  );
}
