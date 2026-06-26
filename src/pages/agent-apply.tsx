import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { AgentShell, AgentCard } from "@/components/agent/agent-shell";
import { Field } from "@/components/project-modal/controls";
import { agentApply } from "@/lib/agent-api";

const PAYOUTS = ["GCash", "Maya", "Bank", "Other"];
const labelCls = "flex items-center gap-1.5 text-sm font-medium text-ink";
const inputCls =
  "mt-1.5 w-full rounded-md border border-line bg-surface px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink focus:ring-1 focus:ring-ink";

export function AgentApply() {
  const [f, setF] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    payoutMethod: "GCash",
    payoutNumber: "",
  });
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">(
    "idle"
  );
  const [msg, setMsg] = useState("");
  const up = (k: keyof typeof f, v: string) => setF((s) => ({ ...s, [k]: v }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    setErrs({});
    setMsg("");
    try {
      const res = await agentApply(f);
      setMsg(res.message);
      setStatus("done");
    } catch (err) {
      const e2 = err as Error & { fields?: Record<string, string> };
      if (e2.fields) setErrs(e2.fields);
      setMsg(e2.message || "Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  if (status === "done") {
    return (
      <AgentShell>
        <AgentCard title="Application received">
          <p className="text-sm leading-relaxed text-muted">{msg}</p>
          <Link
            to="/login"
            className="mt-6 inline-flex w-full items-center justify-center rounded-md bg-ink px-5 py-3 text-sm font-semibold text-canvas transition-transform hover:bg-ink-soft active:scale-[0.98]"
          >
            Go to login
          </Link>
        </AgentCard>
      </AgentShell>
    );
  }

  return (
    <AgentShell>
      <AgentCard
        title="Apply as an Agent"
        subtitle="Refer clients and earn 30% on every project you bring in. We'll review your application and email you once you're approved."
      >
        <form onSubmit={submit} className="space-y-4" noValidate>
          <Field
            label="Full name"
            value={f.name}
            onChange={(v) => up("name", v)}
            required
            error={errs.name}
          />
          <Field
            label="Email"
            type="email"
            inputMode="email"
            value={f.email}
            onChange={(v) => up("email", v)}
            required
            error={errs.email}
          />
          <Field
            label="Phone / Messenger"
            value={f.phone}
            onChange={(v) => up("phone", v)}
            optional
            error={errs.phone}
          />
          <Field
            label="Password"
            type="password"
            value={f.password}
            onChange={(v) => up("password", v)}
            required
            placeholder="At least 8 characters"
            error={errs.password}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className={labelCls}>Payout method</span>
              <select
                value={f.payoutMethod}
                onChange={(e) => up("payoutMethod", e.target.value)}
                className={inputCls}
              >
                {PAYOUTS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>
            <Field
              label="Payout number"
              value={f.payoutNumber}
              onChange={(v) => up("payoutNumber", v)}
              required
              placeholder="e.g. 0917…"
              error={errs.payoutNumber}
            />
          </div>

          {status === "error" && Object.keys(errs).length === 0 && (
            <p className="text-[13px] text-[#9f2f2d]">{msg}</p>
          )}

          <button
            type="submit"
            disabled={status === "sending"}
            className="w-full rounded-md bg-ink px-5 py-3 text-sm font-semibold text-canvas transition-all hover:bg-ink-soft active:scale-[0.98] disabled:opacity-40"
          >
            {status === "sending" ? "Submitting…" : "Submit application"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-muted">
          Already an agent?{" "}
          <Link to="/login" className="font-semibold text-ink hover:underline">
            Log in
          </Link>
        </p>
      </AgentCard>
    </AgentShell>
  );
}
