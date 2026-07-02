import { useEffect, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Wordmark } from "@/components/ui/wordmark";
import { fetchStatus, imageUrl, type ProjectStatus } from "@/lib/status";

export function Track() {
  const [params, setParams] = useSearchParams();
  const [ref, setRef] = useState(params.get("ref") ?? "");
  const [status, setStatus] = useState<ProjectStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [searched, setSearched] = useState(false);

  const load = async (value: string) => {
    const v = value.trim().toUpperCase();
    if (!v) return;
    setBusy(true);
    setSearched(true);
    try {
      setStatus(await fetchStatus(v));
    } catch {
      setStatus({ found: false });
    } finally {
      setBusy(false);
    }
  };

  // Auto-load when arriving with ?ref= (e.g. from the landing form or an email).
  useEffect(() => {
    const initial = params.get("ref");
    if (initial) load(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const v = ref.trim().toUpperCase();
    setParams(v ? { ref: v } : {});
    load(v);
  };

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4 md:px-8">
          <Link to="/" aria-label="CODEKATHAX home">
            <Wordmark />
          </Link>
          <Link to="/" className="text-sm font-medium text-muted transition-colors hover:text-ink">
            &larr; Back to site
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-16 md:px-8 md:py-24">
        <h1 className="font-display text-4xl text-ink md:text-5xl">
          Track your project
        </h1>
        <p className="mt-3 max-w-md text-muted">
          Enter the reference from your confirmation email to see how far along
          your project is.
        </p>

        <form onSubmit={submit} className="mt-8 flex flex-col gap-3 sm:flex-row">
          <input
            value={ref}
            onChange={(e) => setRef(e.target.value.toUpperCase())}
            placeholder="e.g. CKX-7G2K9Q"
            aria-label="Project reference"
            className="flex-1 rounded-md border border-line bg-surface px-4 py-3 font-mono text-sm text-ink outline-none transition-colors focus:border-ink focus:ring-1 focus:ring-ink"
          />
          <button
            type="submit"
            disabled={busy}
            className="rounded-md bg-ink px-6 py-3 text-sm font-semibold text-canvas transition-all hover:bg-ink-soft active:scale-[0.98] disabled:opacity-40"
          >
            {busy ? "Checking…" : "Track"}
          </button>
        </form>

        {searched && !busy && status && (
          status.found ? <StatusView s={status} /> : <NotFound />
        )}
      </main>
    </div>
  );
}

function StatusView({ s }: { s: ProjectStatus }) {
  const p = s.progress ?? 0;
  return (
    <div className="mt-10 rounded-2xl border border-line bg-surface p-6 md:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
            {s.reference}
          </p>
          <h2 className="mt-1 text-xl font-bold text-ink">{s.title}</h2>
        </div>
        <span className="font-display text-4xl text-ink">{p}%</span>
      </div>

      <div className="mt-5 h-3 w-full overflow-hidden rounded-full bg-line">
        <div
          className="h-full rounded-full bg-ink transition-[width] duration-700"
          style={{ width: `${p}%` }}
        />
      </div>

      {s.note && (
        <div className="mt-6 rounded-xl border border-line bg-canvas p-4">
          <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
            Latest update
          </p>
          <p className="text-sm leading-relaxed text-ink">{s.note}</p>
        </div>
      )}

      {s.images && s.images.length > 0 && (
        <div className="mt-6">
          <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
            Progress photos
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {s.images.map((src) => (
              <a
                key={src}
                href={imageUrl(src)}
                target="_blank"
                rel="noopener noreferrer"
                className="block overflow-hidden rounded-lg border border-line"
              >
                <img
                  src={imageUrl(src)}
                  alt="Project progress"
                  loading="lazy"
                  className="aspect-[4/3] h-full w-full object-cover transition-transform hover:scale-105"
                />
              </a>
            ))}
          </div>
        </div>
      )}

      {p >= 90 && (
        <div className="mt-6 rounded-xl border border-brand-ink/20 bg-brand-soft p-4">
          <p className="text-sm font-medium text-brand-ink">
            Your project is almost ready — please get ready for payment. We&apos;ll
            be in touch shortly.
          </p>
        </div>
      )}
    </div>
  );
}

function NotFound() {
  return (
    <div className="mt-10 rounded-2xl border border-line bg-surface p-8 text-center">
      <p className="text-sm text-muted">
        We couldn&apos;t find a project with that reference. Double-check the code
        from your confirmation email.
      </p>
    </div>
  );
}
