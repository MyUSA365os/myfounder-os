import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Section } from "@/components/dashboard/section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, Flame, Mail, MessageSquare, Phone } from "lucide-react";

export const Route = createFileRoute("/outreach")({
  head: () => ({ meta: [{ title: "Outreach — Founder OS" }] }),
  component: OutreachPage,
});

const campaigns = [
  { name: "Q2 Expansion — Roofers", channel: "Email", sent: 1240, reply: 7.4, status: "Running" },
  { name: "Cohort 04 waitlist", channel: "Email + LI", sent: 612, reply: 11.1, status: "Running" },
  { name: "Reactivation — dormant Core", channel: "Email", sent: 188, reply: 18.6, status: "Paused" },
  { name: "Partner intro — agencies", channel: "LinkedIn", sent: 96, reply: 22.9, status: "Running" },
];

const replies = [
  { who: "Marcus / Greenline HVAC", snippet: "Send pricing — looking to start in Aug.", urgency: "hot" },
  { who: "Dana / Northbeam", snippet: "Two questions about onboarding scope…", urgency: "warm" },
  { who: "Priya / Studio Ovo", snippet: "Not now, follow up Q3.", urgency: "cool" },
  { who: "Tomás / Riverline", snippet: "Can we do a 15-min intro Thursday?", urgency: "hot" },
];

const hotProspects = [
  { name: "Greenline HVAC", score: 94, source: "Inbound form", lane: "Core" },
  { name: "Halcyon Builders", score: 88, source: "Cold email", lane: "Expansion" },
  { name: "Bayside Pediatrics", score: 81, source: "Referral", lane: "Cohort" },
  { name: "Northbeam", score: 77, source: "LinkedIn", lane: "Core" },
  { name: "Ironclad Legal", score: 72, source: "Webinar", lane: "Cohort" },
];

const channelIcon = (c: string) =>
  c.includes("Email") ? Mail : c.includes("LinkedIn") ? MessageSquare : Phone;

function OutreachPage() {
  return (
    <>
      <AppHeader title="Outreach" subtitle="Active campaigns, replies that need you, and prospects running hot." />
      <main className="flex-1 space-y-6 p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Active campaigns" value="4" hint="2 running, 1 paused, 1 draft" />
          <StatCard label="Reply rate" value="11.6%" delta={2} hint="trailing 14d" tone="accent" />
          <StatCard label="Hot prospects" value="17" delta={31} />
          <StatCard label="Needs intervention" value="6" tone="warning" hint="replies waiting > 24h" />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <Section title="Replies needing intervention" description="Threads where automation has stepped aside." className="lg:col-span-3">
            <ul className="divide-y divide-border">
              {replies.map((r) => {
                const tone =
                  r.urgency === "hot"
                    ? "bg-destructive/10 text-destructive"
                    : r.urgency === "warm"
                      ? "bg-warning/15 text-warning-foreground"
                      : "bg-muted text-muted-foreground";
                return (
                  <li key={r.who} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                    <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${tone}`}>
                      <AlertCircle className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <div className="truncate text-sm font-medium text-foreground">{r.who}</div>
                        <Badge variant="outline" className="capitalize">{r.urgency}</Badge>
                      </div>
                      <div className="mt-0.5 truncate text-xs text-muted-foreground">{r.snippet}</div>
                    </div>
                    <Button size="sm" variant="ghost">Open</Button>
                  </li>
                );
              })}
            </ul>
          </Section>

          <Section title="Hot prospects" description="Top scored, last 7 days." className="lg:col-span-2" action={<Flame className="h-4 w-4 text-destructive" />}>
            <ul className="space-y-2">
              {hotProspects.map((p) => (
                <li key={p.name} className="flex items-center gap-3 rounded-md border border-border bg-background/40 px-3 py-2">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent/15 text-xs font-semibold text-accent">
                    {p.score}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-foreground">{p.name}</div>
                    <div className="truncate text-xs text-muted-foreground">
                      {p.source} · {p.lane}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </Section>
        </div>

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
                      <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{c.sent.toLocaleString()}</td>
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

        <Section title="Channel & source breakdown" description="Where replies and revenue are originating.">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { l: "Email", v: 58 },
              { l: "LinkedIn", v: 24 },
              { l: "Referral", v: 12 },
              { l: "Inbound form", v: 6 },
            ].map((s) => (
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