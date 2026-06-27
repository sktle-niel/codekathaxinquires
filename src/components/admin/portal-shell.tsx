import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Wordmark } from "@/components/ui/wordmark";
import { GlassNav, type NavItem } from "@/components/admin/glass-nav";

/** Shared portal chrome for the admin + agent dashboards: a slim top bar, the
 *  floating glass nav, and a content area that clears the floating nav. */
export function PortalShell<T extends string>({
  items,
  view,
  onView,
  onLogout,
  children,
}: {
  items: readonly NavItem<T>[];
  view: T;
  onView: (v: T) => void;
  onLogout: () => void;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <header className="sticky top-0 z-30 border-b border-line bg-canvas/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 md:px-8">
          <Link to="/" aria-label="CODEKATHAX home">
            <Wordmark />
          </Link>
          <button
            type="button"
            onClick={onLogout}
            className="text-sm font-medium text-muted transition-colors hover:text-ink"
          >
            Log out
          </button>
        </div>
      </header>

      <GlassNav items={items} value={view} onChange={onView} />

      <main className="px-5 pb-28 pt-8 md:pb-16 md:pl-52 md:pr-10 md:pt-12">
        <div className="mx-auto max-w-4xl">{children}</div>
      </main>
    </div>
  );
}
