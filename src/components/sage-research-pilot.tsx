import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Search, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { reviewSageProspects } from "@/lib/sage-research.functions";
import type { SageResearchReport } from "@/lib/sage-research.schema";

export function SageResearchReportView({ report }: { report: SageResearchReport }) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Returned sample only · up to 10 Main prospects, not an exhaustive CRM search.{" "}
        {report.excludedCount} records excluded by the review filters.
      </p>
      {report.items.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No eligible prospects in this returned sample.
        </p>
      )}
      {report.items.map((record) => (
        <article
          key={record.id}
          className="min-w-0 space-y-3 rounded-md border border-border bg-card p-4"
        >
          <h3 className="break-words text-sm font-semibold">{record.businessName ?? "Unknown"}</h3>
          <dl className="grid gap-3 break-all text-xs sm:grid-cols-2">
            {Object.entries({
              "Prospect ID": record.id,
              Category: record.category,
              City: record.city,
              State: record.state,
              "Lifecycle stage": record.lifecycleStage,
              Verification: record.verificationState,
              Priority: record.priority,
              "Priority state": record.priorityState,
              "Source type": record.source.type,
              "Source ID": record.source.externalId,
              "Outreach status": record.outreachStatus,
            }).map(([label, value]) => (
              <div key={label}>
                <dt className="text-muted-foreground">{label}</dt>
                <dd>{value ?? "Unknown"}</dd>
              </div>
            ))}
            <div>
              <dt className="text-muted-foreground">Website</dt>
              <dd>
                {record.website ? (
                  <a
                    href={record.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    {record.website}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                ) : (
                  "Unknown"
                )}
              </dd>
            </div>
          </dl>
          <p className="text-sm font-medium">{record.nextStep}</p>
        </article>
      ))}
    </div>
  );
}

function OwnerResearchReview({ userId }: { userId: string }) {
  const review = useServerFn(reviewSageProspects);
  const { data, error, isPending, mutate } = useMutation({
    mutationKey: ["sage-research", userId],
    mutationFn: () => review(),
    retry: false,
    gcTime: 0,
  });
  return (
    <div className="space-y-4">
      <Button
        variant="outline"
        disabled={isPending}
        onClick={() => mutate()}
        className="h-auto min-h-10 max-w-full whitespace-normal text-left"
      >
        {isPending ? (
          <Loader2
            className="h-4 w-4 shrink-0 animate-spin motion-reduce:animate-none"
            aria-hidden="true"
          />
        ) : (
          <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
        )}
        Review up to 10 Main prospects (read only)
      </Button>
      <div role="status" aria-live="polite" aria-busy={isPending}>
        {isPending ? (
          <p className="text-sm text-muted-foreground">Loading Main prospect review…</p>
        ) : error ? (
          <p className="text-sm text-muted-foreground">
            {error.message.includes("ACCESS_DENIED")
              ? "Access denied. Explicit founder authorization is required."
              : "Unavailable right now. No verified report was returned."}
          </p>
        ) : data ? (
          !data.configured ? (
            <p className="text-sm text-muted-foreground">
              Not connected. Dedicated Main research credentials are not configured.
            </p>
          ) : !data.available ? (
            <p className="text-sm text-muted-foreground">
              Unavailable right now. No verified report was returned.
            </p>
          ) : (
            <SageResearchReportView report={data.report} />
          )
        ) : null}
      </div>
    </div>
  );
}

export function SageResearchPilot() {
  const { user } = useAuth();
  return (
    <section
      aria-labelledby="sage-research-pilot"
      className="space-y-4 border-t border-border pt-6"
    >
      <h2 id="sage-research-pilot" className="text-lg font-semibold">
        Sage Research Pilot
      </h2>
      <p className="text-sm text-muted-foreground">
        Direct read-only prospect review, not a recorded OS workflow run.
      </p>
      {user ? (
        <OwnerResearchReview key={user.id} userId={user.id} />
      ) : (
        <p className="text-sm text-muted-foreground">Sign in to request a review.</p>
      )}
    </section>
  );
}
