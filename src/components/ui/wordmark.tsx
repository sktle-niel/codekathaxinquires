import { cn } from "@/lib/utils";

/**
 * CODEKATHAX wordmark for the light theme: charcoal letters with the
 * signature "X" set in a small lime tile so the brand pops while staying
 * legible on white.
 */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-baseline gap-1.5 font-sans text-lg font-extrabold tracking-tight text-ink",
        className
      )}
    >
      <span className="font-mono text-[0.7em] font-medium text-muted" aria-hidden>
        {"</>"}
      </span>
      <span className="inline-flex items-baseline">
        CODEKATHA
        <span className="ml-[0.12em] inline-grid h-[0.95em] w-[0.82em] translate-y-[0.1em] place-items-center rounded-[3px] bg-brand text-ink">
          X
        </span>
      </span>
    </span>
  );
}
