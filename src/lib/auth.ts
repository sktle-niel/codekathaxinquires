// Unified login — one form for admin + agent. The server returns the role and a
// role-stamped token; we stash it in the matching store and report the role so
// the page can route the user to the right dashboard.
import { setToken, getToken, clearToken } from "@/lib/agent-api";
import { setAdminToken, getAdminToken, clearAdminToken } from "@/lib/admin-api";

const API_BASE = (import.meta.env.VITE_API_BASE ?? "").replace(/\/+$/, "");

export type Role = "admin" | "agent";

// Ask the server whether a stored token is still a live session. Returns the
// role if so. A stale/expired token is silently cleared so we don't keep it.
async function verify(token: string): Promise<Role | null> {
  try {
    const res = await fetch(`${API_BASE}/session.php`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const json = (await res.json().catch(() => null)) as { role?: Role } | null;
    return json?.role === "admin" || json?.role === "agent" ? json.role : null;
  } catch {
    // Offline / network error — leave the token in place; can't confirm either way.
    return null;
  }
}

// Resolve the current session against the backend (not just localStorage). Used
// to skip the login form and route a still-logged-in user to their dashboard.
export async function resolveSession(): Promise<Role | null> {
  const adminTok = getAdminToken();
  if (adminTok) {
    const role = await verify(adminTok);
    if (role === "admin") return "admin";
    if (role === null && !navigator.onLine) return null; // keep token while offline
    clearAdminToken();
  }
  const agentTok = getToken();
  if (agentTok) {
    const role = await verify(agentTok);
    if (role === "agent") return "agent";
    if (role === null && !navigator.onLine) return null;
    clearToken();
  }
  return null;
}

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
