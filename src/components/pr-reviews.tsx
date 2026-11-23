import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { launchReview } from "@/lib/pr-review.functions";
import { useAuth } from "@/hooks/useAuth";

export function FounderLaunchReviews() {
  const { user } = useAuth();
  const run = useServerFn(launchReview);
  const client = useQueryClient();
  const [requestId, setRequestId] = useState(() => crypto.randomUUID());
  const key = ["founder-launch-reviews", user?.id];
  const rows = useQuery({
    queryKey: key,
    enabled: Boolean(user),
    queryFn: () => run({ data: { action: "list" } }),
    retry: false,
  });
  const change = useMutation({
    mutationFn: (data: { action: "create" | "approve"; id: string }) => run({ data }),
    onSuccess: (result, action) => {
      client.setQueryData(key, result);
      if (action.action === "create") setRequestId(crypto.randomUUID());
    },
  });
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">Sage founder launch review</h2>
      <p>
        Assign Sage to summarize live landing page views and new CRM contacts. The review runs when
        you approve it.
      </p>
      <Button
        disabled={change.isPending || !rows.isSuccess}
        onClick={() => change.mutate({ action: "create", id: requestId })}
      >
        Create review assignment
      </Button>
      {(rows.isError || change.isError) && (
        <p role="alert">The assignment service is unavailable. Refresh to retry.</p>
      )}
      {rows.data?.map((row) => (
        <div className="rounded border p-3" key={row.id}>
          <p>Requested {new Date(row.requested_at).toLocaleString()}</p>
          {row.report ? (
            <p>{row.report}</p>
          ) : (
            <Button
              disabled={change.isPending}
              onClick={() => change.mutate({ action: "approve", id: row.id })}
            >
              Approve and run review
            </Button>
          )}
        </div>
      ))}
    </section>
  );
}
