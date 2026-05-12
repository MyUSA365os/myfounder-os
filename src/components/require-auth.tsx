import { useEffect } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";

/**
 * Client-side auth guard. Wraps protected route content.
 *
 * - While AuthContext is hydrating session: render the loading slot
 * - If no session: redirect to /login?redirect=<current pathname>
 * - If session: render children
 *
 * The /login route is public — it should NOT be wrapped by this.
 * AuthContext's getSession() runs in useEffect, so during SSR and
 * first client render this will always show the loading state until
 * the session is read from localStorage.
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { session, isLoading } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!isLoading && !session && pathname !== "/login") {
      navigate({
        to: "/login",
        search: { redirect: pathname },
      });
    }
  }, [isLoading, session, pathname, navigate]);

  if (isLoading || !session) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <div className="text-sm text-muted-foreground">Loading…</div>
      </div>
    );
  }

  return <>{children}</>;
}
