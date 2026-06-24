import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Selectable card used for path / system / service / budget choices. */
export function OptionCard({
  title,
  desc,
  hint,
  selected,
  onClick,
}: {
  title: string;
  desc?: string;
  hint?: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-all",
        selected
          ? "border-ink bg-canvas ring-1 ring-ink"
          : "border-line bg-surface hover:border-ink/30 hover:bg-canvas"
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors",
          selected ? "border-ink bg-ink text-canvas" : "border-line text-transparent"
        )}
        aria-hidden
      >
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
          <path
            d="M2.5 6.2l2.2 2.3L9.5 3.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-ink">{title}</span>
        {desc && <span className="mt-0.5 block text-[13px] text-muted">{desc}</span>}
        {hint && (
          <span className="mt-0.5 block text-[13px] text-brand-ink">{hint}</span>
        )}
      </span>
    </button>
  );
}

export function Field({
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  type = "text",
  required,
  optional,
  error,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  optional?: boolean;
  error?: string;
  inputMode?: "text" | "email" | "tel" | "numeric";
}) {
  return (
    <label className="block">
      <span className="flex items-center gap-1.5 text-sm font-medium text-ink">
        {label}
        {required && <span className="text-brand-ink">*</span>}
        {optional && <span className="text-xs font-normal text-muted">(optional)</span>}
      </span>
      <input
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        className={cn(
          "mt-1.5 w-full rounded-md border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-muted/70 focus:ring-1",
          error
            ? "border-[#d98b89] focus:border-[#c0524f] focus:ring-[#c0524f]"
            : "border-line focus:border-ink focus:ring-ink"
        )}
      />
      {error && <span className="mt-1.5 block text-[13px] text-[#9f2f2d]">{error}</span>}
    </label>
  );
}

export function TextArea({
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  required,
  error,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="flex items-center gap-1.5 text-sm font-medium text-ink">
        {label}
        {required && <span className="text-brand-ink">*</span>}
      </span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        rows={rows}
        aria-invalid={error ? true : undefined}
        className={cn(
          "mt-1.5 w-full resize-none rounded-md border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-muted/70 focus:ring-1",
          error
            ? "border-[#d98b89] focus:border-[#c0524f] focus:ring-[#c0524f]"
            : "border-line focus:border-ink focus:ring-ink"
        )}
      />
      {error && <span className="mt-1.5 block text-[13px] text-[#9f2f2d]">{error}</span>}
    </label>
  );
}

/** Small segmented Yes/No control. */
export function Segmented({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <span className="text-sm font-medium text-ink">{label}</span>
      <div className="mt-1.5 inline-flex rounded-md border border-line p-0.5">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={cn(
              "rounded px-4 py-1.5 text-sm font-medium transition-colors",
              value === opt ? "bg-ink text-canvas" : "text-muted hover:text-ink"
            )}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

export function StepHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-5">
      <h3 className="text-xl font-bold tracking-tight text-ink">{title}</h3>
      {subtitle && <p className="mt-1.5 text-sm text-muted">{subtitle}</p>}
    </div>
  );
}

export function NoteCard({ children }: { children: ReactNode }) {
  return (
    <div className="mb-5 rounded-xl border border-line bg-brand-soft p-4">
      <p className="text-[13px] leading-relaxed text-brand-ink">{children}</p>
    </div>
  );
}
