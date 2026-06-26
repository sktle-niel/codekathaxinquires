import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Wordmark } from "@/components/ui/wordmark";
import { useProjectModal } from "@/components/project-modal/use-project-modal";
import { NAV } from "@/lib/site";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { open: openModal } = useProjectModal();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors duration-300 ${
        scrolled
          ? "border-line bg-canvas/80 backdrop-blur-md"
          : "border-transparent bg-canvas/0"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 md:px-8">
        <a href="#top" aria-label="CODEKATHAX home">
          <Wordmark />
        </a>

        <nav className="hidden items-center gap-9 md:flex">
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="text-sm font-medium text-muted transition-colors hover:text-ink"
            >
              {n.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="hidden text-sm font-medium text-ink transition-colors hover:text-muted sm:inline-block"
          >
            Log in
          </Link>
          <button
            type="button"
            onClick={openModal}
            className="hidden rounded-md bg-ink px-4 py-2 text-sm font-semibold text-canvas transition-transform hover:bg-ink-soft active:scale-[0.98] sm:inline-block"
          >
            Start a project
          </button>
          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
            className="flex size-9 items-center justify-center rounded-md border border-line text-ink md:hidden"
          >
            <span className="text-base leading-none">{open ? "×" : "☰"}</span>
          </button>
        </div>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-line bg-canvas px-5 py-4 md:hidden">
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              className="rounded-md px-2 py-2.5 text-sm font-medium text-ink hover:bg-brand-soft"
            >
              {n.label}
            </a>
          ))}
          <Link
            to="/login"
            onClick={() => setOpen(false)}
            className="rounded-md px-2 py-2.5 text-sm font-medium text-ink hover:bg-brand-soft"
          >
            Log in
          </Link>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              openModal();
            }}
            className="mt-1 rounded-md bg-ink px-3 py-2.5 text-center text-sm font-semibold text-canvas"
          >
            Start a project
          </button>
        </nav>
      )}
    </header>
  );
}
