import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { AgentWorkspace } from "@/components/agent-workspace";

// The shared root RequireAuth guard owns session loading and login redirects.
// No public loader or operational actions; evidence is fetched from the authenticated UI.
export const Route = createFileRoute("/agent-workspace")({
  head: () => ({
    meta: [
      { title: "Agent Workspace — Founder HQ" },
      {
        name: "description",
        content:
          "Read-only Sage setup, integration blockers and review checkpoints for MyUSA AI 1st OS.",
      },
      { property: "og:title", content: "Agent Workspace — Founder HQ" },
      {
        property: "og:description",
        content:
          "Read-only Sage setup, integration blockers and review checkpoints for MyUSA AI 1st OS.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AgentWorkspacePage,
});

function AgentWorkspacePage() {
  return (
    <>
      <AppHeader title="Agent Workspace" subtitle="Sage | MyUSA AI 1st OS" readOnly />
      <AgentWorkspace />
    </>
  );
}
