import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Section } from "@/components/dashboard/section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Flame, Mail, MessageSquare, Phone } from "lucide-react";
import { useWorkspace } from "@/hooks/useWorkspace";
import {
  useHotProspects,
  useRepliedLeads,
  useLeadCounts,
  urgencyFromScore,
  formatStage,
} from "@/hooks/useLeads";

export const Route = createFileRoute("/outreach")({
  head: () => ({ meta: [{ title: "Outreach — Founder OS" }] }),
  component: OutreachPage,
});

// ── Static — no campaigns table yet. Keep until we add one. ──────────────────

const campaigns = [
  { name: "Q2 Expansion — Roofers",       channel: "Email",      sent: 1240, reply: 7.4,  status: "Running" },
  { name: "Cohort 04 waitlist",           channel: "Email + LI", sent: 612,  reply: 11.1, status: "Running" },
  { name: "Reactivation — dormant Core",  channel: "Email",      sent: 188,  reply: 18.6, status: "Paused"  },
  { name: "Partner intro — agencies",     channel: "LinkedIn",   sent: 96,   reply: 22.9, status: "Running" },
];

const channelBreakdown = [
  { l: "Email",        v: 58 },
  { l: "LinkedIn",     v: 24 },
  { l: "Referral",     v: 12 },
  { l: "Inbound form", v: 6  },
];

const channelIcon = (c: string) =>
  c.includes("Email") ? Mail : c.includes("LinkedIn") ? MessageSquare : Phone;

// ── Page ──────────────────────────────────────────────────────────────────────

function OutreachPage() {
  const { data: workspace } = useWorkspace();
  const wid = workspace?.id;

  const { data: counts,    isLoading: countsLoading }    = useLeadCounts(wid);
  const { data: replied,   isLoading: repliedLoading }   = useRepliedLeads(wid);
  const { data: prospects, isLoading: prospectsLoading } = useHotProspects(wid);

  return (
    <>
      <AppHeader
        title="Outreach"
        subtitle="Active campaigns, replies that need you, and prospects running hot."
      />
      <main className="flex-1 space-y-6 p-6">

        {/* ── KPI Cards ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Active campaigns"
            value={String(campaigns.filter((c) => c.status === "Running").length + " of " + campaigns.length)}
            hint="static — campaigns table coming"
          />
          {countsLoading ? (
            <>
              <Skeleton className="h-[88px] w-full rounded-xl" />
              <Skeleton className="h-[88px] w-full rounded-xl" />
              <Skeleton className="h-[88px] w-full rounded-xl" />
            </>
          ) : (
            <>
              <StatCard
                label="Reply rate"
                value={counts && counts.total > 0
                  ? `${Math.round((counts.replied / counts.total) * 100)}%`
                  : "—"}
                hint={`${counts?.replied ?? 0} of ${counts?.total ?? 0} leads`}
                tone="accent"
              />
              <StatCard label="Hot prospects" value={String(counts?.hot ?? 0)} hint="score ≥ 75" />
              <StatCard
                label="Needs intervention"
                value={String(counts?.replied ?? 0)}
                tone="warning"
                hint="replies waiting"
              />
            </>
          )}
        </div>

        {/* ── Replies + Hot prospects ────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <Section
            title="Replies needing intervention"
            description="Leads currently in the replied stage."
            className="lg:col-span-3"
          >
            {repliedLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {(replied ?? []).map((r) => {
                  const urgency = urgencyFromScore(r.score);
                  const tone =
                    urgency === "hot"
                      ? "bg-destructive/10 text-destructive"
                      : urgency === "warm"
                        ? "bg-warning/15 text-warning-foreground"
                        : "bg-muted text-muted-foreground";
                  return (
                    <li key={r.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                      <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${tone}`}>
                        <AlertCircle className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <div className="truncate text-sm font-medium text-foreground">{r.name}</div>
                          <Badge variant="outline" className="capitalize">{urgency}</Badge>
                        </div>
                        <div className="mt-0.5 truncate text-xs text-muted-foreground">
                          {r.vertical ?? "—"} · score {r.score}
                          {r.last_touch_at && ` · last touch ${r.last_touch_at}`}
                        </div>
                      </div>
                      <Button size="sm" variant="ghost">Open</Button>
                    </li>
                  );
                })}
                {(replied ?? []).length === 0 && (
                  <li className="py-4 text-center text-sm text-muted-foreground">
                    No replied leads. Get out there.
                  </li>
                )}
              </ul>
            )}
          </Section>

          <Section
            title="Hot prospects"
            description="Top scored, open stages."
            className="lg:col-span-2"
            action={<Flame className="h-4 w-4 text-destructive" />}
          >
            {prospectsLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : (
              <ul className="space-y-2">
                {(prospects ?? []).map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center gap-3 rounded-md border border-border bg-background/40 px-3 py-2"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent/15 text-xs font-semibold text-accent">
                      {p.score}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-foreground">{p.name}</div>
                      <div className="truncate text-xs text-muted-foreground">
                        {p.vertical ?? "—"} · {formatStage(p.stage)}
                      </div>
                    </div>
                  </li>
                ))}
                {(prospects ?? []).length === 0 && (
                  <li className="py-4 text-center text-sm text-muted-foreground">
                    No prospects yet.
                  </li>
                )}
              </ul>
            )}
          </Section>
        </div>

        {/* ── Active campaigns (static) ──────────────────────────────────── */}
        <Section title="Active campaigns" description="Sequence status across channels.">
          <div className="overflow-hidden rounded-md border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-2 text-left font-medium">Campaign</th>
                  <th className="px-4 py-2 text-left font-medium">Channel</th>
                  <th className="px-4 py-2 text-right font-medium">Sent</th>
                  <th className="px-4 py-2 text-right font-medium">Reply rate</th>
                  <th className="px-4 py-2 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {campaigns.map((c) => {
                  const Icon = channelIcon(c.channel);
                  return (
                    <tr key={c.name} className="hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium text-foreground">{c.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          <Icon className="h-3.5 w-3.5" />
                          {c.channel}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                        {c.sent.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-foreground">{c.reply}%</td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={c.status === "Running" ? "default" : "secondary"}
                          className={c.status === "Running" ? "bg-success/15 text-success hover:bg-success/15" : ""}
                        >
                          {c.status}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Section>

        {/* ── Channel & source breakdown (static) ────────────────────────── */}
        <Section title="Channel & source breakdown" description="Where replies and revenue are originating.">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {channelBreakdown.map((s) => (
              <div key={s.l} className="rounded-md border border-border p-4">
                <div className="text-xs text-muted-foreground">{s.l}</div>
                <div className="mt-1 text-xl font-semibold text-foreground">{s.v}%</div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-accent" style={{ width: `${s.v}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Section>

      </main>
    </>
  );
}
