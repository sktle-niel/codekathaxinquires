export type NavItem<T extends string> = { id: T; label: string };

const active =
  "bg-white/85 text-ink shadow-[0_2px_10px_-3px_rgba(24,24,27,0.25)]";
const idle = "text-ink/60 hover:bg-white/45 hover:text-ink";

/**
 * Floating frosted-glass navigation. Vertical pill on the left at desktop,
 * horizontal pill at the bottom on mobile. Not a sidebar — it floats over the
 * content. Glass styling lives in `.glass-nav` (index.css) with a solid
 * fallback under prefers-reduced-transparency.
 */
export function GlassNav<T extends string>({
  items,
  value,
  onChange,
}: {
  items: readonly NavItem<T>[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <>
      {/* desktop — vertical, floating left, vertically centered */}
      <nav className="glass-nav fixed left-5 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-1 rounded-[1.25rem] p-2 md:flex">
        {items.map((it) => (
          <button
            key={it.id}
            type="button"
            onClick={() => onChange(it.id)}
            aria-current={value === it.id ? "page" : undefined}
            className={`w-[8.5rem] rounded-2xl px-4 py-2.5 text-left text-sm font-medium transition-colors ${
              value === it.id ? active : idle
            }`}
          >
            {it.label}
          </button>
        ))}
      </nav>

      {/* mobile — horizontal, floating bottom center, scrolls if it overflows */}
      <nav className="glass-nav fixed bottom-4 left-1/2 z-40 flex max-w-[92vw] -translate-x-1/2 gap-1 overflow-x-auto rounded-2xl p-1.5 md:hidden">
        {items.map((it) => (
          <button
            key={it.id}
            type="button"
            onClick={() => onChange(it.id)}
            aria-current={value === it.id ? "page" : undefined}
            className={`whitespace-nowrap rounded-xl px-3 py-2 text-[13px] font-medium transition-colors ${
              value === it.id ? active : idle
            }`}
          >
            {it.label}
          </button>
        ))}
      </nav>
    </>
  );
}
