import { Reveal } from "@/components/ui/reveal";
import { SectionTag } from "@/components/ui/section-tag";
import { useProjectModal } from "@/components/project-modal/use-project-modal";

export function Hero() {
  const { open } = useProjectModal();
  return (
    <section id="top" className="ambient relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 py-20 md:px-8 md:py-28 lg:grid-cols-12 lg:gap-10">
        {/* copy */}
        <div className="lg:col-span-6">
          <Reveal>
            <SectionTag>Web &amp; App Services</SectionTag>
          </Reveal>

          <Reveal delay={0.05}>
            <h1 className="font-display mt-6 text-5xl text-ink md:text-7xl">
              We build digital
              <br />
              solutions that{" "}
              <span className="relative inline-block">
                <span className="relative z-10">scale</span>
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-[0.12em] z-0 h-[0.28em] bg-brand"
                />
              </span>
              .
            </h1>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="mt-7 max-w-md text-lg leading-relaxed text-muted">
              From idea to deployment, we craft modern, reliable websites,
              systems, and apps for founders, businesses, and students.
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={open}
                className="inline-flex items-center justify-center rounded-md bg-ink px-6 py-3.5 text-sm font-semibold text-canvas transition-transform hover:bg-ink-soft active:scale-[0.98]"
              >
                Start a project
              </button>
              <a
                href="#services"
                className="group inline-flex items-center justify-center gap-1.5 rounded-md px-6 py-3.5 text-sm font-semibold text-ink transition-colors hover:text-muted"
              >
                View services
                <span className="transition-transform group-hover:translate-x-0.5">
                  &rarr;
                </span>
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="mt-10 text-sm text-muted">
              Trusted for capstone &amp; thesis systems, business websites, and
              custom software.
            </p>
          </Reveal>
        </div>

        {/* visual */}
        <Reveal delay={0.15} className="lg:col-span-6">
          <BrowserMock />
        </Reveal>
      </div>
    </section>
  );
}

function BrowserMock() {
  return (
    <div className="relative">
      <a
        href="https://fourwheelszone.com"
        target="_blank"
        rel="noopener noreferrer"
        className="group block overflow-hidden rounded-xl border border-line bg-surface"
        style={{ boxShadow: "0 24px 60px -28px rgba(24,24,27,0.18)" }}
      >
        {/* window chrome */}
        <div className="flex items-center gap-2 border-b border-line px-4 py-3">
          <span className="size-2.5 rounded-full bg-[#e7e4dd]" />
          <span className="size-2.5 rounded-full bg-[#e7e4dd]" />
          <span className="size-2.5 rounded-full bg-[#e7e4dd]" />
          <span className="ml-3 flex-1 truncate rounded-md bg-canvas px-3 py-1 text-center font-mono text-[11px] text-muted">
            fourwheelszone.com
          </span>
        </div>

        {/* live site preview */}
        <div className="aspect-[16/10] overflow-hidden">
          <img
            src="/works/fourwheelszone.webp"
            alt="Four Wheels Zone — a website built by CODEKATHAX"
            className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>
      </a>

      {/* floating status chip */}
      <div className="absolute -bottom-4 -left-3 flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 shadow-[0_8px_24px_-12px_rgba(24,24,27,0.25)]">
        <span className="size-2 rounded-full bg-brand-ink" />
        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink">
          Deployed
        </span>
      </div>
    </div>
  );
}
