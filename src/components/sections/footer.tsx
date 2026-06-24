import { Wordmark } from "@/components/ui/wordmark";
import { NAV, SERVICES } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-10 px-5 py-16 md:grid-cols-4 md:px-8">
        <div className="col-span-2">
          <Wordmark />
          <p className="mt-4 max-w-xs text-[15px] leading-relaxed text-muted">
            A developer studio building websites, web systems, desktop and
            mobile apps, and capstone projects — from idea to deployment.
          </p>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
            Services
          </h4>
          <ul className="mt-4 space-y-2.5">
            {SERVICES.slice(0, 6).map((s) => (
              <li key={s.id}>
                <a
                  href="#services"
                  className="text-sm text-ink-soft transition-colors hover:text-ink"
                >
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
            Navigate
          </h4>
          <ul className="mt-4 space-y-2.5">
            {NAV.map((n) => (
              <li key={n.href}>
                <a
                  href={n.href}
                  className="text-sm text-ink-soft transition-colors hover:text-ink"
                >
                  {n.label}
                </a>
              </li>
            ))}
            <li>
              <a
                href="#top"
                className="text-sm text-ink-soft transition-colors hover:text-ink"
              >
                Back to top
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-5 py-6 text-sm text-muted md:flex-row md:px-8">
          <span>
            © {new Date().getFullYear()} CODEKATHAX — Web &amp; App Services
          </span>
          <span>Designed &amp; built in the Philippines</span>
        </div>
      </div>
    </footer>
  );
}
