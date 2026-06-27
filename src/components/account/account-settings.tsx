import { useEffect, useState, type FormEvent } from "react";
import { Field } from "@/components/project-modal/controls";

type AccountData = { name: string; email: string };
type SaveInput = AccountData & {
  current_password: string;
  new_password: string;
};

/** Reusable account editor (username / email / password). Used by both the
 *  admin and agent portals — only the load/save calls differ. */
export function AccountSettings({
  load,
  save,
  blurb,
}: {
  load: () => Promise<AccountData>;
  save: (data: SaveInput) => Promise<unknown>;
  blurb?: string;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [newPass, setNewPass] = useState("");
  const [curPass, setCurPass] = useState("");
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<
    "loading" | "idle" | "saving" | "saved" | "error"
  >("loading");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    load()
      .then((a) => {
        setName(a.name);
        setEmail(a.email);
        setStatus("idle");
      })
      .catch(() => setStatus("idle"));
  }, [load]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (status === "saving") return;
    setStatus("saving");
    setErrs({});
    setMsg("");
    try {
      await save({
        name,
        email,
        current_password: curPass,
        new_password: newPass,
      });
      setNewPass("");
      setCurPass("");
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 1800);
    } catch (err) {
      const e2 = err as Error & { fields?: Record<string, string> };
      if (e2.fields) setErrs(e2.fields);
      setMsg(e2.message || "Could not save your changes.");
      setStatus("error");
    }
  };

  if (status === "loading") {
    return <p className="text-sm text-muted">Loading…</p>;
  }

  return (
    <>
      <h1 className="font-display text-3xl text-ink md:text-4xl">Account</h1>
      {blurb && (
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">{blurb}</p>
      )}

      <form
        onSubmit={submit}
        className="mt-6 max-w-md space-y-4 rounded-2xl border border-line bg-surface p-6"
        noValidate
      >
        <Field
          label="Username"
          value={name}
          onChange={setName}
          required
          error={errs.name}
        />
        <Field
          label="Email"
          type="email"
          inputMode="email"
          value={email}
          onChange={setEmail}
          required
          error={errs.email}
        />
        <Field
          label="New password"
          type="password"
          value={newPass}
          onChange={setNewPass}
          optional
          placeholder="Leave blank to keep current"
          error={errs.new_password}
        />
        <div className="border-t border-line pt-4">
          <Field
            label="Current password"
            type="password"
            value={curPass}
            onChange={setCurPass}
            required
            placeholder="Required to save changes"
            error={errs.current_password}
          />
        </div>

        {status === "error" && Object.keys(errs).length === 0 && (
          <p className="text-[13px] text-[#9f2f2d]">{msg}</p>
        )}

        <button
          type="submit"
          disabled={status === "saving"}
          className="w-full rounded-md bg-ink px-5 py-3 text-sm font-semibold text-canvas transition-all hover:bg-ink-soft active:scale-[0.98] disabled:opacity-40"
        >
          {status === "saving"
            ? "Saving…"
            : status === "saved"
              ? "Saved!"
              : "Save changes"}
        </button>
      </form>
    </>
  );
}
