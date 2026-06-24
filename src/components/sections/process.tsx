import { Reveal } from "@/components/ui/reveal";
import { SectionTag } from "@/components/ui/section-tag";
import { PROCESS } from "@/lib/site";

export function Process() {
  return (
    <section
      id="process"
      className="border-t border-line bg-surface py-24 md:py-32"
    >
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <Reveal>
              <SectionTag>How we work</SectionTag>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="font-display mt-5 text-4xl text-ink md:text-5xl">
                A clear path from idea to launch.
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.1}>
            <p className="max-w-sm text-base leading-relaxed text-muted">
              No guesswork. Every project moves through four simple stages, with
              updates and documentation along the way.
            </p>
          </Reveal>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {PROCESS.map((p, i) => (
            <Reveal key={p.id} delay={(i % 4) * 0.06}>
              <div className="h-full bg-surface p-7">
                <span className="font-display text-4xl text-muted/50">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-5 text-lg font-bold tracking-tight text-ink">
                  {p.title}
                </h3>
                <p className="mt-2.5 text-[15px] leading-relaxed text-muted">
                  {p.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
