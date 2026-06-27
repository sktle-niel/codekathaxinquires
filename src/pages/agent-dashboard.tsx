import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AgentShell } from "@/components/agent/agent-shell";
import { DateFilter } from "@/components/ui/date-filter";
import {
  agentMe,
  agentDates,
  agentClients,
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
  const [me, setMe] = useState<AgentMe | null>(null);
  const [dates, setDates] = useState<string[]>([]);
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("all");
  const [clients, setClients] = useState<AgentClient[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [ready, setReady] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      navigate("/login", { replace: true });
      return;
    }
    Promise.all([agentMe(), agentDates()])
      .then(([m, d]) => {
        setMe(m);
        setDates(d.dates);
        if (d.dates[0]) {
          setMonth(d.dates[0].slice(0, 7));
          setDay(d.dates[0].slice(8, 10));
        }
        setReady(true);
      })
      .catch(() => navigate("/login", { replace: true }));
  }, [navigate]);

  const loadClients = useCallback(async () => {
    if (!ready) return;
    try {
      const c = await agentClients(page, month, day);
      setClients(c.clients);
      setPages(c.pages);
      setTotal(c.total);
    } catch (e) {
      if ((e as { status?: number }).status === 401) {
        navigate("/login", { replace: true });
      }
    }
  }, [ready, page, month, day, navigate]);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  const onFilter = (m: string, d: string) => {
    setMonth(m);
    setDay(d);
    setPage(1);
  };

  const logout = async () => {
    await agentLogout();
    navigate("/login", { replace: true });
  };

  if (!me) {
    return (
      <AgentShell>
        <p className="text-sm text-muted">Loading…</p>
      </AgentShell>
    );
  }

  const { agent, stats } = me;
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
      </div>

      {/* stats (all-time totals) */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Referrals" value={String(stats.referrals)} />
        <Stat label="In progress" value={String(stats.pending)} />
        <Stat label="Won" value={String(stats.won)} />
        <Stat label={`Earnings (${pct}%)`} value={peso(stats.earnings)} highlight />
      </div>

      {/* clients */}
      <div className="mt-12 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold tracking-tight text-ink">
          Your referred clients
        </h2>
        <DateFilter dates={dates} month={month} day={day} onChange={onFilter} />
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-surface">
        {clients.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-muted">
            No referrals for this date.
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
                  <th className="px-6 py-3 font-medium text-right">Your {pct}%</th>
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

      {pages > 1 && (
        <Pager page={page} pages={pages} total={total} onPage={setPage} />
      )}
    </AgentShell>
  );
}

function Pager({
  page,
  pages,
  total,
  onPage,
}: {
  page: number;
  pages: number;
  total: number;
  onPage: (p: number) => void;
}) {
  return (
    <div className="mt-6 flex items-center justify-between">
      <button
        type="button"
        onClick={() => onPage(Math.max(1, page - 1))}
        disabled={page <= 1}
        className="rounded-md border border-line px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-ink/30 disabled:cursor-not-allowed disabled:opacity-40"
      >
        &larr; Previous
      </button>
      <span className="text-[13px] text-muted">
        Showing {(page - 1) * 10 + 1}&ndash;{Math.min(page * 10, total)} of {total}
      </span>
      <button
        type="button"
        onClick={() => onPage(Math.min(pages, page + 1))}
        disabled={page >= pages}
        className="rounded-md border border-line px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-ink/30 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next &rarr;
      </button>
    </div>
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
