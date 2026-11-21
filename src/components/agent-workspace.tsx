import { Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Bot,
  CheckCircle2,
  CircleDashed,
  Clock3,
  LockKeyhole,
  Monitor,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkspaceEvidenceView } from "@/components/workspace-evidence";
import {
  AGENT_WORKSPACE_LINKS as links,
  AGENT_WORKSPACE_POLICY as policy,
  AGENT_WORKSPACE_STAGES as stages,
  AGENT_WORKSPACE_MILESTONES as milestones,
} from "@/lib/agent-workspace";

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Button
      asChild
      variant="outline"
      size="sm"
      className="h-auto min-h-9 whitespace-normal text-left"
    >
      <a href={href} target="_blank" rel="noopener noreferrer">
        {children}
        <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    </Button>
  );
}

const workforce = [
  {
    name: "Sage",
    icon: Bot,
    state: "Waiting on connection",
    detail: "Coordination layer; not directly connected from Founder HQ.",
  },
  {
    name: "Sage Revenue Research",
    icon: ShieldCheck,
    state: "Not verified",
    detail:
      "Worker configured in Boost; authenticated CRM MCP not connected. A dedicated isolated worker is the primary path; Boost is optional later.",
  },
  {
    name: "Desktop Worker",
    icon: Monitor,
    state: "Never run",
    detail: "Via Vercel Labs agent-desktop; not deployed.",
  },
  {
    name: "RTILA X Browser Worker",
    icon: Monitor,
    state: "Waiting on connection",
    detail: "License reported owned; installation/MCP not verified.",
  },
];

