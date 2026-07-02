// Visitor activity heatmap client. `trackVisit` records this visit (the server
// dedupes to one count per visitor per day); `fetchVisits` reads a year of
// daily counts for the contribution-graph on the landing page.

const API_BASE = (import.meta.env.VITE_API_BASE ?? "").replace(/\/+$/, "");

export type VisitData = {
  total: number;
  max: number;
  days: Record<string, number>; // { "YYYY-MM-DD": count }
  completions: Record<string, number>; // days a project was completed
};

/** Fire-and-forget: count this visit for today. Deduped server-side, so extra
 *  calls (reloads, re-renders) never inflate the number. Never throws. */
export function trackVisit(): void {
  try {
    void fetch(`${API_BASE}/visits.php`, {
      method: "POST",
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* network/UA unavailable — ignore */
  }
}

/** Daily unique-visitor counts for roughly the last year. */
export async function fetchVisits(): Promise<VisitData> {
  const res = await fetch(`${API_BASE}/visits.php`);
  const json = (await res.json().catch(() => null)) as Partial<VisitData> | null;
  return {
    total: json?.total ?? 0,
    max: json?.max ?? 0,
    days: (json?.days as Record<string, number>) ?? {},
    completions: (json?.completions as Record<string, number>) ?? {},
  };
}
