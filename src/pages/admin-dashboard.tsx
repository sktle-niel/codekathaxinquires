import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DateFilter } from "@/components/ui/date-filter";
import { PortalShell } from "@/components/admin/portal-shell";
import { AccountSettings } from "@/components/account/account-settings";
import {
  adminAgents,
  adminDates,
  adminRequests,
  adminSummary,
  adminSetAgentStatus,
  adminSetDeal,
  adminGetSettings,
  adminUpdateSettings,
  adminGetAccount,
  adminUpdateAccount,
  adminLogout,
  getAdminToken,
  type AdminAgent,
  type AdminRequest,
  type AdminSummary,
  type AdminSettings,
} from "@/lib/admin-api";

const ADMIN_NAV = [
  { id: "agents", label: "My Agents" },
  { id: "pending", label: "Pending" },
  { id: "completed", label: "Completed" },
  { id: "settings", label: "Settings" },
  { id: "account", label: "Account" },
] as const;
type AdminView = (typeof ADMIN_NAV)[number]["id"];

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

const unauthorized = (e: unknown) => (e as { status?: number }).status === 401;

export function AdminDashboard() {
  const navigate = useNavigate();
  const [view, setView] = useState<AdminView>("agents");

  useEffect(() => {
    if (!getAdminToken()) navigate("/login", { replace: true });
  }, [navigate]);

  const logout = async () => {
    await adminLogout();
    navigate("/login", { replace: true });
  };

  return (
    <PortalShell items={ADMIN_NAV} view={view} onView={setView} onLogout={logout}>
      {view === "agents" && <AgentsView />}
      {view === "pending" && (
        <RequestsView
          key="pending"
          status="lead"
          noun="pending"
          title="Pending projects"
          subtitle="New leads to follow up. Set the price and mark a deal Won to complete it."
        />
      )}
      {view === "completed" && (
        <RequestsView
          key="completed"
          status="won"
          noun="completed"
          title="Completed projects"
          subtitle="Closed deals and the commission earned per client."
        />
      )}
      {view === "settings" && <SettingsView />}
      {view === "account" && <AdminAccountView />}
    </PortalShell>
  );
}

function AdminAccountView() {
  return (
    <AccountSettings
      load={adminGetAccount}
      save={(d) => adminUpdateAccount(d)}
      blurb="Update your owner login. Changes take effect the next time you log in."
    />
  );
}

function Loading() {
  return <p className="text-sm text-muted">Loading…</p>;
}

