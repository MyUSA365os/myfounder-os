import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Section } from "@/components/dashboard/section";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles, Trophy } from "lucide-react";

export const Route = createFileRoute("/revenue")({
  head: () => ({
    meta: [{ title: "Revenue — Founder OS" }],
  }),
  component: RevenuePage,
});

const lanes = [
  { name: "Productized service", mrr: 18400, share: 42, delta: 12 },
  { name: "Cohort program", mrr: 11200, share: 26, delta: 4 },
  { name: "Templates & kits", mrr: 6800, share: 16, delta: -3 },
  { name: "Affiliate / rev-share", mrr: 4900, share: 11, delta: 22 },
  { name: "1:1 advisory", mrr: 2300, share: 5, delta: -8 },
];

const ladder = [
  { tier: "Lead magnet", price: "Free", conv: "—", count: 1284 },
  { tier: "Tripwire", price: "$29", conv: "6.4%", count: 82 },
  { tier: "Core offer", price: "$499", conv: "9.1%", count: 47 },
  { tier: "Expansion", price: "$1.9k/mo", conv: "22%", count: 19 },
  { tier: "Inner circle", price: "$8k/qtr", conv: "11%", count: 4 },
];

const wins = [
  { who: "Acme Roofing", what: "Upgraded to Expansion", amt: "+$1,900/mo", when: "2h ago" },
  { who: "Riverline Co.", what: "Renewed annual", amt: "+$5,988", when: "Yesterday" },
  { who: "Northbeam", what: "Closed Core offer", amt: "+$499", when: "Yesterday" },
  { who: "Studio Ovo", what: "Cohort seat sold", amt: "+$1,200", when: "2d ago" },
];

function RevenuePage() {
  return (
    <>
      <AppHeader title="Revenue" subtitle="Offer performance, ladder health, and the next monetization move." />
      <main className="flex-1 space-y-6 p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Net MRR" value="$43,600" delta={9} hint="vs. last 30 days" />
          <StatCard label="New cash" value="$11,820" delta={14} hint="this week" tone="accent" />
          <StatCard label="Avg. order value" value="$612" delta={3} />
          <StatCard label="Refund rate" value="1.8%" delta={-0.4} hint="trailing 30d" />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Section
            title="Best next monetization action"
            description="Generated from offer signals, prospect heat, and capacity."
            className="lg:col-span-2 border-accent/30"
            action={<Badge variant="secondary" className="gap-1"><Sparkles className="h-3 w-3" /> Recommendation</Badge>}
          >
            <div className="rounded-lg bg-gradient-to-br from-accent/10 via-card to-card p-5">
              <div className="text-sm font-medium text-foreground">
                Launch a 14-day expansion offer to your 19 active Core customers.
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Conversion from Core → Expansion is running at 22% — well above your 12% baseline.
                Send a constrained-capacity offer (5 seats) priced at $1,900/mo with a hands-on onboarding lane.
                Estimated lift: <span className="font-medium text-foreground">+$9,500 MRR</span> in 21 days.
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
              {[
                { t: "Reactivate 38 dormant tripwire buyers", v: "+$1.1k est." },
                { t: "Bundle Templates + Cohort seat", v: "+18% AOV" },
                { t: "Raise Core price to $599", v: "Low risk" },
                { t: "Affiliate push: 12 warm partners", v: "+$2.4k est." },
              ].map((r) => (
                <div key={r.t} className="flex items-center justify-between rounded-md border border-border bg-background/40 px-3 py-2 text-sm">
                  <span className="text-foreground">{r.t}</span>
                  <span className="text-xs text-muted-foreground">{r.v}</span>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Recent wins" description="Closed revenue, last 7 days." action={<Trophy className="h-4 w-4 text-accent" />}>
            <ul className="divide-y divide-border">
              {wins.map((w) => (
                <li key={w.who} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-foreground">{w.who}</div>
                    <div className="truncate text-xs text-muted-foreground">{w.what} · {w.when}</div>
                  </div>
                  <div className="shrink-0 text-sm font-semibold text-success">{w.amt}</div>
                </li>
              ))}
            </ul>
          </Section>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <Section title="Revenue by lane" description="Monthly recurring split across active monetization lanes." className="lg:col-span-3">
            <div className="space-y-3">
              {lanes.map((l) => (
                <div key={l.name}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-foreground">{l.name}</span>
                    <span className="tabular-nums text-muted-foreground">
                      ${l.mrr.toLocaleString()} ·{" "}
                      <span className={l.delta >= 0 ? "text-success" : "text-destructive"}>
                        {l.delta >= 0 ? "+" : ""}{l.delta}%
                      </span>
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${l.share}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Product ladder" description="Conversion through your offer stack." className="lg:col-span-2">
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
                  {ladder.map((r) => (
                    <tr key={r.tier}>
                      <td className="px-3 py-2 text-foreground">{r.tier}</td>
                      <td className="px-3 py-2 text-muted-foreground">{r.price}</td>
                      <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">{r.conv}</td>
                      <td className="px-3 py-2 text-right tabular-nums font-medium text-foreground">{r.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        </div>
      </main>
    </>
  );
}