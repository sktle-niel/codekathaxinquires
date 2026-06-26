// Unified login — one form for admin + agent. The server returns the role and a
// role-stamped token; we stash it in the matching store and report the role so
// the page can route the user to the right dashboard.
import { setToken } from "@/lib/agent-api";
import { setAdminToken } from "@/lib/admin-api";

const API_BASE = (import.meta.env.VITE_API_BASE ?? "").replace(/\/+$/, "");

export type Role = "admin" | "agent";

export async function login(email: string, password: string): Promise<Role> {
  const res = await fetch(`${API_BASE}/login.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const json = (await res.json().catch(() => null)) as
    | { ok?: boolean; role?: Role; token?: string; error?: string }
    | null;

  if (!res.ok || !json?.ok || !json.token || !json.role) {
    throw new Error(json?.error ?? `Login failed (${res.status})`);
  }

  if (json.role === "admin") {
    setAdminToken(json.token);
    return "admin";
  }
  setToken(json.token);
  return "agent";
}
