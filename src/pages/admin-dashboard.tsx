import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AgentShell } from "@/components/agent/agent-shell";
import { DateFilter } from "@/components/ui/date-filter";
import {
  adminAgents,
  adminDates,
  adminRequests,
  adminSummary,
  adminSetAgentStatus,
  adminSetDeal,
  adminLogout,
  getAdminToken,
  type AdminAgent,
  type AdminRequest,
  type AdminSummary,
} from "@/lib/admin-api";

const peso = (n: number) =>
  "₱" + Number(n).toLocaleString("en-PH", { maximumFractionDigits: 2 });

const BADGE: Record<string, string> = {
  pending: "bg-[#fbf3db] text-[#956400]",
  approved: "bg-brand-soft text-brand-ink",
  suspended: "bg-[#fdebec] text-[#9f2f2d]",
  lead: "bg-canvas text-muted border border-line",
  won: "bg-brand-soft text-brand-ink",
  lost: "bg-[#fdebec] text-[#9f2f2d]",
};

export function AdminDashboard() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [agents, setAgents] = useState<AdminAgent[]>([]);
  const [dates, setDates] = useState<string[]>([]);
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("all");
  const [requests, setRequests] = useState<AdminRequest[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [reqVersion, setReqVersion] = useState(0);

  const requestsRef = useRef<HTMLHeadingElement>(null);
  const firstLoad = useRef(true);

  // Initial: summary, agents, and the dates that have data.
  useEffect(() => {
    if (!getAdminToken()) {
      navigate("/login", { replace: true });
      return;
    }
    Promise.all([adminSummary(), adminAgents(), adminDates()])
      .then(([s, a, d]) => {
        setSummary(s);
        setAgents(a.agents);
        setDates(d.dates);
        if (d.dates[0]) {
          setMonth(d.dates[0].slice(0, 7));
          setDay(d.dates[0].slice(8, 10));
        }
        setLoaded(true);
      })
      .catch((e) => {
        if ((e as { status?: number }).status === 401) {
          navigate("/login", { replace: true });
        }
      });
  }, [navigate]);

  // Requests: refetch on filter / page / action change.
  const loadRequests = useCallback(async () => {
    if (!loaded) return;
    try {
      const r = await adminRequests(page, month, day);
      setRequests(r.requests);
      setPages(r.pages);
      setTotal(r.total);
    } catch (e) {
      if ((e as { status?: number }).status === 401) {
        navigate("/login", { replace: true });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, page, month, day, reqVersion, navigate]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  // After an action, refresh the totals (and agent list).
  const refreshOverview = useCallback(async () => {
    try {
      const [s, a] = await Promise.all([adminSummary(), adminAgents()]);
      setSummary(s);
      setAgents(a.agents);
    } catch {
      /* ignore */
    }
  }, []);

  const onAgentChanged = () => refreshOverview();
  const onDealSaved = async () => {
    await refreshOverview();
    setReqVersion((v) => v + 1);
  };
  const onFilter = (m: string, d: string) => {
    setMonth(m);
    setDay(d);
    setPage(1);
  };

  // Scroll the requests list into view when paging (but not on first load).
  useEffect(() => {
    if (firstLoad.current) {
      firstLoad.current = false;
      return;
    }
    requestsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [page]);

  const logout = async () => {
    await adminLogout();
    navigate("/login", { replace: true });
  };

  if (!loaded || !summary) {
    return (
      <AgentShell>
        <p className="text-sm text-muted">Loading…</p>
      </AgentShell>
    );
  }

  const pct = Math.round(summary.rate * 100);

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
      <h1 className="font-display text-3xl text-ink md:text-4xl">
        Admin dashboard
      </h1>

      {/* summary */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <Stat label="Requests" value={String(summary.requests.total)} />
        <Stat
          label="Won deals"
          value={`${summary.requests.won} / ${summary.requests.total}`}
        />
        <Stat
          label="Pending agents"
          value={String(summary.agents.pending)}
          highlight={summary.agents.pending > 0}
        />
        <Stat label="Revenue (won)" value={peso(summary.revenue.won_total)} />
        <Stat
          label={`Agent share (${pct}%)`}
          value={peso(summary.revenue.agent_commission)}
        />
        <Stat
          label="Your net"
          value={peso(summary.revenue.owner_net)}
          highlight
        />
      </div>

      {/* agents */}
      <h2 className="mt-12 text-lg font-bold tracking-tight text-ink">
        Agents <span className="text-muted">({agents.length})</span>
      </h2>
      <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-surface">
        {agents.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-muted">
            No agents yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-[12px] uppercase tracking-[0.08em] text-muted">
                  <th className="px-5 py-3 font-medium">Agent</th>
                  <th className="px-5 py-3 font-medium">Payout</th>
                  <th className="px-5 py-3 font-medium">Code</th>
                  <th className="px-5 py-3 font-medium text-center">Refs</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {agents.map((a) => (
                  <AgentRow key={a.id} a={a} onChanged={onAgentChanged} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* requests */}
      <div className="mt-12 flex flex-wrap items-center justify-between gap-3">
        <h2
          ref={requestsRef}
          className="scroll-mt-24 text-lg font-bold tracking-tight text-ink"
        >
          Project requests <span className="text-muted">({total})</span>
        </h2>
        <DateFilter dates={dates} month={month} day={day} onChange={onFilter} />
      </div>
      <div className="mt-4 space-y-4">
        {requests.length === 0 ? (
          <div className="rounded-2xl border border-line bg-surface px-6 py-8 text-center text-sm text-muted">
            No requests for this date.
          </div>
        ) : (
          requests.map((r) => (
            <RequestCard key={r.id} r={r} pct={pct} onSaved={onDealSaved} />
          ))
        )}
      </div>

      {pages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded-md border border-line px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-ink/30 disabled:cursor-not-allowed disabled:opacity-40"
          >
            &larr; Previous
          </button>
          <span className="text-[13px] text-muted">
            Showing {(page - 1) * 10 + 1}&ndash;{Math.min(page * 10, total)} of{" "}
            {total}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page >= pages}
            className="rounded-md border border-line px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-ink/30 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next &rarr;
          </button>
        </div>
      )}
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

function Badge({ value }: { value: string }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-[12px] font-medium capitalize ${
        BADGE[value] ?? BADGE.lead
      }`}
    >
      {value}
    </span>
  );
}

function AgentRow({ a, onChanged }: { a: AdminAgent; onChanged: () => void }) {
  const [busy, setBusy] = useState(false);
  const act = async (status: string) => {
    setBusy(true);
    try {
      await adminSetAgentStatus(a.id, status);
      await onChanged();
    } finally {
      setBusy(false);
    }
  };
  return (
    <tr className="border-b border-line last:border-0 align-top">
      <td className="px-5 py-3">
        <div className="font-medium text-ink">{a.name}</div>
        <div className="text-[13px] text-muted">{a.email}</div>
      </td>
      <td className="px-5 py-3 text-[13px] text-ink-soft">
        {a.payout_method}
        {a.payout_number ? ` · ${a.payout_number}` : ""}
      </td>
      <td className="px-5 py-3 font-mono text-[13px] text-ink">{a.ref_token}</td>
      <td className="px-5 py-3 text-center text-ink">{a.referrals}</td>
      <td className="px-5 py-3">
        <Badge value={a.status} />
      </td>
      <td className="px-5 py-3 text-right">
        <div className="inline-flex gap-2">
          {a.status !== "approved" && (
            <button
              type="button"
              disabled={busy}
              onClick={() => act("approved")}
              className="rounded-md bg-ink px-3 py-1.5 text-[13px] font-semibold text-canvas hover:bg-ink-soft disabled:opacity-40"
            >
              Approve
            </button>
          )}
          {a.status === "approved" && (
            <button
              type="button"
              disabled={busy}
              onClick={() => act("suspended")}
              className="rounded-md border border-line px-3 py-1.5 text-[13px] font-medium text-ink hover:border-ink/30 disabled:opacity-40"
            >
              Suspend
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

function RequestCard({
  r,
  pct,
  onSaved,
}: {
  r: AdminRequest;
  pct: number;
  onSaved: () => void;
}) {
  const [amount, setAmount] = useState(
    r.deal_amount !== null ? String(r.deal_amount) : ""
  );
  const [status, setStatus] = useState(r.deal_status);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  const who = r.business_name || r.project_title || r.name;
  const commission =
    status === "won" && amount ? Number(amount) * (pct / 100) : 0;

  const save = async () => {
    setBusy(true);
    setSaved(false);
    try {
      await adminSetDeal(r.id, amount, status);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
      await onSaved();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[13px] text-muted">
              {r.reference}
            </span>
            <Badge value={r.deal_status} />
          </div>
          <div className="mt-1 text-base font-semibold text-ink">{who}</div>
          <div className="text-[13px] text-muted">
            {r.name} · {r.email}
            {r.phone ? ` · ${r.phone}` : ""}
          </div>
        </div>
        {r.agent_name ? (
          <span className="rounded-full bg-brand-soft px-3 py-1 text-[12px] font-medium text-brand-ink">
            Referred by {r.agent_name}
          </span>
        ) : (
          <span className="rounded-full border border-line px-3 py-1 text-[12px] text-muted">
            Direct
          </span>
        )}
      </div>

      <p className="mt-3 line-clamp-2 text-[13px] leading-relaxed text-muted">
        {r.description}
      </p>

      {/* deal editor */}
      <div className="mt-4 flex flex-wrap items-end gap-3 border-t border-line pt-4">
        <label className="block">
          <span className="text-[12px] font-medium text-muted">
            Final price (₱)
          </span>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
            inputMode="numeric"
            placeholder="0"
            className="mt-1 w-36 rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-ink focus:ring-1 focus:ring-ink"
          />
        </label>
        <label className="block">
          <span className="text-[12px] font-medium text-muted">Status</span>
          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as AdminRequest["deal_status"])
            }
            className="mt-1 rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-ink focus:ring-1 focus:ring-ink"
          >
            <option value="lead">Lead</option>
            <option value="won">Won</option>
            <option value="lost">Lost</option>
          </select>
        </label>
        {r.agent_name && (
          <div className="pb-1 text-[13px]">
            <span className="text-muted">Agent {pct}%: </span>
            <span className="font-semibold text-brand-ink">
              {commission ? peso(commission) : "—"}
            </span>
          </div>
        )}
        <button
          type="button"
          onClick={save}
          disabled={busy}
          className="ml-auto rounded-md bg-ink px-5 py-2 text-sm font-semibold text-canvas hover:bg-ink-soft disabled:opacity-40"
        >
          {busy ? "Saving…" : saved ? "Saved!" : "Save"}
        </button>
      </div>
    </div>
  );
}
