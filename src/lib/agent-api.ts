// Agent portal API client (apply / login / me / logout) with bearer-token auth.

const API_BASE = (import.meta.env.VITE_API_BASE ?? "").replace(/\/+$/, "");
const TOKEN_KEY = "ckx_agent_token";

export function getToken(): string {
  try {
    return localStorage.getItem(TOKEN_KEY) ?? "";
  } catch {
    return "";
  }
}
export function setToken(t: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, t);
  } catch {
    /* ignore */
  }
}
export function clearToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

export type Agent = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  payout_method: string | null;
  payout_number: string | null;
  ref_token: string;
  status: string;
  created_at: string;
};

export type AgentClient = {
  reference: string;
  name: string;
  business_name: string | null;
  project_title: string | null;
  path: string;
  deal_amount: number | null;
  deal_status: "lead" | "won" | "lost";
  created_at: string;
  commission: number;
};

export type AgentMe = {
  agent: Agent;
  stats: {
    referrals: number;
    won: number;
    pending: number;
    earnings: number;
    rate: number;
  };
};

export type AgentClientsPage = {
  clients: AgentClient[];
  page: number;
  pages: number;
  total: number;
  has_more: boolean;
};

export type ApplyInput = {
  name: string;
  email: string;
  phone: string;
  password: string;
  payoutMethod: string;
  payoutNumber: string;
};

type ApiError = { error?: string; errors?: Record<string, string> };

async function request<T>(
  query: string,
  init: RequestInit & { auth?: boolean } = {}
): Promise<T> {
  const headers: Record<string, string> = {
    ...(init.body ? { "Content-Type": "application/json" } : {}),
    ...(init.headers as Record<string, string>),
  };
  if (init.auth) {
    const t = getToken();
    if (t) headers.Authorization = `Bearer ${t}`;
  }
  const res = await fetch(`${API_BASE}/agents.php${query}`, { ...init, headers });
  const json = (await res.json().catch(() => null)) as (T & ApiError) | null;
  if (!res.ok || !json) {
    const msg =
      json?.error ??
      (json?.errors ? Object.values(json.errors)[0] : undefined) ??
      `Request failed (${res.status})`;
    const err = new Error(msg) as Error & { fields?: Record<string, string> };
    if (json?.errors) err.fields = json.errors;
    throw err;
  }
  return json as T;
}

export function agentApply(data: ApplyInput) {
  return request<{ ok: true; message: string }>("?do=apply", {
    method: "POST",
    body: JSON.stringify({ ...data, hp: "" }),
  });
}

export function agentMe() {
  return request<AgentMe>("?do=me", { auth: true });
}

export function agentDates() {
  return request<{ dates: string[] }>("?do=dates", { auth: true });
}

export function agentClients(page = 1, month = "", day = "") {
  const q = new URLSearchParams({ do: "clients", page: String(page) });
  if (month) q.set("month", month);
  if (day && day !== "all") q.set("day", day);
  return request<AgentClientsPage>(`?${q.toString()}`, { auth: true });
}

export async function agentLogout() {
  try {
    await request("?do=logout", { method: "POST", auth: true });
  } catch {
    /* ignore network errors on logout */
  }
  clearToken();
}
