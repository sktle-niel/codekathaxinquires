// Admin (owner) portal API client with bearer-token auth.

const API_BASE = (import.meta.env.VITE_API_BASE ?? "").replace(/\/+$/, "");
const TOKEN_KEY = "ckx_admin_token";

export function getAdminToken(): string {
  try {
    return localStorage.getItem(TOKEN_KEY) ?? "";
  } catch {
    return "";
  }
}
export function setAdminToken(t: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, t);
  } catch {
    /* ignore */
  }
}
export function clearAdminToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

export type AdminAgent = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  payout_method: string | null;
  payout_number: string | null;
  ref_token: string;
  status: "pending" | "approved" | "suspended";
  created_at: string;
  approved_at: string | null;
  referrals: number;
};

export type AdminRequest = {
  id: number;
  reference: string;
  path: string;
  name: string;
  email: string;
  phone: string | null;
  business_name: string | null;
  project_title: string | null;
  service: string | null;
  system_type: string | null;
  budget: string | null;
  custom_budget: string | null;
  description: string;
  deal_amount: number | null;
  deal_status: "lead" | "won" | "lost";
  created_at: string;
  agent_id: number | null;
  agent_name: string | null;
  agent_commission: number;
};

export type AdminSummary = {
  requests: { total: number; leads: number; won: number; lost: number };
  revenue: { won_total: number; agent_commission: number; owner_net: number };
  agents: { total: number; pending: number; approved: number };
  rate: number;
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
    const t = getAdminToken();
    if (t) headers.Authorization = `Bearer ${t}`;
  }
  const res = await fetch(`${API_BASE}/admin.php${query}`, { ...init, headers });
  const json = (await res.json().catch(() => null)) as (T & ApiError) | null;
  if (!res.ok || !json) {
    const msg =
      json?.error ??
      (json?.errors ? Object.values(json.errors)[0] : undefined) ??
      `Request failed (${res.status})`;
    const err = new Error(msg) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  return json as T;
}

export function adminAgents() {
  return request<{ agents: AdminAgent[] }>("?do=agents", { auth: true });
}

export function adminSetAgentStatus(id: number, status: string) {
  return request<{ ok: true; emailed: boolean }>("?do=agent-status", {
    method: "POST",
    auth: true,
    body: JSON.stringify({ id, status }),
  });
}

export function adminRequests(page = 1) {
  return request<{
    requests: AdminRequest[];
    rate: number;
    page: number;
    pages: number;
    total: number;
    limit: number;
  }>(`?do=requests&page=${page}`, { auth: true });
}

export function adminSetDeal(
  id: number,
  dealAmount: string,
  dealStatus: string
) {
  return request<{ ok: true; commission: number }>("?do=deal", {
    method: "POST",
    auth: true,
    body: JSON.stringify({ id, deal_amount: dealAmount, deal_status: dealStatus }),
  });
}

export function adminSummary() {
  return request<AdminSummary>("?do=summary", { auth: true });
}

export async function adminLogout() {
  try {
    await request("?do=logout", { method: "POST", auth: true });
  } catch {
    /* ignore */
  }
  clearAdminToken();
}
