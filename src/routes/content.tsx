import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/dashboard/placeholder-page";

export const Route = createFileRoute("/content")({
  head: () => ({ meta: [{ title: "Content — Founder OS" }] }),
  component: () => (
    <PlaceholderPage
      title="Content"
      intent="Plan, score, and ship founder content tied to revenue lanes."
      widgetTitle="Content pipeline"
      widget={
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          {["Idea", "Drafting", "In review", "Published"].map((c) => (
            <div key={c} className="rounded-md border border-dashed border-border p-4">
              <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{c}</div>
              <div className="mt-2 text-2xl font-semibold text-foreground">—</div>
            </div>
          ))}
        </div>
      }
    />
  ),
});
*** End Patch
*** Add File: src/routes/inbound.tsx
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
*** End Patch
*** Add File: src/routes/local-growth.tsx
import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/dashboard/placeholder-page";

export const Route = createFileRoute("/local-growth")({
  head: () => ({ meta: [{ title: "Local Growth — Founder OS" }] }),
  component: () => (
    <PlaceholderPage
      title="Local Growth"
      intent="Track local market expansion experiments and their conversion lift."
      widgetTitle="Market experiments"
      widget={
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {["Markets live", "Experiments running", "Lift vs. baseline"].map((l) => (
            <div key={l} className="rounded-md border border-dashed border-border p-4">
              <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{l}</div>
              <div className="mt-2 text-2xl font-semibold text-foreground">—</div>
            </div>
          ))}
        </div>
      }
    />
  ),
});
*** End Patch
*** Add File: src/routes/partners.tsx
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