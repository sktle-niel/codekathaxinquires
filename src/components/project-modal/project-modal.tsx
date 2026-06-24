import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, type Variants } from "motion/react";
import {
  BUSINESS_BUDGETS,
  BUSINESS_SERVICES,
  CAPSTONE_BUDGETS,
  CAPSTONE_NOTE,
  INITIAL_DATA,
  PROJECT_PATHS,
  QUOTE_EMAIL,
  SYSTEM_TYPES,
  type Option,
  type Path,
  type QuoteData,
} from "@/lib/quote";
import {
  Field,
  NoteCard,
  OptionCard,
  Segmented,
  StepHeading,
  TextArea,
} from "./controls";

const FORM_STEPS = 4;
const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
const labelOf = (list: Option[], id: string) =>
  list.find((o) => o.id === id)?.title ?? "—";

const stepVariants: Variants = {
  enter: (dir: number) => ({ x: dir > 0 ? 28 : -28, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -28 : 28, opacity: 0 }),
};

export function ProjectModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [data, setData] = useState<QuoteData>(INITIAL_DATA);
  const [submitted, setSubmitted] = useState(false);

  // fresh state every time the modal opens
  useEffect(() => {
    if (open) {
      setStep(0);
      setDir(1);
      setData(INITIAL_DATA);
      setSubmitted(false);
    }
  }, [open]);

  // lock page scroll while open
  useEffect(() => {
    if (!open) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prev;
    };
  }, [open]);

  // Escape closes (X / close affordance) — outside click never closes
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const set = <K extends keyof QuoteData>(key: K, value: QuoteData[K]) =>
    setData((d) => ({ ...d, [key]: value }));

  const isCapstone = data.path === "capstone";
  const budgets = isCapstone ? CAPSTONE_BUDGETS : BUSINESS_BUDGETS;

  const canProceed = (s: number): boolean => {
    switch (s) {
      case 0:
        return !!data.path;
      case 1:
        return isCapstone ? !!data.systemType : !!data.service;
      case 2:
        return isCapstone
          ? data.projectTitle.trim() !== "" && data.description.trim() !== ""
          : data.businessName.trim() !== "" && data.description.trim() !== "";
      case 3:
        return (
          data.budget !== "" &&
          (data.budget !== "custom" || data.customBudget.trim() !== "")
        );
      case 4:
        return data.name.trim() !== "" && emailOk(data.email);
      default:
        return false;
    }
  };

  const choosePath = (p: Path) => {
    setDir(1);
    setData((d) => ({ ...d, path: p }));
    setStep(1);
  };
  const next = () => {
    if (step < FORM_STEPS && canProceed(step)) {
      setDir(1);
      setStep((s) => s + 1);
    }
  };
  const prev = () => {
    if (step > 0) {
      setDir(-1);
      setStep((s) => s - 1);
    }
  };
  const submit = () => {
    if (canProceed(FORM_STEPS)) setSubmitted(true);
  };

  const budgetText =
    data.budget === "custom"
      ? data.customBudget || "Custom budget"
      : labelOf(budgets, data.budget);

  const summary: [string, string][] = useMemo(() => {
    const rows: [string, string][] = [
      ["For", isCapstone ? "Capstone / Thesis" : "Business"],
    ];
    if (isCapstone) {
      rows.push(["System", labelOf(SYSTEM_TYPES, data.systemType)]);
      if (data.projectTitle) rows.push(["Title", data.projectTitle]);
      if (data.deadline) rows.push(["Deadline", data.deadline]);
    } else {
      rows.push(["Need", labelOf(BUSINESS_SERVICES, data.service)]);
      if (data.businessName) rows.push(["Business", data.businessName]);
      if (data.industry) rows.push(["Industry", data.industry]);
    }
    rows.push(["Budget", budgetText]);
    return rows;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, isCapstone]);

  const mailto = useMemo(() => {
    const lines = [
      `Project for: ${isCapstone ? "Capstone / Thesis" : "Business"}`,
      ...summary.slice(1).map(([k, v]) => `${k}: ${v}`),
      "",
      "Details:",
      data.description || "—",
      "",
      "Contact:",
      `Name: ${data.name}`,
      `Email: ${data.email}`,
      data.phone ? `Phone: ${data.phone}` : "",
      data.org ? `School / Company: ${data.org}` : "",
    ].filter(Boolean);
    const subject = `New project request — ${
      isCapstone ? "Capstone" : "Business"
    }`;
    return `mailto:${QUOTE_EMAIL}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(lines.join("\n"))}`;
  }, [data, summary, isCapstone]);

  const stepLabel = submitted
    ? "Request ready"
    : step === 0
      ? "Choose a path"
      : `Step ${step} of ${FORM_STEPS}`;
  const progress = submitted ? 100 : step === 0 ? 6 : (step / FORM_STEPS) * 100;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-ink/40 p-0 backdrop-blur-sm sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          aria-hidden={false}
        >
          {/* panel — backdrop click intentionally does NOT close */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Start a project"
            className="flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-t-2xl border border-line bg-surface sm:rounded-2xl"
            initial={{ y: 24, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* header */}
            <div className="flex shrink-0 items-center justify-between border-b border-line px-6 py-4">
              <div>
                <p className="text-sm font-bold tracking-tight text-ink">
                  Start a project
                </p>
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
                  {stepLabel}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex size-9 items-center justify-center rounded-md border border-line text-muted transition-colors hover:border-ink/30 hover:text-ink"
              >
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M3 3l10 10M13 3L3 13"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            {/* progress */}
            <div className="h-0.5 w-full shrink-0 bg-line">
              <motion.div
                className="h-full bg-brand"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* body */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {submitted ? (
                <Success summary={summary} name={data.name} />
              ) : (
                <AnimatePresence mode="wait" custom={dir}>
                  <motion.div
                    key={`${data.path ?? "start"}-${step}`}
                    custom={dir}
                    variants={stepVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.22, ease: "easeOut" }}
                  >
                    {step === 0 && (
                      <>
                        <StepHeading
                          title="What is this project for?"
                          subtitle="Pick one — we'll tailor the questions and the quote."
                        />
                        <div className="space-y-3">
                          {PROJECT_PATHS.map((p) => (
                            <OptionCard
                              key={p.id}
                              title={p.title}
                              desc={p.desc}
                              hint={p.tag}
                              selected={data.path === p.id}
                              onClick={() => choosePath(p.id)}
                            />
                          ))}
                        </div>
                      </>
                    )}

                    {step === 1 && isCapstone && (
                      <>
                        <StepHeading title="What are we building?" />
                        <NoteCard>{CAPSTONE_NOTE}</NoteCard>
                        <div className="space-y-3">
                          {SYSTEM_TYPES.map((o) => (
                            <OptionCard
                              key={o.id}
                              title={o.title}
                              desc={o.desc}
                              selected={data.systemType === o.id}
                              onClick={() => set("systemType", o.id)}
                            />
                          ))}
                        </div>
                      </>
                    )}

                    {step === 1 && !isCapstone && (
                      <>
                        <StepHeading
                          title="What do you need?"
                          subtitle="Choose the closest fit — you can add details next."
                        />
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          {BUSINESS_SERVICES.map((o) => (
                            <OptionCard
                              key={o.id}
                              title={o.title}
                              selected={data.service === o.id}
                              onClick={() => set("service", o.id)}
                            />
                          ))}
                        </div>
                      </>
                    )}

                    {step === 2 && isCapstone && (
                      <>
                        <StepHeading title="Tell us about your project" />
                        <div className="space-y-4">
                          <Field
                            label="Project title"
                            value={data.projectTitle}
                            onChange={(v) => set("projectTitle", v)}
                            placeholder="e.g. Library Management System"
                            required
                          />
                          <TextArea
                            label="What should it do?"
                            value={data.description}
                            onChange={(v) => set("description", v)}
                            placeholder="Main features, users, and any requirements from your adviser."
                            required
                          />
                          <Field
                            label="Target deadline"
                            value={data.deadline}
                            onChange={(v) => set("deadline", v)}
                            placeholder="e.g. Defense on March 2026"
                            optional
                          />
                        </div>
                      </>
                    )}

                    {step === 2 && !isCapstone && (
                      <>
                        <StepHeading title="Tell us about your business" />
                        <div className="space-y-4">
                          <Field
                            label="Business name"
                            value={data.businessName}
                            onChange={(v) => set("businessName", v)}
                            placeholder="e.g. Sunrise Travel & Tours"
                            required
                          />
                          <Field
                            label="Industry"
                            value={data.industry}
                            onChange={(v) => set("industry", v)}
                            placeholder="e.g. Travel, Retail, Food"
                            optional
                          />
                          <TextArea
                            label="What do you want to build?"
                            value={data.description}
                            onChange={(v) => set("description", v)}
                            placeholder="Goals, features, and who it's for."
                            required
                          />
                          <Segmented
                            label="Do you have an existing website?"
                            value={data.hasExisting}
                            options={["Yes", "No"]}
                            onChange={(v) => set("hasExisting", v)}
                          />
                        </div>
                      </>
                    )}

                    {step === 3 && (
                      <>
                        <StepHeading
                          title="Your budget"
                          subtitle="A range is fine — it helps us scope the right solution."
                        />
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          {budgets.map((b) => (
                            <OptionCard
                              key={b.id}
                              title={b.title}
                              hint={b.hint}
                              selected={data.budget === b.id}
                              onClick={() => set("budget", b.id)}
                            />
                          ))}
                        </div>
                        {data.budget === "custom" && (
                          <div className="mt-4">
                            <Field
                              label="Your budget"
                              value={data.customBudget}
                              onChange={(v) => set("customBudget", v)}
                              placeholder="e.g. ₱4,500 or what you can afford"
                              required
                            />
                          </div>
                        )}
                      </>
                    )}

                    {step === 4 && (
                      <>
                        <StepHeading
                          title="Where can we reach you?"
                          subtitle="We'll reply within one business day."
                        />
                        <div className="mb-5 rounded-xl border border-line bg-canvas p-4">
                          <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
                            Summary
                          </p>
                          <dl className="space-y-1.5">
                            {summary.map(([k, v]) => (
                              <div
                                key={k}
                                className="flex justify-between gap-4 text-sm"
                              >
                                <dt className="text-muted">{k}</dt>
                                <dd className="text-right font-medium text-ink">
                                  {v}
                                </dd>
                              </div>
                            ))}
                          </dl>
                        </div>
                        <div className="space-y-4">
                          <Field
                            label="Full name"
                            value={data.name}
                            onChange={(v) => set("name", v)}
                            placeholder="Your name"
                            required
                          />
                          <Field
                            label="Email"
                            type="email"
                            value={data.email}
                            onChange={(v) => set("email", v)}
                            placeholder="you@email.com"
                            required
                          />
                          <Field
                            label="Phone / Messenger"
                            value={data.phone}
                            onChange={(v) => set("phone", v)}
                            placeholder="09xx xxx xxxx"
                            optional
                          />
                          <Field
                            label={isCapstone ? "School" : "Company"}
                            value={data.org}
                            onChange={(v) => set("org", v)}
                            placeholder={
                              isCapstone ? "Your school / university" : "Your company"
                            }
                            optional
                          />
                        </div>
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>
              )}
            </div>

            {/* footer */}
            <div className="flex shrink-0 items-center justify-between gap-3 border-t border-line px-6 py-4">
              {submitted ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setStep(0);
                      setData(INITIAL_DATA);
                    }}
                    className="text-sm font-medium text-muted transition-colors hover:text-ink"
                  >
                    Start another
                  </button>
                  <a
                    href={mailto}
                    className="rounded-md bg-ink px-5 py-2.5 text-sm font-semibold text-canvas transition-transform hover:bg-ink-soft active:scale-[0.98]"
                  >
                    Send to our inbox
                  </a>
                </>
              ) : (
                <>
                  {step > 0 ? (
                    <button
                      type="button"
                      onClick={prev}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-ink"
                    >
                      <span aria-hidden>&larr;</span> Back
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={onClose}
                      className="text-sm font-medium text-muted transition-colors hover:text-ink"
                    >
                      Cancel
                    </button>
                  )}

                  {step === 0 ? (
                    <span className="text-xs text-muted">Select to continue</span>
                  ) : step < FORM_STEPS ? (
                    <button
                      type="button"
                      onClick={next}
                      disabled={!canProceed(step)}
                      className="rounded-md bg-ink px-5 py-2.5 text-sm font-semibold text-canvas transition-all hover:bg-ink-soft active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Continue
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={submit}
                      disabled={!canProceed(FORM_STEPS)}
                      className="rounded-md bg-ink px-5 py-2.5 text-sm font-semibold text-canvas transition-all hover:bg-ink-soft active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Submit request
                    </button>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Success({
  summary,
  name,
}: {
  summary: [string, string][];
  name: string;
}) {
  return (
    <div className="py-4 text-center">
      <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-brand-soft">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
          <path
            d="M5 12.5l4.5 4.5L19 7.5"
            stroke="#2f6b33"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <h3 className="font-display mt-5 text-3xl text-ink">
        Thanks{name ? `, ${name.split(" ")[0]}` : ""}.
      </h3>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">
        Your request is ready. Tap “Send to our inbox” to deliver it, and
        we&apos;ll reply within one business day with a quote and next steps.
      </p>
      <div className="mx-auto mt-6 max-w-sm rounded-xl border border-line bg-canvas p-4 text-left">
        <dl className="space-y-1.5">
          {summary.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 text-sm">
              <dt className="text-muted">{k}</dt>
              <dd className="text-right font-medium text-ink">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
