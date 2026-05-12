import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  TrendingUp,
  Send,
  ShieldCheck,
  FileText,
  Inbox,
  MapPin,
  Users,
  Activity,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useWorkspace } from "@/hooks/useWorkspace";
import { Button } from "@/components/ui/button";

const primary = [
  { title: "Revenue", url: "/revenue", icon: TrendingUp },
  { title: "Outreach", url: "/outreach", icon: Send },
  { title: "Compliance", url: "/compliance", icon: ShieldCheck },
];

const secondary = [
  { title: "Content", url: "/content", icon: FileText },
  { title: "Inbound", url: "/inbound", icon: Inbox },
  { title: "Local Growth", url: "/local-growth", icon: MapPin },
  { title: "Partners", url: "/partners", icon: Users },
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { data: workspace } = useWorkspace();

  async function handleSignOut() {
    try {
      await signOut();
      navigate({ to: "/login" });
    } catch (err) {
      console.error("Sign out failed:", err);
    }
  }

  const NavItem = ({
    item,
  }: {
    item: { title: string; url: string; icon: typeof TrendingUp };
  }) => {
    const active = pathname === item.url;
    const Icon = item.icon;
    return (
      <Link
        to={item.url}
        className={cn(
          "group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
          active
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        <span className="truncate">{item.title}</span>
        {active && (
          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-sidebar-primary" />
        )}
      </Link>
    );
  };

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex">
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
          <Activity className="h-4 w-4" />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold tracking-tight">Founder OS</div>
          <div className="text-[11px] text-sidebar-foreground/60">
            Revenue control plane
          </div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-5">
        <div>
          <div className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
            Operate
          </div>
          <div className="flex flex-col gap-1">
            {primary.map((i) => (
              <NavItem key={i.url} item={i} />
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
            Build
          </div>
          <div className="flex flex-col gap-1">
            {secondary.map((i) => (
              <NavItem key={i.url} item={i} />
            ))}
          </div>
        </div>
      </nav>

      <div className="border-t border-sidebar-border p-4 space-y-3">
        <div className="rounded-md bg-sidebar-accent/40 p-3 text-xs text-sidebar-foreground/80">
          <div className="mb-1 font-medium text-sidebar-foreground">
            {workspace?.name ?? "Workspace"}
          </div>
          <div className="truncate text-sidebar-foreground/60" title={user?.email ?? ""}>
            {user?.email ?? "—"}
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="w-full justify-start gap-2 text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </Button>
      </div>
    </aside>
  );
}