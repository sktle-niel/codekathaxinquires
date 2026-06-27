import { useMemo } from "react";
import { Select, type Option } from "@/components/ui/select";

const monthLabel = (m: string) => {
  const [y, mo] = m.split("-");
  return new Date(Number(y), Number(mo) - 1, 1).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });
};

/**
 * Month + day dropdowns built only from dates that actually have data
 * (newest first). Days with no data never appear.
 */
export function DateFilter({
  dates,
  month,
  day,
  onChange,
}: {
  dates: string[]; // "YYYY-MM-DD", newest first
  month: string; // "YYYY-MM"
  day: string; // "DD" or "all"
  onChange: (month: string, day: string) => void;
}) {
  const monthOptions: Option[] = useMemo(
    () =>
      Array.from(new Set(dates.map((d) => d.slice(0, 7)))).map((m) => ({
        value: m,
        label: monthLabel(m),
      })),
    [dates]
  );

  const dayOptions: Option[] = useMemo(() => {
    const days = dates
      .filter((d) => d.startsWith(month))
      .map((d) => d.slice(8, 10));
    return [
      { value: "all", label: "All days" },
      ...days.map((d) => ({ value: d, label: `Day ${Number(d)}` })),
    ];
  }, [dates, month]);

  if (dates.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="mr-0.5 hidden items-center gap-1.5 text-[13px] text-muted sm:flex">
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
          <rect
            x="2"
            y="3"
            width="12"
            height="11"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.4"
          />
          <path
            d="M2 6.5h12M5.5 1.8v2.4M10.5 1.8v2.4"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
        Showing
      </span>
      <Select
        ariaLabel="Filter by month"
        value={month}
        options={monthOptions}
        onChange={(m) => {
          const firstDay =
            dates.find((d) => d.startsWith(m))?.slice(8, 10) ?? "all";
          onChange(m, firstDay);
        }}
      />
      <Select
        ariaLabel="Filter by day"
        value={day}
        options={dayOptions}
        onChange={(d) => onChange(month, d)}
      />
    </div>
  );
}
