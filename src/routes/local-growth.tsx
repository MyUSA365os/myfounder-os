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