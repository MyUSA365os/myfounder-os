import { AppHeader } from "@/components/app-header";
import { Section } from "@/components/dashboard/section";
import { Badge } from "@/components/ui/badge";
import { Construction } from "lucide-react";

export function PlaceholderPage({
  title,
  intent,
  widgetTitle,
  widget,
}: {
  title: string;
  intent: string;
  widgetTitle: string;
  widget: React.ReactNode;
}) {
  return (
    <>
      <AppHeader title={title} subtitle={intent} />
      <main className="flex-1 space-y-6 p-6">
        <Section
          title="Coming soon"
          description={intent}
          className="border-dashed bg-card/60"
          action={
            <Badge variant="secondary" className="gap-1">
              <Construction className="h-3 w-3" />
              In design
            </Badge>
          }
        >
          <p className="text-sm text-muted-foreground">
            This surface is scaffolded and ready for backend wiring. Data sources, role-based
            access, and recommendations will land here as the underlying schema is finalized.
          </p>
        </Section>

        <Section title={widgetTitle} description="Example widget shell — structure only, not live data.">
          {widget}
        </Section>
      </main>
    </>
  );
}