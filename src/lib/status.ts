// Public project tracker client. A client enters their reference to see how far
// along their project is (progress %, note, and update images).

const API_BASE = (import.meta.env.VITE_API_BASE ?? "").replace(/\/+$/, "");

export type ProjectStatus = {
  found: boolean;
  reference?: string;
  title?: string;
  progress?: number;
  note?: string | null;
  images?: string[]; // relative "/uploads/..." paths
  created_at?: string;
};

/** Turn a stored "/uploads/x.webp" path into a full URL against the API host. */
export function imageUrl(path: string): string {
  return /^https?:\/\//.test(path) ? path : `${API_BASE}${path}`;
}

export async function fetchStatus(ref: string): Promise<ProjectStatus> {
  const res = await fetch(
    `${API_BASE}/status.php?ref=${encodeURIComponent(ref)}`
  );
  const json = (await res.json().catch(() => null)) as ProjectStatus | null;
  return json ?? { found: false };
}
