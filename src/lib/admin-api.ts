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
  downpayment: string | null;
  description: string;
  deal_amount: number | null;
  deal_status: "lead" | "won" | "lost";
  commission_pct: number;
  created_at: string;
  agent_id: number | null;
  agent_name: string | null;
  agent_commission: number;
};

export type AdminSummary = {
  requests: { total: number; leads: number; won: number; lost: number };
  revenue: { won_total: number; agent_commission: number; owner_net: number };
  agents: { total: number; pending: number; approved: number };
  default_pct: number;
  max_pct: number;
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
    const err = new Error(msg) as Error & {
      status?: number;
      fields?: Record<string, string>;
    };
    err.status = res.status;
    if (json?.errors) err.fields = json.errors;
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

export function adminDates(status = "") {
  const q = new URLSearchParams({ do: "dates" });
  if (status) q.set("status", status);
  return request<{ dates: string[] }>(`?${q.toString()}`, { auth: true });
}

export function adminRequests(page = 1, month = "", day = "", status = "") {
  const q = new URLSearchParams({ do: "requests", page: String(page) });
  if (month) q.set("month", month);
  if (day && day !== "all") q.set("day", day);
  if (status) q.set("status", status);
  return request<{
    requests: AdminRequest[];
    default_pct: number;
    max_pct: number;
    page: number;
    pages: number;
    total: number;
    limit: number;
  }>(`?${q.toString()}`, { auth: true });
}

export function adminSetDeal(
  id: number,
  dealAmount: string,
  dealStatus: string,
  commissionPct: number,
  downpayment: string
) {
  return request<{
    ok: true;
    commission: number;
    commission_pct: number;
    downpayment: string | null;
  }>("?do=deal", {
    method: "POST",
    auth: true,
    body: JSON.stringify({
      id,
      deal_amount: dealAmount,
      deal_status: dealStatus,
      commission_pct: commissionPct,
      downpayment,
    }),
  });
}

export function adminSummary() {
  return request<AdminSummary>("?do=summary", { auth: true });
}

export type AdminSettings = {
  agent_limit: number;
  agents: { total: number; pending: number; approved: number };
  commission: { default_pct: number; max_pct: number };
};

export function adminGetSettings() {
  return request<AdminSettings>("?do=settings", { auth: true });
}

export function adminUpdateSettings(agentLimit: number) {
  return request<{ ok: true; agent_limit: number }>("?do=settings", {
    method: "POST",
    auth: true,
    body: JSON.stringify({ agent_limit: agentLimit }),
  });
}

export function adminGetAccount() {
  return request<{ name: string; email: string }>("?do=account", { auth: true });
}

export function adminUpdateAccount(data: {
  name: string;
  email: string;
  current_password: string;
  new_password: string;
}) {
  return request<{ ok: true; name: string; email: string }>("?do=account", {
    method: "POST",
    auth: true,
    body: JSON.stringify(data),
  });
}

export async function adminLogout() {
  try {
    await request("?do=logout", { method: "POST", auth: true });
  } catch {
    /* ignore */
  }
  clearAdminToken();
}
