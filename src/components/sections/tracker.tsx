import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Reveal } from "@/components/ui/reveal";
import { SectionTag } from "@/components/ui/section-tag";

// Landing CTA for existing clients: enter a reference to jump to the /track page.
export function Tracker() {
  const navigate = useNavigate();
  const [ref, setRef] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const v = ref.trim().toUpperCase();
    navigate(v ? `/track?ref=${encodeURIComponent(v)}` : "/track");
  };

  return (
    <section id="tracker" className="border-t border-line bg-surface py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <Reveal>
              <SectionTag>Project tracker</SectionTag>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="font-display mt-5 text-4xl text-ink md:text-5xl">
                Already a client? Check your progress.
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-4 max-w-md text-base leading-relaxed text-muted">
                Enter the reference from your confirmation email to see how far
                along your project is — updates, photos, and all.
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.1}>
            <form
              onSubmit={submit}
              className="rounded-2xl border border-line bg-canvas p-6"
            >
              <label
                htmlFor="track-ref"
                className="text-sm font-medium text-ink"
              >
                Your reference
              </label>
              <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                <input
                  id="track-ref"
                  value={ref}
                  onChange={(e) => setRef(e.target.value.toUpperCase())}
                  placeholder="e.g. CKX-7G2K9Q"
                  className="flex-1 rounded-md border border-line bg-surface px-4 py-3 font-mono text-sm text-ink outline-none transition-colors focus:border-ink focus:ring-1 focus:ring-ink"
                />
                <button
                  type="submit"
                  className="rounded-md bg-ink px-6 py-3 text-sm font-semibold text-canvas transition-all hover:bg-ink-soft active:scale-[0.98]"
                >
                  Track
                </button>
              </div>
              <Link
                to="/track"
                className="mt-3 inline-block text-sm font-medium text-muted transition-colors hover:text-ink"
              >
                Open full tracker &rarr;
              </Link>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
