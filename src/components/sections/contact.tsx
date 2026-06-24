import { Reveal } from "@/components/ui/reveal";
import { SectionTag } from "@/components/ui/section-tag";
import { useProjectModal } from "@/components/project-modal/use-project-modal";

const EMAIL = "hello@codekathax.com";

export function Contact() {
  const { open } = useProjectModal();
  return (
    <section id="contact" className="border-t border-line py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="ambient relative overflow-hidden rounded-2xl border border-line bg-surface px-6 py-16 text-center md:px-16 md:py-24">
          <Reveal>
            <SectionTag className="justify-center">
              Start a project
            </SectionTag>
          </Reveal>

          <Reveal delay={0.05}>
            <h2 className="font-display mx-auto mt-6 max-w-3xl text-4xl text-ink md:text-6xl">
              Let&apos;s build something great together.
            </h2>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted">
              Tell us about your website, system, app, or capstone project.
              We&apos;ll reply within one business day with clear next steps.
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button
                type="button"
                onClick={open}
                className="inline-flex items-center justify-center rounded-md bg-ink px-7 py-4 text-sm font-semibold text-canvas transition-transform hover:bg-ink-soft active:scale-[0.98]"
              >
                Start a project
              </button>
              <a
                href={`mailto:${EMAIL}`}
                className="text-sm font-semibold text-ink underline-offset-4 transition-colors hover:text-muted hover:underline"
              >
                {EMAIL}
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
