import { cn } from "@/lib/utils";

/** Small monospace eyebrow with a lime marker, used to introduce sections. */
export function SectionTag({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.18em] text-muted",
        className
      )}
    >
      <span className="inline-block size-1.5 bg-brand" />
      {children}
    </span>
  );
}
