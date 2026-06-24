import { Reveal } from "@/components/ui/reveal";
import { SectionTag } from "@/components/ui/section-tag";
import { WORKS, type Work } from "@/lib/works";

export function Work() {
  const featured = WORKS.find((w) => w.featured) ?? WORKS[0];
  const rest = WORKS.filter((w) => w !== featured);

  return (
    <section id="work" className="border-t border-line py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="max-w-2xl">
          <Reveal>
            <SectionTag>Selected work</SectionTag>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="font-display mt-5 text-4xl text-ink md:text-5xl">
              Real businesses, live on the web.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-5 text-lg leading-relaxed text-muted">
              A few of the websites and systems we&apos;ve built and shipped for
              real businesses. Click any project to visit the live site.
            </p>
          </Reveal>
        </div>

        {/* featured project */}
        <Reveal delay={0.1}>
          <a
            href={featured.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-14 grid overflow-hidden rounded-2xl border border-line bg-surface transition-all hover:shadow-[0_24px_60px_-32px_rgba(24,24,27,0.28)] lg:grid-cols-2"
          >
            <div className="order-2 flex flex-col justify-center p-8 md:p-12 lg:order-1">
              <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-brand-ink">
                <span className="size-1.5 rounded-full bg-brand-ink" />
                Latest · Live
              </span>
              <h3 className="mt-4 text-3xl font-bold tracking-tight text-ink">
                {featured.name}
              </h3>
              <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted">
                {featured.desc}
              </p>
              <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-ink">
                {featured.domain}
                <Arrow />
              </span>
            </div>
            <div className="order-1 overflow-hidden border-b border-line lg:order-2 lg:border-b-0 lg:border-l">
              <div className="aspect-[16/10] h-full w-full">
                <img
                  src={featured.image}
                  alt={`${featured.name} website`}
                  loading="lazy"
                  className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </div>
            </div>
          </a>
        </Reveal>

        {/* other projects */}
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {rest.map((w, i) => (
            <Reveal key={w.domain} delay={i * 0.08}>
              <WorkCard work={w} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function WorkCard({ work }: { work: Work }) {
  return (
    <a
      href={work.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block h-full overflow-hidden rounded-2xl border border-line bg-surface transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-24px_rgba(24,24,27,0.25)]"
    >
      <div className="aspect-[16/10] overflow-hidden border-b border-line">
        <img
          src={work.image}
          alt={`${work.name} website`}
          loading="lazy"
          className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between gap-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
            {work.category}
          </span>
        </div>
        <h3 className="mt-3 text-lg font-bold tracking-tight text-ink">
          {work.name}
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">{work.desc}</p>
        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink">
          {work.domain}
          <Arrow />
        </span>
      </div>
    </a>
  );
}

function Arrow() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 16 16"
      fill="none"
      className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
      aria-hidden
    >
      <path
        d="M5 11L11 5M11 5H6M11 5V10"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
