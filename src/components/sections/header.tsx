import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Wordmark } from "@/components/ui/wordmark";
import { useProjectModal } from "@/components/project-modal/use-project-modal";
import { NAV } from "@/lib/site";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { open: openModal } = useProjectModal();
  const reduce = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Esc closes the mobile menu.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Lock page scroll while the menu is open (it floats over the content).
  useEffect(() => {
    if (!open) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prev;
    };
  }, [open]);

  // Solid backdrop once scrolled, or while the mobile menu is open.
  const solid = scrolled || open;

  // Reveal the menu items in a soft stagger (collapses to instant when the
  // visitor prefers reduced motion).
  const item = {
    hidden: reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: -6 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: reduce ? 0 : 0.25, ease: EASE },
    },
  };

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors duration-300 ${
        solid
          ? "border-line bg-canvas/85 backdrop-blur-md"
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

          {/* Animated hamburger that morphs into an X. */}
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
            className="flex size-9 items-center justify-center rounded-md border border-line text-ink transition-colors hover:border-ink/30 active:scale-95 md:hidden"
          >
            <span className="relative block h-3 w-4">
              <motion.span
                className="absolute left-0 top-0 block h-[1.5px] w-4 rounded-full bg-ink"
                animate={open ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }}
                transition={{ duration: reduce ? 0 : 0.25, ease: EASE }}
              />
              <motion.span
                className="absolute bottom-0 left-0 block h-[1.5px] w-4 rounded-full bg-ink"
                animate={open ? { rotate: -45, y: -5 } : { rotate: 0, y: 0 }}
                transition={{ duration: reduce ? 0 : 0.25, ease: EASE }}
              />
            </span>
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <>
            {/* Scrim: dims the page and closes the menu when tapped. It floats
                over the content so opening the menu never pushes the page down. */}
            <motion.button
              type="button"
              aria-label="Close menu"
              tabIndex={-1}
              onClick={() => setOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduce ? 0 : 0.2 }}
              className="absolute left-0 right-0 top-full h-[100dvh] bg-ink/15 md:hidden"
            />
            <motion.nav
              id="mobile-menu"
              key="mobile-menu"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: reduce ? 0 : 0.3, ease: EASE }}
              className="absolute left-0 right-0 top-full overflow-hidden border-b border-line bg-canvas shadow-[0_18px_40px_-20px_rgba(24,24,27,0.35)] md:hidden"
            >
            <motion.div
              className="flex flex-col gap-1 px-4 py-4"
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: {
                  transition: {
                    staggerChildren: reduce ? 0 : 0.05,
                    delayChildren: reduce ? 0 : 0.04,
                  },
                },
              }}
            >
              {NAV.map((n) => (
                <motion.a
                  key={n.href}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  variants={item}
                  className="rounded-lg px-3 py-2.5 text-[15px] font-medium text-ink transition-colors hover:bg-brand-soft"
                >
                  {n.label}
                </motion.a>
              ))}

              <motion.div variants={item} className="my-1.5 h-px bg-line" />

              <motion.div variants={item}>
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-[15px] font-medium text-ink transition-colors hover:bg-brand-soft"
                >
                  Log in
                </Link>
              </motion.div>

              <motion.button
                type="button"
                variants={item}
                onClick={() => {
                  setOpen(false);
                  openModal();
                }}
                className="mt-1 rounded-lg bg-ink px-3 py-3 text-center text-[15px] font-semibold text-canvas transition-transform active:scale-[0.98]"
              >
                Start a project
              </motion.button>
            </motion.div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