/* ---------------------------------------------------------------- My Agents */
function AgentsView() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [agents, setAgents] = useState<AdminAgent[]>([]);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    try {
      const [s, a] = await Promise.all([adminSummary(), adminAgents()]);
      setSummary(s);
      setAgents(a.agents);
      setLoaded(true);
    } catch (e) {
      if (unauthorized(e)) navigate("/login", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    load();
  }, [load]);

  if (!loaded || !summary) return <Loading />;

  return (
    <>
      <h1 className="font-display text-3xl text-ink md:text-4xl">My Agents</h1>

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
        <Stat label="Agent share" value={peso(summary.revenue.agent_commission)} />
        <Stat label="Your net" value={peso(summary.revenue.owner_net)} highlight />
      </div>

      <h2 className="mt-12 text-lg font-bold tracking-tight text-ink">
        Agents <span className="text-muted">({agents.length})</span>
      </h2>
      <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-surface">
        {agents.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-muted">No agents yet.</p>
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
                  <AgentRow key={a.id} a={a} onChanged={load} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

/* ----------------------------------------------- Pending / Completed projects */
function RequestsView({
  status,
  noun,
  title,
  subtitle,
}: {
  status: "lead" | "won";
  noun: string;
  title: string;
  subtitle: string;
}) {
  const navigate = useNavigate();
  const [dates, setDates] = useState<string[]>([]);
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("all");
  const [requests, setRequests] = useState<AdminRequest[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [maxPct, setMaxPct] = useState(30);
  const [loaded, setLoaded] = useState(false);
  const [reqVersion, setReqVersion] = useState(0);

  useEffect(() => {
    adminDates(status)
      .then((d) => {
        setDates(d.dates);
        if (d.dates[0]) {
          setMonth(d.dates[0].slice(0, 7));
          setDay(d.dates[0].slice(8, 10));
        }
        setLoaded(true);
      })
      .catch((e) => {
        if (unauthorized(e)) navigate("/login", { replace: true });
      });
  }, [status, navigate]);

  const loadRequests = useCallback(async () => {
    if (!loaded) return;
    try {
      const r = await adminRequests(page, month, day, status);
      setRequests(r.requests);
      setPages(r.pages);
      setTotal(r.total);
      setMaxPct(r.max_pct);
    } catch (e) {
      if (unauthorized(e)) navigate("/login", { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, page, month, day, status, reqVersion, navigate]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  // After a deal save the item may leave this view; refresh dates + list.
  const onDealSaved = async () => {
    try {
      const d = await adminDates(status);
      setDates(d.dates);
      if (!d.dates.some((x) => x.startsWith(month))) {
        setMonth(d.dates[0]?.slice(0, 7) ?? "");
        setDay(d.dates[0]?.slice(8, 10) ?? "all");
        setPage(1);
      }
    } catch {
      /* ignore */
    }
    setReqVersion((v) => v + 1);
  };

  const onFilter = (m: string, d: string) => {
    setMonth(m);
    setDay(d);
    setPage(1);
  };

  if (!loaded) return <Loading />;

  return (
    <>
      <h1 className="font-display text-3xl text-ink md:text-4xl">{title}</h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">{subtitle}</p>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm font-medium text-ink">
          {total} {noun}
        </span>
        <DateFilter dates={dates} month={month} day={day} onChange={onFilter} />
      </div>

      <div className="mt-4 space-y-4">
        {requests.length === 0 ? (
          <div className="rounded-2xl border border-line bg-surface px-6 py-10 text-center text-sm text-muted">
            Nothing {noun} for this date.
          </div>
        ) : (
          requests.map((r) => (
            <RequestCard key={r.id} r={r} maxPct={maxPct} onSaved={onDealSaved} />
          ))
        )}
      </div>

      {pages > 1 && (
        <Pager page={page} pages={pages} total={total} onPage={setPage} />
      )}
    </>
  );
}

/* ---------------------------------------------------------------- Settings */
function SettingsView() {
  const navigate = useNavigate();
  const [data, setData] = useState<AdminSettings | null>(null);
  const [limit, setLimit] = useState("");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    try {
      const s = await adminGetSettings();
      setData(s);
      setLimit(String(s.agent_limit));
    } catch (e) {
      if (unauthorized(e)) navigate("/login", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    load();
  }, [load]);

  if (!data) return <Loading />;

  const save = async () => {
    setBusy(true);
    setSaved(false);
    try {
      const r = await adminUpdateSettings(Math.max(0, Math.floor(Number(limit) || 0)));
      setLimit(String(r.agent_limit));
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
      await load();
    } finally {
      setBusy(false);
    }
  };

  const lim = data.agent_limit;
  const full = lim > 0 && data.agents.total >= lim;

  return (
    <>
      <h1 className="font-display text-3xl text-ink md:text-4xl">Settings</h1>

      <h2 className="mt-8 text-lg font-bold tracking-tight text-ink">
        Agent applications
      </h2>
      <div className="mt-4 rounded-2xl border border-line bg-surface p-6">
        <div className="flex flex-wrap items-end gap-3">
          <label className="block">
            <span className="text-[13px] font-medium text-ink">Maximum agents</span>
            <input
              type="number"
              min={0}
              value={limit}
              onChange={(e) => setLimit(e.target.value.replace(/[^\d]/g, ""))}
              className="mt-1.5 w-40 rounded-md border border-line bg-surface px-3.5 py-2.5 text-sm text-ink outline-none focus:border-ink focus:ring-1 focus:ring-ink"
            />
          </label>
          <button
            type="button"
            onClick={save}
            disabled={busy}
            className="rounded-md bg-ink px-5 py-2.5 text-sm font-semibold text-canvas hover:bg-ink-soft disabled:opacity-40"
          >
            {busy ? "Saving…" : saved ? "Saved!" : "Save"}
          </button>
        </div>
        <p className="mt-3 text-[13px] text-muted">
          Set to <span className="font-medium text-ink">0</span> for unlimited.
          Currently{" "}
          <span className="font-medium text-ink">{data.agents.total}</span>
          {lim > 0 ? ` of ${lim}` : ""} agent
          {data.agents.total === 1 ? "" : "s"}.{" "}
          {full ? (
            <span className="font-medium text-[#9f2f2d]">
              Applications are closed.
            </span>
          ) : (
            <span className="font-medium text-brand-ink">
              Applications are open.
            </span>
          )}
        </p>
      </div>

      <h2 className="mt-12 text-lg font-bold tracking-tight text-ink">Commission</h2>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <Stat label="Default per client" value={`${data.commission.default_pct}%`} />
        <Stat
          label="Maximum allowed"
          value={`${data.commission.max_pct}%`}
          highlight
        />
      </div>
      <p className="mt-3 text-[13px] leading-relaxed text-muted">
        New deals start at the default. Raise a client&apos;s rate up to the
        maximum in the Pending or Completed view. These limits are set on the
        server (.env).
      </p>

      <h2 className="mt-12 text-lg font-bold tracking-tight text-ink">
        Agent program
      </h2>
      <div className="mt-4 grid grid-cols-3 gap-4">
        <Stat label="Total agents" value={String(data.agents.total)} />
        <Stat label="Approved" value={String(data.agents.approved)} />
        <Stat
          label="Pending"
          value={String(data.agents.pending)}
          highlight={data.agents.pending > 0}
        />
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ shared */
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
    <tr className="border-b border-line align-top last:border-0">
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
  maxPct,
  onSaved,
}: {
  r: AdminRequest;
  maxPct: number;
  onSaved: () => void;
}) {
  const [amount, setAmount] = useState(
    r.deal_amount !== null ? String(r.deal_amount) : ""
  );
  const [status, setStatus] = useState(r.deal_status);
  const [pct, setPct] = useState(r.commission_pct);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  const who = r.business_name || r.project_title || r.name;
  const commission =
    status === "won" && amount ? Number(amount) * (pct / 100) : 0;

  const save = async () => {
    setBusy(true);
    setSaved(false);
    try {
      await adminSetDeal(r.id, amount, status, pct);
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
          <label className="block">
            <span className="text-[12px] font-medium text-muted">
              Commission %
            </span>
            <input
              type="number"
              min={0}
              max={maxPct}
              value={pct}
              onChange={(e) =>
                setPct(
                  Math.max(
                    0,
                    Math.min(maxPct, Math.floor(Number(e.target.value) || 0))
                  )
                )
              }
              className="mt-1 w-20 rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-ink focus:ring-1 focus:ring-ink"
            />
          </label>
        )}
        {r.agent_name && (
          <div className="pb-1 text-[13px]">
            <span className="text-muted">Agent gets: </span>
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
