import { useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SageResearchReportView } from "@/components/sage-research-pilot";
import { useAuth } from "@/hooks/useAuth";
import { getSageAssignment } from "@/lib/sage-research.functions";

const SETTINGS = "https://app.ugotleads.io/agency/settings";

function OwnerAssignmentReader({ userId }: { userId: string }) {
  const [runId, setRunId] = useState("");
  const load = useServerFn(getSageAssignment);
  const lookup = useMutation({
    mutationKey: ["sage-assignment", userId],
    mutationFn: (id: string) => load({ data: id }),
    retry: false,
    gcTime: 0,
  });
  const id = runId.trim();
  const result = lookup.data;
  const assignment = result?.status === "verified" ? result.assignment : null;
  const manage = new URL(SETTINGS);
  if (assignment) manage.searchParams.set("sageRun", assignment.runId);
  manage.hash = "sage-assignments";
  function refresh(event: FormEvent) {
    event.preventDefault();
    if (!lookup.isPending && /^[A-Za-z0-9_-]{1,160}$/.test(id)) lookup.mutate(id);
  }
  return (
    <div className="space-y-3">
      <a className="text-sm font-medium underline" href={manage.toString()}>
        {assignment
          ? "Manage this assignment in uGotLeads"
          : "Create or manage a Sage assignment in uGotLeads"}
      </a>
      <form className="space-y-2" onSubmit={refresh}>
        <label htmlFor="sage-run-id" className="text-sm">
          uGotLeads workflow run ID
        </label>
        <div className="flex flex-wrap gap-2">
          <Input
            id="sage-run-id"
            value={runId}
            maxLength={160}
            onChange={(event) => setRunId(event.target.value)}
            className="max-w-sm"
          />
          <Button
            type="submit"
            variant="outline"
            disabled={lookup.isPending || !/^[A-Za-z0-9_-]{1,160}$/.test(id)}
          >
            {lookup.isPending ? "Loading assignment…" : "View assignment status"}
          </Button>
        </div>
      </form>
      <div aria-live="polite" className="space-y-3 text-sm">
        {lookup.error && (
          <p>
            {lookup.error.message.includes("ACCESS_DENIED")
              ? "Founder authorization required."
              : "Assignment unavailable."}
          </p>
        )}
        {result?.status === "unconfigured" && <p>Dedicated Main research settings are missing.</p>}
        {result?.status === "not_found" && <p>No Main Sage assignment was found for that ID.</p>}
        {result?.status === "unavailable" && (
          <p>Assignment unavailable. Confirm the connection and try again.</p>
        )}
        {assignment && (
          <>
            <p>
              uGotLeads status <strong>{assignment.status.replaceAll("_", " ")}</strong>
            </p>
            <p className="break-all text-xs">
              Run {assignment.runId} · Correlation {assignment.correlationId}
            </p>
            {assignment.approvalId && (
              <p className="break-all text-xs">Owner approval required · {assignment.approvalId}</p>
            )}
            {assignment.terminalReason && (
              <p>Reason {assignment.terminalReason.replaceAll("_", " ")}</p>
            )}
            {assignment.report && <SageResearchReportView report={assignment.report} />}
          </>
        )}
      </div>
    </div>
  );
}

export function SageAssignmentView() {
  const { user } = useAuth();
  return (
    <section aria-labelledby="sage-assignments" className="space-y-3 border-t border-border pt-6">
      <h2 id="sage-assignments" className="text-lg font-semibold">
        Sage assignments
      </h2>
      {user && <OwnerAssignmentReader key={user.id} userId={user.id} />}
    </section>
  );
}
