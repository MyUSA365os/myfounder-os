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
import {
  AGENT_WORKSPACE_LINKS as links,
  AGENT_WORKSPACE_POLICY as policy,
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
    state: "Blocked",
    detail: "Worker configured in Boost; authenticated CRM MCP not connected.",
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
          an agent runtime. Setup states below are not live telemetry. No agents are enabled here.
        </p>
        <dl className="grid grid-cols-1 gap-4 border-y border-border py-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Ready to review",
              detail: "Implementation issue and runbook",
              icon: CheckCircle2,
            },
            { label: "Blocked", detail: "Boost permission scope unconfirmed", icon: LockKeyhole },
            { label: "Waiting on connection", detail: "Authenticated CRM MCP", icon: Clock3 },
            { label: "Never run", detail: "Stage 1 pilot from this workspace", icon: CircleDashed },
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
            Blocked
          </span>
        </div>
        <p className="text-sm font-medium">
          Stage 1 · {policy.environment}-only read-only CRM research pilot
        </p>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Up to {policy.contactLimit} real non-QA contacts/prospects. Boost.space must confirm that
          a newly connected external MCP server can be limited to ONLY Sage Revenue Research before
          any bearer key is submitted. No key has been submitted from this workspace.
        </p>
        <div className="flex flex-wrap gap-2">
          <ExternalLink href={links.issue}>Open implementation issue</ExternalLink>
          <ExternalLink href={links.runbook}>Pilot runbook</ExternalLink>
        </div>
      </section>

      <section aria-labelledby="work-queue" className="space-y-4 border-t border-border pt-6">
        <h2 id="work-queue" className="text-lg font-semibold">
          Work Queue
        </h2>
        <p className="text-sm text-muted-foreground">No verified agent runs are connected yet.</p>
        <h3 className="text-sm font-semibold">Setup checkpoints (not executed tasks)</h3>
        <ol className="space-y-3">
          {[
            [
              "Resolve Boost permission blocker",
              "Confirm external MCP access is restricted to ONLY Sage Revenue Research before submitting a bearer key.",
            ],
            [
              "Main-only smoke test",
              "After permission confirmation and an approved connection, review read-only research on up to 10 real non-QA contacts/prospects.",
            ],
            [
              "Windows desktop worker",
              "After the CRM pilot, verify the Windows desktop deployment and its permission boundaries.",
            ],
          ].map(([title, detail], index) => (
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
        <p className="flex items-start gap-2 text-xs text-muted-foreground">
          <LockKeyhole className="h-4 w-4 shrink-0" aria-hidden="true" />
          Request Sage work: unavailable until an approved work backend exists. External writes
          remain with the approved existing uGotLeads backend only.
        </p>
      </section>

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
