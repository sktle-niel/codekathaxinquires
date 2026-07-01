import { useEffect, useMemo, useRef, useState } from "react";
import { Reveal } from "@/components/ui/reveal";
import { SectionTag } from "@/components/ui/section-tag";
import { fetchVisits, type VisitData } from "@/lib/visits";

// A GitHub-style contribution graph, but every square is a website visitor.
// Weeks run left→right as columns; days run top→bottom (Sun..Sat). One count
// per unique visitor per day — the darker a cell, the more people stopped by.

const WEEKS = 53; // ~one year of columns
const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""]; // rows Sun..Sat
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
// Warm charcoal → ink ramp (on-brand, not GitHub green): 0 = empty hairline,
// 1..4 deepen to the site's signature ink.
const LEVELS = ["#eceae5", "#cbc9c2", "#928f88", "#4d4b47", "#18181b"];
const REFRESH_MS = 60_000; // keep the graph live-ish for new visitors

const toKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;

const prettyDate = (key: string) => {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

type Cell = { key: string; count: number; future: boolean };
type Tip = { x: number; y: number; text: string };

/** Bucket a day's count into one of 5 intensity levels, relative to the busiest
 *  day so the graph stays readable whether the peak is 3 or 300. */
function level(count: number, max: number): number {
  if (count <= 0) return 0;
  if (max <= 4) return Math.min(4, count);
  const q = count / max;
  if (q > 0.75) return 4;
  if (q > 0.5) return 3;
  if (q > 0.25) return 2;
  return 1;
}

function buildGrid(days: Record<string, number>) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // Sunday that opens the current (right-most) week column.
  const thisSunday = new Date(today);
  thisSunday.setDate(today.getDate() - today.getDay());
  // Sunday that opens the left-most column, WEEKS-1 weeks earlier.
  const first = new Date(thisSunday);
  first.setDate(thisSunday.getDate() - (WEEKS - 1) * 7);

  const weeks: Cell[][] = [];
  const months: string[] = [];
  let prevMonth = -1;
  for (let w = 0; w < WEEKS; w++) {
    const col: Cell[] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(first);
      date.setDate(first.getDate() + w * 7 + d);
      const key = toKey(date);
      col.push({ key, count: days[key] ?? 0, future: date > today });
    }
    // Label a column when its first day lands in a new month.
    const m = new Date(first);
    m.setDate(first.getDate() + w * 7);
    if (m.getMonth() !== prevMonth) {
      months.push(MONTHS[m.getMonth()]);
      prevMonth = m.getMonth();
    } else {
      months.push("");
    }
    weeks.push(col);
  }
  return { weeks, months };
}

export function Activity() {
  const [data, setData] = useState<VisitData | null>(null);
  const [tip, setTip] = useState<Tip | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Live-ish: load now, refresh shortly after (to reflect the visit we just
  // counted), then poll so new visitors appear without a page reload.
  useEffect(() => {
    let active = true;
    const load = () =>
      fetchVisits()
        .then((d) => active && setData(d))
        .catch(() => {});
    load();
    const soon = setTimeout(load, 2500);
    const iv = setInterval(load, REFRESH_MS);
    return () => {
      active = false;
      clearTimeout(soon);
      clearInterval(iv);
    };
  }, []);

  const { weeks, months } = useMemo(() => buildGrid(data?.days ?? {}), [data]);
  const max = data?.max ?? 0;
  const total = data?.total ?? 0;

  const showTip = (e: React.MouseEvent<HTMLSpanElement>, cell: Cell) => {
    const card = cardRef.current;
    if (!card) return;
    const r = e.currentTarget.getBoundingClientRect();
    const c = card.getBoundingClientRect();
    setTip({
      x: r.left - c.left + r.width / 2,
      y: r.top - c.top,
      text: `${cell.count} ${cell.count === 1 ? "visitor" : "visitors"} · ${prettyDate(cell.key)}`,
    });
  };

  return (
    <section
      id="activity"
      className="border-t border-line bg-canvas py-24 md:py-32"
    >
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <Reveal>
              <SectionTag>Live activity</SectionTag>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="font-display mt-5 text-4xl text-ink md:text-5xl">
                Every square is a visitor.
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.1}>
            <p className="max-w-sm text-base leading-relaxed text-muted">
              A year of traffic to this site — each cell is a day, counted once
              per visitor. The darker the square, the more people stopped by.
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <div
            ref={cardRef}
            className="relative mt-12 rounded-2xl border border-line bg-surface p-5 md:p-7"
          >
            <div className="mb-5 flex items-baseline gap-2">
              <span className="font-display text-3xl text-ink">
                {total.toLocaleString("en-PH")}
              </span>
              <span className="text-sm text-muted">
                {total === 1 ? "visitor" : "visitors"} in the last year
              </span>
            </div>

            <div className="overflow-x-auto pb-1">
              <div className="inline-flex gap-2">
                {/* day-of-week labels (aligned to the cell rows) */}
                <div className="flex flex-col gap-[3px] pt-[18px]">
                  {DAY_LABELS.map((d, i) => (
                    <span
                      key={i}
                      className="h-3 w-7 text-right text-[10px] leading-3 text-muted"
                    >
                      {d}
                    </span>
                  ))}
                </div>

                <div>
                  {/* month labels (aligned to the week columns) */}
                  <div className="mb-1 flex gap-[3px]">
                    {months.map((m, i) => (
                      <span
                        key={i}
                        className="w-3 whitespace-nowrap text-[10px] leading-[14px] text-muted"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                  {/* week columns */}
                  <div className="flex gap-[3px]">
                    {weeks.map((col, wi) => (
                      <div key={wi} className="flex flex-col gap-[3px]">
                        {col.map((cell) =>
                          cell.future ? (
                            <span key={cell.key} className="size-3" />
                          ) : (
                            <span
                              key={cell.key}
                              onMouseEnter={(e) => showTip(e, cell)}
                              onMouseLeave={() => setTip(null)}
                              className="size-3 rounded-[3px] ring-ink/50 transition-[box-shadow] hover:ring-2"
                              style={{
                                backgroundColor: LEVELS[level(cell.count, max)],
                              }}
                            />
                          )
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* legend */}
            <div className="mt-4 flex items-center justify-end gap-1.5 text-[11px] text-muted">
              <span className="mr-0.5">Less</span>
              {LEVELS.map((c, i) => (
                <span
                  key={i}
                  className="size-3 rounded-[3px]"
                  style={{ backgroundColor: c }}
                />
              ))}
              <span className="ml-0.5">More</span>
            </div>

            {/* floating hover tooltip */}
            {tip && (
              <div
                className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md bg-ink px-2.5 py-1.5 text-[12px] font-medium text-canvas shadow-[0_8px_24px_-8px_rgba(24,24,27,0.45)]"
                style={{ left: tip.x, top: tip.y - 8 }}
              >
                {tip.text}
                <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-ink" />
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
