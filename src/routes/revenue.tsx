import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Section } from "@/components/dashboard/section";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Sparkles, Trophy } from "lucide-react";
import { useWorkspace } from "@/hooks/useWorkspace";
import {
  useRevenueLanes,
  useOfferTiers,
  useRecentWins,
  useRevenueSnapshot,
  formatDollars,
  formatWinAmount,
  formatRelativeTime,
} from "@/hooks/useRevenue";

export const Route = createFileRoute("/revenue")({
  head: () => ({
    meta: [{ title: "Revenue — Founder OS" }],
  }),
  component: RevenuePage,
});

// ── Static content (AI recommendation — will be Dreaming Engine output later) ──

const RECOMMENDATION = {
  headline: "Launch a 14-day expansion offer to your 19 active Core customers.",
  body: `Conversion from Core → Expansion is running at 22% — well above your 12% baseline.
    Send a constrained-capacity offer (5 seats) priced at $1,900/mo with a hands-on onboarding lane.
    Estimated lift: +$9,500 MRR in 21 days.`,
  lift: "+$9,500 MRR",
  secondaryActions: [
    { t: "Reactivate 38 dormant tripwire buyers", v: "+$1.1k est." },
    { t: "Bundle Templates + Cohort seat", v: "+18% AOV" },
    { t: "Raise Core price to $599", v: "Low risk" },
    { t: "Affiliate push: 12 warm partners", v: "+$2.4k est." },
  ],
};

// ── Skeleton helpers ──────────────────────────────────────────────────────────

function SkeletonRows({ count, cols }: { count: number; cols: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <tr key={i}>
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j} className="px-3 py-2">
              <Skeleton className="h-4 w-full" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

function RevenuePage() {
  const { data: workspace } = useWorkspace();
  const wid = workspace?.id;

  const { data: snapshot, isLoading: snapshotLoading } = useRevenueSnapshot(wid);
  const { data: lanes,    isLoading: lanesLoading }    = useRevenueLanes(wid);
  const { data: tiers,    isLoading: tiersLoading }    = useOfferTiers(wid);
  const { data: wins,     isLoading: winsLoading }     = useRecentWins(wid);

  // ── Stat card values ────────────────────────────────────────────────────────
  const netMrr  = snapshot ? formatDollars(snapshot.net_mrr_cents)            : "—";
  const newCash = snapshot ? formatDollars(snapshot.new_cash_cents)           : "—";
  const aov     = snapshot ? formatDollars(snapshot.avg_order_value_cents)    : "—";
  const refund  = snapshot ? `${snapshot.refund_rate_pct}%`                   : "—";

  return (
    <>
      <AppHeader
        title="Revenue"
        subtitle="Offer performance, ladder health, and the next monetization move."
      />
      <main className="flex-1 space-y-6 p-6">

        {/* ── KPI Stat Cards ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {snapshotLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[88px] w-full rounded-xl" />
            ))
          ) : (
            <>
              <StatCard label="Net MRR"         value={netMrr}  delta={snapshot?.net_mrr_delta_pct    ?? 0} hint="vs. last 30 days" />
              <StatCard label="New cash"         value={newCash} delta={snapshot?.new_cash_delta_pct   ?? 0} hint="this week" tone="accent" />
              <StatCard label="Avg. order value" value={aov}     delta={snapshot?.aov_delta_pct        ?? 0} />
              <StatCard label="Refund rate"      value={refund}  delta={snapshot?.refund_delta_pct     ?? 0} hint="trailing 30d" />
            </>
          )}
        </div>

        {/* ── Recommendation + Recent Wins ────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Section
            title="Best next monetization action"
            description="Generated from offer signals, prospect heat, and capacity."
            className="lg:col-span-2 border-accent/30"
            action={
              <Badge variant="secondary" className="gap-1">
                <Sparkles className="h-3 w-3" /> Recommendation
              </Badge>
            }
          >
            <div className="rounded-lg bg-gradient-to-br from-accent/10 via-card to-card p-5">
              <div className="text-sm font-medium text-foreground">
                {RECOMMENDATION.headline}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {RECOMMENDATION.body.split(RECOMMENDATION.lift)[0]}
                <span className="font-medium text-foreground">{RECOMMENDATION.lift}</span>
                {RECOMMENDATION.body.split(RECOMMENDATION.lift)[1]}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm">
                  Draft the offer
                  <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Button>
                <Button size="sm" variant="outline">Open in playbook</Button>
                <Button size="sm" variant="ghost">Snooze 7d</Button>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {RECOMMENDATION.secondaryActions.map((r) => (
                <div
                  key={r.t}
                  className="flex items-center justify-between rounded-md border border-border bg-background/40 px-3 py-2 text-sm"
                >
                  <span className="text-foreground">{r.t}</span>
                  <span className="text-xs text-muted-foreground">{r.v}</span>
                </div>
              ))}
            </div>
          </Section>

          {/* ── Recent Wins ──────────────────────────────────────────────── */}
          <Section
            title="Recent wins"
            description="Closed revenue, last 7 days."
            action={<Trophy className="h-4 w-4 text-accent" />}
          >
            {winsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {(wins ?? []).map((w) => (
                  <li key={w.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-foreground">{w.customer_name}</div>
                      <div className="truncate text-xs text-muted-foreground">
                        {w.description} · {formatRelativeTime(w.occurred_at)}
                      </div>
                    </div>
                    <div className="shrink-0 text-sm font-semibold text-success">
                      {formatWinAmount(w.amount_cents, w.event_type)}
                    </div>
                  </li>
                ))}
                {(wins ?? []).length === 0 && (
                  <li className="py-4 text-center text-sm text-muted-foreground">
                    No wins logged yet — run the dev seed file.
                  </li>
                )}
              </ul>
            )}
          </Section>
        </div>

        {/* ── Revenue Lanes + Offer Ladder ────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <Section
            title="Revenue by lane"
            description="Monthly recurring split across active monetization lanes."
            className="lg:col-span-3"
          >
            {lanesLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {(lanes ?? []).map((l) => (
                  <div key={l.id}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-foreground">{l.name}</span>
                      <span className="tabular-nums text-muted-foreground">
                        {formatDollars(l.mrr_cents)} ·{" "}
                        <span className={Number(l.delta_pct) >= 0 ? "text-success" : "text-destructive"}>
                          {Number(l.delta_pct) >= 0 ? "+" : ""}{l.delta_pct}%
                        </span>
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-accent"
                        style={{ width: `${l.share_pct}%` }}
                      />
                    </div>
                  </div>
                ))}
                {(lanes ?? []).length === 0 && (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    No lane data yet — run the dev seed file.
                  </p>
                )}
              </div>
            )}
          </Section>

          <Section
            title="Product ladder"
            description="Conversion through your offer stack."
            className="lg:col-span-2"
          >
            <div className="overflow-hidden rounded-md border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">Tier</th>
                    <th className="px-3 py-2 text-left font-medium">Price</th>
                    <th className="px-3 py-2 text-right font-medium">Conv.</th>
                    <th className="px-3 py-2 text-right font-medium">Active</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {tiersLoading ? (
                    <SkeletonRows count={5} cols={4} />
                  ) : (
                    (tiers ?? []).map((r) => (
                      <tr key={r.id}>
                        <td className="px-3 py-2 text-foreground">{r.name}</td>
                        <td className="px-3 py-2 text-muted-foreground">{r.price_label}</td>
                        <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                          {r.conv_rate_pct != null ? `${r.conv_rate_pct}%` : "—"}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums font-medium text-foreground">
                          {r.active_count}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Section>
        </div>

      </main>
    </>
  );
}
