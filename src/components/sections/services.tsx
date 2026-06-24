import { Reveal } from "@/components/ui/reveal";
import { SectionTag } from "@/components/ui/section-tag";
import { ICONS } from "@/components/ui/icons";
import { SERVICES } from "@/lib/site";

export function Services() {
  return (
    <section id="services" className="border-t border-line py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="max-w-2xl">
          <Reveal>
            <SectionTag>What we do</SectionTag>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="font-display mt-5 text-4xl text-ink md:text-5xl">
              Everything you need to ship, in one studio.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-5 text-lg leading-relaxed text-muted">
              Nine core services — from full web systems and capstone projects
              to landing pages that turn visitors into customers.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s, i) => (
            <Reveal key={s.id} delay={(i % 3) * 0.06}>
              <article className="group h-full rounded-xl border border-line bg-surface p-7 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_-18px_rgba(24,24,27,0.22)]">
                <div className="flex items-center justify-between">
                  <span className="flex size-11 items-center justify-center rounded-lg bg-brand-soft text-brand-ink">
                    {ICONS[s.id]}
                  </span>
                  <span className="font-mono text-xs text-muted/70">
                    {s.id}
                  </span>
                </div>
                <h3 className="mt-6 text-lg font-bold tracking-tight text-ink">
                  {s.title}
                </h3>
                <p className="mt-2.5 text-[15px] leading-relaxed text-muted">
                  {s.desc}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
