export type Path = "capstone" | "business";

export type Option = {
  id: string;
  title: string;
  desc?: string;
  hint?: string;
};

/** Step 0 — what is this project for. */
export const PROJECT_PATHS: { id: Path; title: string; desc: string; tag: string }[] =
  [
    {
      id: "capstone",
      title: "Capstone / Thesis",
      desc: "A system for your school project, research, or defense.",
      tag: "Student-friendly",
    },
    {
      id: "business",
      title: "Business",
      desc: "A website, system, or app to run or grow your business.",
      tag: "Built to scale",
    },
  ];

/** Capstone — kind of system. */
export const SYSTEM_TYPES: Option[] = [
  { id: "website", title: "Website / Web System", desc: "Runs in the browser" },
  { id: "desktop", title: "Desktop App", desc: "Offline Windows application" },
  { id: "mobile", title: "Mobile App", desc: "Android / iOS application" },
];

/** Business — what they need. */
export const BUSINESS_SERVICES: Option[] = [
  { id: "business-website", title: "Business Website" },
  { id: "landing-page", title: "Landing Page" },
  { id: "web-system", title: "Web System / Portal" },
  { id: "inventory", title: "Inventory System" },
  { id: "booking", title: "Booking & Services" },
  { id: "other", title: "Something else" },
];

/** Capstone budgets — student-friendly tiers. */
export const CAPSTONE_BUDGETS: Option[] = [
  { id: "3-5k", title: "₱3,000 – ₱5,000", hint: "Minimal system · free revisions" },
  { id: "5-10k", title: "₱5,000 – ₱10,000", hint: "More modules & features" },
  { id: "10-20k", title: "₱10,000 – ₱20,000", hint: "Advanced / full system" },
  { id: "custom", title: "Set your own budget", hint: "Tell us what you can afford" },
];

/** Business budgets. */
export const BUSINESS_BUDGETS: Option[] = [
  { id: "5-10k", title: "₱5,000 – ₱10,000", hint: "Landing page / small site" },
  { id: "10-20k", title: "₱10,000 – ₱20,000", hint: "Business website / system" },
  { id: "20-50k", title: "₱20,000 – ₱50,000", hint: "Custom platform" },
  { id: "custom", title: "Set your own budget", hint: "Tell us your range" },
];

export const CAPSTONE_NOTE =
  "Minimal capstone systems start at ₱3,000–₱5,000 and include free revisions. Extra features or modules may add to the quote — we'll confirm everything before we begin.";

export const QUOTE_EMAIL = "hello@codekathax.com";

export type QuoteData = {
  path: Path | null;
  // capstone
  systemType: string;
  deadline: string;
  // business
  service: string;
  businessName: string;
  industry: string;
  hasExisting: string;
  // shared project details
  projectTitle: string;
  description: string;
  // budget
  budget: string;
  customBudget: string;
  // contact
  name: string;
  email: string;
  phone: string;
  org: string;
};

export const INITIAL_DATA: QuoteData = {
  path: null,
  systemType: "",
  deadline: "",
  service: "",
  businessName: "",
  industry: "",
  hasExisting: "",
  projectTitle: "",
  description: "",
  budget: "",
  customBudget: "",
  name: "",
  email: "",
  phone: "",
  org: "",
};
