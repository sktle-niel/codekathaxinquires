import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AgentShell, AgentCard } from "@/components/agent/agent-shell";
import { Field } from "@/components/project-modal/controls";
import { login } from "@/lib/auth";

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const role = await login(email.trim(), password);
      navigate(role === "admin" ? "/admin" : "/agent", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not log in.");
      setBusy(false);
    }
  };

  return (
    <AgentShell>
      <AgentCard
        title="Log in"
        subtitle="Sign in to your CODEKATHAX account. You'll be taken to the right dashboard automatically."
      >
        <form onSubmit={submit} className="space-y-4" noValidate>
          <Field
            label="Email"
            type="email"
            inputMode="email"
            value={email}
            onChange={setEmail}
            required
          />
          <Field
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            required
          />
          {error && <p className="text-[13px] text-[#9f2f2d]">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-md bg-ink px-5 py-3 text-sm font-semibold text-canvas transition-all hover:bg-ink-soft active:scale-[0.98] disabled:opacity-40"
          >
            {busy ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-muted">
          Want to refer clients?{" "}
          <Link to="/apply" className="font-semibold text-ink hover:underline">
            Apply as an Agent
          </Link>
        </p>
      </AgentCard>
    </AgentShell>
  );
}