export function AgentWorkspace() {
  return (
    <main className="mx-auto w-full max-w-6xl space-y-8 p-4 sm:p-6 lg:p-8">
      <section aria-labelledby="workspace-overview" className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="workspace-overview" className="text-xl font-semibold text-foreground">
            One Sage-led operator workspace
          </h2>
          <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <LockKeyhole className="h-4 w-4" aria-hidden="true" />
            Read-only · V0
          </span>
        </div>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Under construction for MyUSA AI 1st OS. This is an operator workspace, not a second CRM or
          an agent runtime. Setup checkpoints are not live telemetry; operating evidence below is
          separately verified when available. No agents are enabled here.
        </p>
        <dl className="grid grid-cols-1 gap-4 border-y border-border py-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Preview built",
              detail: "V0 interface and founder-only reader",
              icon: CheckCircle2,
            },
            {
              label: "Review required",
              detail: "PR #249 open / draft; not released",
              icon: LockKeyhole,
            },
            {
              label: "Not connected",
              detail: "Server-only Main credential configuration",
              icon: Clock3,
            },
            {
              label: "Not verified",
              detail: "Real evidence and first isolated run",
              icon: CircleDashed,
            },
          ].map(({ label, detail, icon: Icon }) => (
            <div key={label} className="min-w-0">
              <dt className="flex items-center gap-2 text-sm font-semibold">
                <Icon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                {label}
              </dt>
              <dd className="mt-1 text-xs leading-relaxed text-muted-foreground">{detail}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section
        aria-labelledby="sage-next-move"
        className="space-y-4 border-l-4 border-warning pl-4 sm:pl-5"
      >
        <div className="flex flex-wrap items-center gap-3">
          <h2 id="sage-next-move" className="text-lg font-semibold">
            Sage&apos;s next move
          </h2>
          <span className="inline-flex items-center gap-1.5 rounded-md bg-warning/20 px-2 py-1 text-xs font-medium text-foreground">
            <LockKeyhole className="h-3.5 w-3.5" aria-hidden="true" />
            Review required · not released
          </span>
        </div>
        <p className="text-sm font-medium">
          Stage 1 · {policy.environment}-only read-only operating evidence
        </p>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Ship the existing uGotLeads evidence endpoint in draft PR #249, configure the server-only
          founder UID and Main-only reports:read credential, then verify actual evidence and
          negative permission tests. The endpoint is not released; configuration is not connected
          and real evidence is not verified.
        </p>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Boost.space support confirmed on November 21 that external MCP connections initially reach
          ALL agents, including across instances, before admin reassignment. There is no per-agent
          selection before submitting a key; a separate instance does not isolate. We will not wait
          for that feature or submit a production CRM key to Boost. An isolated Sage worker with
          tenant-bound scoped keys is the primary path; Boost is optional later.
        </p>
        <div className="flex flex-wrap gap-2">
          <ExternalLink href={links.issue}>Open implementation issue</ExternalLink>
          <ExternalLink href={links.runbook}>Pilot runbook</ExternalLink>
          <ExternalLink href={links.evidencePr}>Draft evidence PR #249</ExternalLink>
        </div>
      </section>

      <section aria-labelledby="work-queue" className="space-y-4 border-t border-border pt-6">
        <h2 id="work-queue" className="text-lg font-semibold">
          Work Queue
        </h2>
        <p className="text-sm text-muted-foreground">
          No agent work is executed from this workspace.
        </p>
        <h3 className="text-sm font-semibold">Planned stages (not executed tasks)</h3>
        <ol className="space-y-3">
          {stages.map(({ title, detail }, index) => (
            <li key={title} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-medium text-muted-foreground">
                {index + 1}
              </span>
              <div>
                <p className="text-sm font-medium">{title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{detail}</p>
              </div>
            </li>
          ))}
        </ol>
        <h3 className="text-sm font-semibold">5 V1 milestones</h3>
        <p className="text-xs text-muted-foreground">
          Setup checklist only · not completed milestones or live work statuses. Preview built
          describes source only, not a verified connection or execution.
        </p>
        <ol className="divide-y divide-border border-y border-border">
          {milestones.map(({ title, state, detail }) => (
            <li key={title} className="space-y-1 py-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h4 className="text-sm font-medium">{title}</h4>
                <span className="text-xs font-semibold text-muted-foreground">{state}</span>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">{detail}</p>
            </li>
          ))}
        </ol>
        <p className="flex items-start gap-2 text-xs text-muted-foreground">
          <LockKeyhole className="h-4 w-4 shrink-0" aria-hidden="true" />
          Request Sage work: unavailable until an approved work backend exists. External writes
          remain with the approved existing uGotLeads backend only.
        </p>
      </section>

      <WorkspaceEvidenceView />

      <section aria-labelledby="workforce" className="space-y-4 border-t border-border pt-6">
        <div>
          <h2 id="workforce" className="text-lg font-semibold">
            Workforce
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Known setup state · not live agent status
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {workforce.map(({ name, icon: Icon, state, detail }) => (
            <article key={name} className="min-w-0 rounded-md border border-border bg-card p-4">
              <div className="flex items-start gap-3">
                <Icon
                  className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold">{name}</h3>
                  <p className="mt-1 text-xs font-medium text-muted-foreground">
                    Known setup state: {state}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{detail}</p>
            </article>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <ExternalLink href={links.desktop}>Vercel Labs agent-desktop</ExternalLink>
          <ExternalLink href={links.inventory}>Google workforce inventory</ExternalLink>
        </div>
      </section>

      <section
        aria-labelledby="future-capabilities"
        className="space-y-3 border-t border-border pt-6"
      >
        <h2 id="future-capabilities" className="text-lg font-semibold">
          Later capabilities · outside V1
        </h2>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Cards, phone and social avatar are later autonomies, not prerequisites to workspace V1.
          Video marketing is a parallel future capability, not a V1 blocker or scope change.
        </p>
        <div className="flex flex-wrap gap-2">
          <ExternalLink href={links.executiveFuture}>Autonomous executive future #250</ExternalLink>
          <ExternalLink href={links.videoContext}>Parallel video context #252</ExternalLink>
        </div>
      </section>

      <section aria-labelledby="revenue-evidence" className="space-y-3 border-t border-border pt-6">
        <h2 id="revenue-evidence" className="text-lg font-semibold">
          Revenue evidence
        </h2>
        {!policy.campaignAccess && (
          <>
            <p className="flex items-start gap-2 text-sm font-medium">
              <LockKeyhole className="h-4 w-4 shrink-0" aria-hidden="true" />
              Data access pending founder-only permission
            </p>
            <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
              Existing campaign reporting validates sign-in, but does not yet enforce founder-only
              access on the server. Client campaign data is not loaded in Agent Workspace. No
              additional report or revenue calculation is created here.
            </p>
            <Button asChild variant="outline" size="sm">
              <Link to="/revenue">
                Open existing Revenue page
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </>
        )}
      </section>
    </main>
  );
}
