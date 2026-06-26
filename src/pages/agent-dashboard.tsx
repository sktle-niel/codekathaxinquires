import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AgentShell } from "@/components/agent/agent-shell";
import {
  agentMe,
  agentLogout,
  getToken,
  type AgentMe,
  type AgentClient,
} from "@/lib/agent-api";

const peso = (n: number) =>
  "₱" + Number(n).toLocaleString("en-PH", { maximumFractionDigits: 2 });

const STATUS_STYLES: Record<string, string> = {
  lead: "bg-canvas text-muted border border-line",
  won: "bg-brand-soft text-brand-ink",
  lost: "bg-[#fdebec] text-[#9f2f2d]",
};

export function AgentDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<AgentMe | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      navigate("/login", { replace: true });
      return;
    }
    agentMe()
      .then(setData)
      .catch(() => navigate("/login", { replace: true }));
  }, [navigate]);

  const logout = async () => {
    await agentLogout();
    navigate("/login", { replace: true });
  };

  if (!data) {
    return (
      <AgentShell>
        <p className="text-sm text-muted">Loading…</p>
      </AgentShell>
    );
  }

  const { agent, stats, clients } = data;
  const refLink = `${window.location.origin}/?ref=${agent.ref_token}`;
  const pct = Math.round(stats.rate * 100);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(refLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked */
    }
  };

  return (
    <AgentShell
      right={
        <button
          type="button"
          onClick={logout}
          className="text-sm font-medium text-muted transition-colors hover:text-ink"
        >
          Log out
        </button>
      }
    >
      <div className="mb-8">
        <h1 className="font-display text-3xl text-ink md:text-4xl">
          Hi, {agent.name.split(" ")[0]}
        </h1>
        <p className="mt-1 text-sm text-muted">
          You earn <span className="font-semibold text-ink">{pct}%</span> on every
          project from your referrals. Payouts via {agent.payout_method}
          {agent.payout_number ? ` · ${agent.payout_number}` : ""}.
        </p>
      </div>

      {/* referral link */}
      <div className="rounded-2xl border border-line bg-surface p-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
          Your referral link
        </p>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
          <code className="flex-1 truncate rounded-md border border-line bg-canvas px-3.5 py-2.5 text-sm text-ink">
            {refLink}
          </code>
          <button
            type="button"
            onClick={copy}
            className="shrink-0 rounded-md bg-ink px-5 py-2.5 text-sm font-semibold text-canvas transition-transform hover:bg-ink-soft active:scale-[0.98]"
          >
            {copied ? "Copied!" : "Copy link"}
          </button>
        </div>
        <p className="mt-3 text-[13px] text-muted">
          Share this link with your clients. Anyone who submits a project through
          it is automatically tagged to you.
        </p>
      </div>

      {/* stats */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Referrals" value={String(stats.referrals)} />
        <Stat label="In progress" value={String(stats.pending)} />
        <Stat label="Won" value={String(stats.won)} />
        <Stat label={`Earnings (${pct}%)`} value={peso(stats.earnings)} highlight />
      </div>

      {/* clients */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-line bg-surface">
        <div className="border-b border-line px-6 py-4">
          <h2 className="text-base font-bold tracking-tight text-ink">
            Your referred clients
          </h2>
        </div>
        {clients.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-muted">
            No referrals yet. Share your link to get started.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-[12px] uppercase tracking-[0.08em] text-muted">
                  <th className="px-6 py-3 font-medium">Reference</th>
                  <th className="px-6 py-3 font-medium">Client</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Deal</th>
                  <th className="px-6 py-3 font-medium text-right">
                    Your {pct}%
                  </th>
                </tr>
              </thead>
              <tbody>
                {clients.map((c) => (
                  <ClientRow key={c.reference} c={c} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AgentShell>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <div
        className={`font-display text-3xl ${highlight ? "text-brand-ink" : "text-ink"}`}
      >
        {value}
      </div>
      <div className="mt-1 text-[13px] text-muted">{label}</div>
    </div>
  );
}

function ClientRow({ c }: { c: AgentClient }) {
  const who = c.business_name || c.project_title || c.name;
  return (
    <tr className="border-b border-line last:border-0">
      <td className="px-6 py-3 font-mono text-[13px] text-ink">{c.reference}</td>
      <td className="px-6 py-3 text-ink">{who}</td>
      <td className="px-6 py-3">
        <span
          className={`inline-block rounded-full px-2.5 py-0.5 text-[12px] font-medium capitalize ${
            STATUS_STYLES[c.deal_status] ?? STATUS_STYLES.lead
          }`}
        >
          {c.deal_status}
        </span>
      </td>
      <td className="px-6 py-3 text-right text-ink">
        {c.deal_amount ? peso(c.deal_amount) : "—"}
      </td>
      <td className="px-6 py-3 text-right font-semibold text-brand-ink">
        {c.commission ? peso(c.commission) : "—"}
      </td>
    </tr>
  );
}
