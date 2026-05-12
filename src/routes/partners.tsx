import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Section } from "@/components/dashboard/section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useWorkspace } from "@/hooks/useWorkspace";
import { usePartners, partnerStats } from "@/hooks/usePartners";
import { formatDollars } from "@/hooks/useRevenue";

export const Route = createFileRoute("/partners")({
  head: () => ({ meta: [{ title: "Partners — Founder OS" }] }),
  component: PartnersPage,
});

// ── Status pill styling ──────────────────────────────────────────────────────

function StatusBadge({ status }: { status: 'active' | 'onboarding' | 'inactive' }) {
  if (status === 'active') {
    return (
      <Badge className="bg-success/15 text-success hover:bg-success/15">Active</Badge>
    );
  }
  if (status === 'onboarding') {
    return (
      <Badge className="bg-warning/15 text-warning-foreground hover:bg-warning/15">
        Onboarding
      </Badge>
    );
  }
  return <Badge variant="secondary">Inactive</Badge>;
}

// ── Page ─────────────────────────────────────────────────────────────────────

function PartnersPage() {
  const { data: workspace } = useWorkspace();
  const wid = workspace?.id;
  const { data: partners, isLoading } = usePartners(wid);
  const stats = partnerStats(partners);

  return (
    <>
      <AppHeader
        title="Partners"
        subtitle="Operator network, MRR contribution, and onboarding pipeline."
      />
      <main className="flex-1 space-y-6 p-6">

        {/* ── KPI Cards ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[88px] w-full rounded-xl" />
            ))
          ) : (
            <>
              <StatCard label="Total partners" value={String(stats.total)} hint="across all markets" />
              <StatCard label="Active" value={String(stats.active)} hint={`${stats.onboarding} onboarding`} tone="accent" />
              <StatCard label="Network MRR" value={formatDollars(stats.totalMrrCents)} hint="combined" />
              <StatCard
                label="Avg MRR / active"
                value={stats.active > 0 ? formatDollars(stats.avgActiveMrrCents) : "—"}
                hint="per partner"
              />
            </>
          )}
        </div>

        {/* ── Roster Table ───────────────────────────────────────────────── */}
        <Section
          title="Partner roster"
          description="All licensed operators in the network."
          action={<Button size="sm" variant="outline">Add partner</Button>}
        >
          <div className="overflow-hidden rounded-md border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-2 text-left font-medium">Partner</th>
                  <th className="px-4 py-2 text-left font-medium">Market</th>
                  <th className="px-4 py-2 text-left font-medium">Status</th>
                  <th className="px-4 py-2 text-right font-medium">MRR</th>
                  <th className="px-4 py-2 text-left font-medium">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <Skeleton className="h-4 w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (partners ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-sm text-muted-foreground">
                      No partners yet — add your first one.
                    </td>
                  </tr>
                ) : (
                  (partners ?? []).map((p) => (
                    <tr key={p.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium text-foreground">{p.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{p.market}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-foreground">
                        {p.mrr_cents > 0 ? formatDollars(p.mrr_cents) : "—"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{p.joined_at}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Section>

      </main>
    </>
  );
}
