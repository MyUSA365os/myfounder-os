import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Section } from "@/components/dashboard/section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ShieldAlert, ShieldCheck, XCircle } from "lucide-react";

export const Route = createFileRoute("/compliance")({
  head: () => ({ meta: [{ title: "Compliance — Founder OS" }] }),
  component: CompliancePage,
});

const flags = [
  { id: "F-1042", area: "Outreach copy", rule: "Unverified earnings claim", severity: "high", owner: "Marketing" },
  { id: "F-1041", area: "Landing page", rule: "Missing privacy link in footer", severity: "medium", owner: "Web" },
  { id: "F-1039", area: "Cold email", rule: "Domain warmup below threshold", severity: "medium", owner: "Ops" },
  { id: "F-1037", area: "Affiliate", rule: "Disclosure block missing", severity: "low", owner: "Partners" },
];

const approvals = [
  { who: "Cohort 04 sales page", what: "Pricing & guarantee copy", req: "Founder approval" },
  { who: "Greenline HVAC contract", what: "MSA redlines from client counsel", req: "Legal review" },
  { who: "New affiliate: Beacon Group", what: "10% recurring rev-share", req: "Founder approval" },
];

const audit = [
  { t: "08:42", who: "system", e: "Outreach campaign 'Q2 Expansion' resumed after compliance recheck." },
  { t: "08:11", who: "alex@", e: "Approved disclosure update on /partners-pilot." },
  { t: "Yesterday", who: "system", e: "Blocked sequence step on 'Reactivation' — flagged earnings claim." },
  { t: "Yesterday", who: "jordan@", e: "Updated MSA template to v3.2." },
];

const sevTone = (s: string) =>
  s === "high"
    ? "bg-destructive/15 text-destructive"
    : s === "medium"
      ? "bg-warning/15 text-warning-foreground"
      : "bg-muted text-muted-foreground";

function CompliancePage() {
  return (
    <>
      <AppHeader title="Compliance" subtitle="Flags, blocked flows, approvals, and what is safe to deploy." />
      <main className="flex-1 space-y-6 p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Open flags" value="9" tone="warning" hint="3 high · 4 medium · 2 low" />
          <StatCard label="Blocked flows" value="2" tone="destructive" hint="auto-paused by guardrails" />
          <StatCard label="Approvals waiting" value="3" hint="avg. wait 14h" />
          <StatCard label="Deployability" value="Green" tone="accent" hint="all critical checks passing" />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <Section title="Compliance flags" description="Issues raised by automated review." className="lg:col-span-3">
            <div className="overflow-hidden rounded-md border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium">ID</th>
                    <th className="px-4 py-2 text-left font-medium">Area</th>
                    <th className="px-4 py-2 text-left font-medium">Rule</th>
                    <th className="px-4 py-2 text-left font-medium">Severity</th>
                    <th className="px-4 py-2 text-left font-medium">Owner</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {flags.map((f) => (
                    <tr key={f.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{f.id}</td>
                      <td className="px-4 py-3 text-foreground">{f.area}</td>
                      <td className="px-4 py-3 text-muted-foreground">{f.rule}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${sevTone(f.severity)}`}>
                          {f.severity}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{f.owner}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section
            title="Deployability status"
            description="Aggregate gate across critical surfaces."
            className="lg:col-span-2 border-accent/30"
            action={<ShieldCheck className="h-4 w-4 text-accent" />}
          >
            <div className="space-y-2">
              {[
                { l: "Outreach copy", ok: true },
                { l: "Landing pages", ok: true },
                { l: "Affiliate disclosures", ok: false },
                { l: "MSA templates", ok: true },
                { l: "Domain reputation", ok: true },
                { l: "Data handling", ok: true },
              ].map((c) => (
                <div key={c.l} className="flex items-center justify-between rounded-md border border-border bg-background/40 px-3 py-2 text-sm">
                  <span className="text-foreground">{c.l}</span>
                  {c.ok ? (
                    <span className="inline-flex items-center gap-1 text-success">
                      <CheckCircle2 className="h-4 w-4" /> Pass
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-destructive">
                      <XCircle className="h-4 w-4" /> Block
                    </span>
                  )}
                </div>
              ))}
            </div>
          </Section>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Section
            title="Approvals needed"
            description="Items waiting on a human decision."
            action={<ShieldAlert className="h-4 w-4 text-warning" />}
          >
            <ul className="divide-y divide-border">
              {approvals.map((a) => (
                <li key={a.who} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-foreground">{a.who}</div>
                    <div className="truncate text-xs text-muted-foreground">{a.what}</div>
                    <Badge variant="outline" className="mt-1.5">{a.req}</Badge>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button size="sm" variant="outline">Review</Button>
                    <Button size="sm">Approve</Button>
                  </div>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Audit trail" description="Recent compliance-relevant events.">
            <ul className="space-y-3">
              {audit.map((a, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <span className="w-20 shrink-0 text-xs text-muted-foreground">{a.t}</span>
                  <span className="flex-1 text-foreground">
                    <span className="font-mono text-xs text-muted-foreground">{a.who}</span>{" "}
                    {a.e}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4">
              <Button size="sm" variant="ghost">View full audit log →</Button>
            </div>
          </Section>
        </div>
      </main>
    </>
  );
}