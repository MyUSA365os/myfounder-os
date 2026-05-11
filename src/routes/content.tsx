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