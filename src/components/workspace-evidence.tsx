import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { getWorkspaceEvidence } from "@/lib/workspace-evidence.functions";
import type { WorkspaceEvidence } from "@/lib/workspace-evidence.schema";
import {
  evidenceDate as date,
  evidenceNumber,
  evidenceKnownAmount,
} from "@/lib/workspace-evidence.display";

function Costs({ cost }: { cost: WorkspaceEvidence["runs"][number]["cost"] }) {
  return (
    <dl className="grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
      <div>
        <dt>AI known cost (microcents)</dt>
        <dd className="tabular-nums">{evidenceKnownAmount(cost?.aiKnownMicrocents)}</dd>
      </div>
      <div>
        <dt>AI runs with unknown cost</dt>
        <dd>{evidenceNumber(cost?.aiUnknownRuns)}</dd>
      </div>
      <div>
        <dt>Capability known cost (microcents)</dt>
        <dd className="tabular-nums">{evidenceKnownAmount(cost?.capabilityKnownMicrocents)}</dd>
      </div>
      <div>
        <dt>Capability runs with unknown cost</dt>
        <dd>{evidenceNumber(cost?.capabilityUnknownRuns)}</dd>
      </div>
    </dl>
  );
}

export function WorkspaceEvidenceView() {
  const { user } = useAuth();
  const fetchEvidence = useServerFn(getWorkspaceEvidence);
  const { data, error, isPending, dataUpdatedAt } = useQuery({
    queryKey: ["workspace-evidence", user?.id],
    queryFn: () => fetchEvidence(),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
    gcTime: 0,
  });
  return (
    <section aria-labelledby="live-evidence" className="space-y-4 border-t border-border pt-6">
      <h2 id="live-evidence" className="text-lg font-semibold">
        Live operating evidence
      </h2>
      <p className="text-xs text-muted-foreground">
        Read-only · canonical uGotLeads workflow runs and human actions · founder-only
      </p>
      <div role="status" aria-live="polite">
        {!user || isPending ? (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Loading operating evidence…</p>
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : error ? (
          <p className="text-sm text-muted-foreground">
            {error.message.includes("ACCESS_DENIED")
              ? "Access denied. Explicit founder authorization is required; access stays closed when it is not configured."
              : "Service unavailable. Evidence could not be verified."}
          </p>
        ) : !data || !data.configured ? (
          <p className="text-sm text-muted-foreground">
            Not connected. Dedicated read-only Main workspace configuration is missing.
          </p>
        ) : !data.available ? (
          <p className="text-sm text-muted-foreground">
            {data.reason === "pending_release"
              ? "Backend pending. The draft evidence service is not released in production yet."
              : "Service unavailable. No verified operating evidence is available right now."}
          </p>
        ) : (
          <div className="space-y-5">
            <p className="text-xs text-muted-foreground">
              Verified response · Loaded {date(new Date(dataUpdatedAt).toISOString())}
            </p>
            <p className="text-xs text-muted-foreground">
              {data.evidence.sampling.sampleLimited
                ? "Sample of up to 100 per collection, not guaranteed latest/complete."
                : "Bounded sample; not guaranteed globally latest."}{" "}
              Display limited to 10 runs and 10 human actions. Counts below are not totals.
            </p>
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Workflow runs</h3>
              {data.evidence.runs.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No workflow runs in the returned sample.
                </p>
              )}
              {data.evidence.runs.map((run) => (
                <article
                  key={run.id}
                  className="min-w-0 space-y-3 rounded-md border border-border bg-card p-4"
                >
                  <div className="flex flex-wrap justify-between gap-2">
                    <h4 className="break-all text-sm font-semibold">
                      {run.workflowKey ?? "Unknown"}
                    </h4>
                    <span className="break-all text-xs font-medium">{run.status ?? "Unknown"}</span>
                  </div>
                  <dl className="grid gap-2 break-all text-xs sm:grid-cols-2">
                    <div>
                      <dt className="text-muted-foreground">Run ID</dt>
                      <dd>{run.id}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Correlation ID</dt>
                      <dd>{run.correlationId ?? "Unknown"}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Current step</dt>
                      <dd>{run.currentStepKey ?? "Unknown"}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Waiting code</dt>
                      <dd>{run.waitingReason ?? "Unknown"}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Created</dt>
                      <dd>{date(run.createdAt)}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Updated</dt>
                      <dd>{date(run.updatedAt)}</dd>
                    </div>
                  </dl>
                  <Costs cost={run.cost} />
                </article>
              ))}
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Human actions</h3>
              {data.evidence.humanActions.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No human actions in the returned sample.
                </p>
              )}
              {data.evidence.humanActions.map((action) => (
                <article
                  key={action.id}
                  className="min-w-0 space-y-2 rounded-md border border-border bg-card p-4"
                >
                  <div className="flex flex-wrap justify-between gap-2">
                    <h4 className="break-all text-sm font-semibold">
                      {action.actionType ?? "Unknown"}
                    </h4>
                    <span className="break-all text-xs font-medium">
                      {action.status ?? "Unknown"} · {action.priority ?? "Unknown"}
                    </span>
                  </div>
                  <dl className="grid gap-2 break-all text-xs sm:grid-cols-2">
                    <div>
                      <dt className="text-muted-foreground">Action ID</dt>
                      <dd>{action.id}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Correlation ID</dt>
                      <dd>{action.correlationId ?? "Unknown"}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Workflow run ID</dt>
                      <dd>{action.workflowRunId ?? "Unknown"}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Created</dt>
                      <dd>{date(action.createdAt)}</dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
