import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { EmailConnectionsAdmin } from "@/components/email-connections-admin";

export const Route = createFileRoute("/email-connections")({
  head: () => ({
    meta: [
      { title: "Email Connections — Founder HQ" },
      { name: "description", content: "Owner-only business mailbox configuration and audit history in Founder HQ." },
      { property: "og:title", content: "Email Connections — Founder HQ" },
      { property: "og:description", content: "Owner-only business mailbox configuration and audit history in Founder HQ." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: EmailConnectionsPage,
});

function EmailConnectionsPage() {
  return <><AppHeader title="Email Connections" /><EmailConnectionsAdmin /></>;
}