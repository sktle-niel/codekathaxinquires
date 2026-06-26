import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Wordmark } from "@/components/ui/wordmark";

/** Shared chrome for the agent portal pages (apply / login / dashboard). */
export function AgentShell({
  children,
  right,
}: {
  children: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <header className="sticky top-0 z-40 border-b border-line bg-canvas/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4 md:px-8">
          <Link to="/" aria-label="CODEKATHAX home">
            <Wordmark />
          </Link>
          <div className="flex items-center gap-4">
            {right ?? (
              <Link
                to="/"
                className="text-sm font-medium text-muted transition-colors hover:text-ink"
              >
                &larr; Back to site
              </Link>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-5 py-10 md:px-8 md:py-14">
        {children}
      </main>
    </div>
  );
}

/** Centered narrow card for the apply / login forms. */
export function AgentCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-2xl border border-line bg-surface p-7 md:p-8">
        <h1 className="font-display text-3xl text-ink">{title}</h1>
        {subtitle && (
          <p className="mt-2 text-sm leading-relaxed text-muted">{subtitle}</p>
        )}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
