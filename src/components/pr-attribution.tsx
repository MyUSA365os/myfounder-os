import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { readPrAttribution } from "@/lib/pr-attribution.functions";

export function CampaignAttribution({ campaignId, userId }: { campaignId: string; userId: string }) {
  const read = useServerFn(readPrAttribution);
  const query = useQuery({
    queryKey: ["pr-attribution", userId, campaignId],
    queryFn: () => read({ data: campaignId }),
    refetchInterval: 60_000,
    retry: false,
  });
  if (query.isError) return <span role="status">CRM attribution unavailable</span>;
  if (!query.data) return <span>Loading CRM attribution…</span>;
  return <dl>
    <dt>{campaignId === "myusa-founder-launch" ? "New CRM contacts from founder launch" : "CRM lead conversions"}</dt><dd>{query.data.leadConversions}</dd>
    <dt>{campaignId === "myusa-founder-launch" ? "Retained founder launch landing page views" : "Retained tracked-link clicks"}</dt><dd>{query.data.retainedTrackedClicks}</dd>
    <dt>Last checked</dt><dd>{new Date(query.data.checkedAt).toLocaleString()}</dd>
  </dl>;
}
