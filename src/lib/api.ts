import type { QuoteData } from "@/lib/quote";
import { getRef } from "@/lib/referral";

// Base URL of the PHP API. Configure via VITE_API_BASE (see .env). When empty,
// requests go to the same origin that serves the site.
const API_BASE = (import.meta.env.VITE_API_BASE ?? "").replace(/\/+$/, "");

export type SubmitResult = {
  ok: true;
  reference: string;
  emailed: boolean;
};

type ApiResponse = {
  ok?: boolean;
  reference?: string;
  emailed?: boolean;
  error?: string;
  errors?: Record<string, string>;
};

export async function submitQuote(data: QuoteData): Promise<SubmitResult> {
  const res = await fetch(`${API_BASE}/requests.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // `hp` is a honeypot the server checks for spam — always empty for real users.
    // `ref` attributes the submission to the agent whose link the client used.
    body: JSON.stringify({ ...data, hp: "", ref: getRef() }),
  });

  const json = (await res.json().catch(() => null)) as ApiResponse | null;

  if (!res.ok || !json?.ok) {
    const firstError =
      json?.error ??
      (json?.errors ? Object.values(json.errors)[0] : undefined) ??
      `Request failed (${res.status})`;
    throw new Error(firstError);
  }

  return {
    ok: true,
    reference: json.reference ?? "",
    emailed: Boolean(json.emailed),
  };
}
