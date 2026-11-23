import { verifyPrReader } from "@/lib/pr-attribution.functions";
import { FounderLaunchReviews } from "@/components/pr-reviews";
import { CampaignAttribution } from "@/components/pr-attribution";
import { SageAssignmentView } from "@/components/sage-assignment";
import { useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { checkPressRanger } from "@/lib/press-ranger.functions";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useWorkspace } from "@/hooks/useWorkspace";
import { supabase } from "@/lib/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { MediaDatabase } from "@/types/database";
import {
  isQuantityKind,
  mediaKinds,
  mediaStages,
  summarizeMedia,
  type MediaKind,
  type MediaStage,
} from "@/lib/media-pr";

export const Route = createFileRoute("/media-pr")({
  head: () => ({ meta: [{ title: "Media & PR — Founder HQ" }] }),
  component: MediaDashboard,
});

const field = "mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm";
const mediaClient = supabase as unknown as SupabaseClient<MediaDatabase>;
const kinds = Object.keys(mediaKinds) as MediaKind[];
const stages = Object.keys(mediaStages) as MediaStage[];

function MediaDashboard() {
  const { user } = useAuth();
  const { data: workspace, isError: workspaceError } = useWorkspace();
  const queryClient = useQueryClient();
  const verifyReader = useServerFn(verifyPrReader);
  const reader = useMutation({mutationFn: () => verifyReader()});
  const runCheck = useServerFn(checkPressRanger);
  const connection = useMutation({ mutationFn: () => runCheck() });
  const [kind, setKind] = useState<MediaKind>("campaign");
  const [companyFilter, setCompanyFilter] = useState("");
  const [campaignFilter, setCampaignFilter] = useState("");
  const queryKey = ["media-pr", user?.id, workspace?.id];
  const records = useQuery({
    queryKey,
    enabled: Boolean(user && workspace),
    queryFn: async () => {
      if (!workspace) throw new Error("Workspace unavailable");
      const items = [];
      for (let start = 0; ; start += 500) {
        const { data, error } = await mediaClient
          .from("media_pr_records")
          .select("*")
          .eq("workspace_id", workspace.id)
          .order("occurred_on", { ascending: false })
          .order("id")
          .range(start, start + 499);
        if (error) throw error;
        items.push(...data);
        if (data.length < 500) return items;
      }
    },
  });
  const refresh = () => queryClient.invalidateQueries({ queryKey });
  const create = useMutation({
    mutationFn: async (form: FormData) => {
      if (!workspace) throw new Error("Workspace unavailable");
      const read = (name: string) => String(form.get(name) ?? "").trim();
      const quantity = read("quantity");
      const { error } = await mediaClient.from("media_pr_records").insert({
        workspace_id: workspace.id,
        company: read("company"),
        campaign: read("campaign"),
        title: read("title"),
        kind,
        source_ref: read("source_ref") || null,
        quantity: isQuantityKind(kind) && quantity ? Number(quantity) : null,
        occurred_on: read("occurred_on"),
      });
      if (error) throw error;
    },
    onSuccess: refresh,
  });
  const setStage = useMutation({
    mutationFn: async ({ id, stage }: { id: string; stage: MediaStage }) => {
      if (!workspace) throw new Error("Workspace unavailable");
      const { error } = await mediaClient
        .from("media_pr_records")
        .update({ stage })
        .eq("id", id)
        .eq("workspace_id", workspace.id)
        .select("id")
        .single();
      if (error) throw error;
    },
    onSuccess: refresh,
  });
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    create.mutate(new FormData(form), { onSuccess: () => form.reset() });
  };
  const all = records.data ?? [];
  const companies = [...new Set(all.map((record) => record.company))].sort();
  const brandRecords = all.filter((record) => !companyFilter || record.company === companyFilter);
  const campaigns = [...new Set(brandRecords.map((record) => record.campaign))].sort();
  const visible = brandRecords.filter(
    (record) => !campaignFilter || record.campaign === campaignFilter,
  );
  const totals = summarizeMedia(visible);
  return (
    <section className="mx-auto max-w-7xl space-y-7 p-4 md:p-8">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">MyUSA Media &amp; PR</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Track campaign activity and results. Record Press Ranger, analytics and uGotLeads
          references with each result.
        </p>
      </header>
      <SageAssignmentView />
      <FounderLaunchReviews />
      <Button variant="outline" disabled={reader.isPending} onClick={() => reader.mutate()}>Check uGotLeads attribution reader</Button>
      {(reader.isSuccess || reader.isError) && <p role="status">{reader.data?.authenticated ? "Main PR attribution reader authenticated." : "Main PR attribution reader unavailable."}</p>}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="outline"
          disabled={connection.isPending}
          onClick={() => connection.mutate()}
        >
          Check Sage’s Press Ranger connection
        </Button>
        {(connection.data || connection.isError) && (
          <span role="status" className="text-sm">
            {connection.isError || connection.data === "unavailable"
              ? "Connection check unsuccessful."
              : connection.data === "connected"
                ? "Press Ranger authenticated."
                : connection.data === "restricted"
                  ? "Available to the configured founder."
                  : connection.data === "unconfigured"
                    ? "Press Ranger server credentials are pending."
                    : connection.data}
          </span>
        )}
      </div>
      {workspaceError || records.isError ? (
        <p role="alert">Media records could not be loaded.</p>
      ) : null}
      {records.isPending && !workspaceError ? <p>Loading media records…</p> : null}
      {records.isSuccess && (
        <>
          <div className="flex flex-wrap gap-4">
            <label>
              Company
              <select
                className={field}
                value={companyFilter}
                onChange={(event) => {
                  setCompanyFilter(event.target.value);
                  setCampaignFilter("");
                }}
              >
                <option value="">All companies</option>
                {companies.map((name) => (
                  <option key={name}>{name}</option>
                ))}
              </select>
            </label>
            <label>
              Campaign
              <select
                className={field}
                value={campaignFilter}
                onChange={(event) => setCampaignFilter(event.target.value)}
              >
                <option value="">All campaigns</option>
                {campaigns.map((name) => (
                  <option key={name}>{name}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5" aria-label="Recorded results">
            {kinds.map((item) => (
              <div key={item} className="rounded-lg border border-border bg-card p-4">
                <div className="text-xs text-muted-foreground">{mediaKinds[item]}</div>
                <div className="mt-1 text-2xl font-semibold tabular-nums">
                  {totals[item].toLocaleString()}
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={submit} className="rounded-lg border border-border bg-card p-5">
            <h2 className="mb-4 text-lg font-semibold">Add media activity</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <label>
                Company
                <input
                  name="company"
                  list="pr-companies"
                  className={field}
                  required
                  maxLength={120}
                />
              </label>
              <datalist id="pr-companies">
                {companies.map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
              <label>
                Campaign
                <input
                  name="campaign"
                  list="pr-campaigns"
                  className={field}
                  required
                  maxLength={160}
                />
              </label>
              <datalist id="pr-campaigns">
                {campaigns.map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
              <label>
                Activity
                <select
                  value={kind}
                  className={field}
                  onChange={(event) => setKind(event.target.value as MediaKind)}
                >
                  {kinds.map((item) => (
                    <option key={item} value={item}>
                      {mediaKinds[item]}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Title
                <input name="title" className={field} required maxLength={200} />
              </label>
              <label>
                Date
                <input type="date" name="occurred_on" className={field} required />
              </label>
              <label>
                Source URL or record ID
                {kind === "campaign" && <small className="block">For live uGotLeads totals, enter ugl:campaign: followed by the campaign ID.</small>}
                <input name="source_ref" className={field} maxLength={1000} />
              </label>
              {isQuantityKind(kind) && (
                <label>
                  Quantity
                  <input
                    name="quantity"
                    type="number"
                    min="0"
                    max="2147483647"
                    className={field}
                    required={kind !== "client_result"}
                  />
                </label>
              )}
            </div>
            <Button className="mt-4" type="submit" disabled={create.isPending}>
              Add draft record
            </Button>
            {create.isError && (
              <p className="mt-2 text-sm text-destructive" role="alert">
                The record could not be saved.
              </p>
            )}
          </form>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-left text-sm">
              <caption className="border-b border-border p-4 text-left text-lg font-semibold">
                Campaign activity
              </caption>
              <thead>
                <tr>
                  {[
                    "Date",
                    "Company",
                    "Campaign",
                    "Activity",
                    "Title",
                    "Quantity",
                    "Reference",
                    "Status",
                  ].map((label) => (
                    <th key={label} className="px-3 py-2">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map((record) => (
                  <tr key={record.id} className="border-t border-border">
                    <td className="whitespace-nowrap px-3 py-2">{record.occurred_on}</td>
                    <td className="px-3">{record.company}</td>
                    <td className="px-3">{record.campaign}</td>
                    <td className="px-3">{mediaKinds[record.kind]}</td>
                    <td className="px-3">{record.title}</td>
                    <td className="px-3">{record.quantity ?? "—"}</td>
                    <td className="max-w-52 break-all px-3">{record.source_ref ?? "—"}
                      {user && record.kind === "campaign" && (
                        record.company === "MyUSA Local" && record.campaign === "Founder launch" &&
                        record.source_ref === "https://pressranger.com/press-releases/fff47739-6460-4bde-a66f-857c7ebf8d13/edit"
                          ? <CampaignAttribution userId={user.id} campaignId="myusa-founder-launch" />
                          : record.source_ref?.match(/^ugl:campaign:([A-Za-z0-9_-]{1,160})$/) &&
                            <CampaignAttribution userId={user.id} campaignId={record.source_ref.slice(13)} />
                      )}
                    </td>
                    <td className="px-3">
                      <select
                        className={field}
                        aria-label={`Status for ${record.title}`}
                        value={record.stage}
                        disabled={setStage.isPending}
                        onChange={(event) =>
                          setStage.mutate({
                            id: record.id,
                            stage: event.target.value as MediaStage,
                          })
                        }
                      >
                        {stages.map((stage) => (
                          <option key={stage} value={stage}>
                            {mediaStages[stage]}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
                {visible.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-4 text-muted-foreground">
                      No media activity for this selection.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {setStage.isError && (
            <p role="alert" className="text-destructive">
              The status could not be updated.
            </p>
          )}
        </>
      )}
    </section>
  );
}
