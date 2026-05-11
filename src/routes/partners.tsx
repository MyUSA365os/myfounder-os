import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/dashboard/placeholder-page";

export const Route = createFileRoute("/partners")({
  head: () => ({ meta: [{ title: "Partners — Founder OS" }] }),
  component: () => (
    <PlaceholderPage
      title="Partners"
      intent="Manage partner relationships, rev-share, and co-marketing pipelines."
      widgetTitle="Partner roster"
      widget={
        <div className="overflow-hidden rounded-md border border-dashed border-border">
          <div className="grid grid-cols-4 bg-muted/50 px-4 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <span>Partner</span>
            <span>Tier</span>
            <span>Rev-share</span>
            <span className="text-right">MTD</span>
          </div>
          <div className="px-4 py-6 text-center text-sm text-muted-foreground">
            Partner data will appear here once connected.
          </div>
        </div>
      }
    />
  ),
});