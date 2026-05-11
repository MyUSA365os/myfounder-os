import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/dashboard/placeholder-page";

export const Route = createFileRoute("/inbound")({
  head: () => ({ meta: [{ title: "Inbound — Founder OS" }] }),
  component: () => (
    <PlaceholderPage
      title="Inbound"
      intent="Triage inbound interest and route it to the right offer lane."
      widgetTitle="Inbound queue"
      widget={
        <div className="overflow-hidden rounded-md border border-dashed border-border">
          <div className="grid grid-cols-4 bg-muted/50 px-4 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <span>Source</span>
            <span>Lead</span>
            <span>Intent</span>
            <span className="text-right">Score</span>
          </div>
          <div className="px-4 py-6 text-center text-sm text-muted-foreground">
            No inbound data connected yet.
          </div>
        </div>
      }
    />
  ),
});