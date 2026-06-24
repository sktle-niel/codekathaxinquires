import type { JSX } from "react";

const props = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** Minimal geometric line icons keyed by service id. */
export const ICONS: Record<string, JSX.Element> = {
  // Web Services — code window
  "01": (
    <svg {...props}>
      <rect x="2.5" y="4" width="19" height="16" />
      <path d="M2.5 8h19" />
      <path d="M9 12l-2 2 2 2M15 12l2 2-2 2" />
    </svg>
  ),
  // Capstone / Thesis — graduation cap
  "02": (
    <svg {...props}>
      <path d="M2 9l10-4 10 4-10 4-10-4z" />
      <path d="M6 11v5c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5v-5" />
      <path d="M22 9v5" />
    </svg>
  ),
  // Desktop Apps — monitor
  "03": (
    <svg {...props}>
      <rect x="2.5" y="3.5" width="19" height="13" />
      <path d="M9 20h6M12 16.5V20" />
    </svg>
  ),
  // Mobile Apps — phone
  "04": (
    <svg {...props}>
      <rect x="7" y="2.5" width="10" height="19" />
      <path d="M10.5 18.5h3" />
    </svg>
  ),
  // Business Websites — building
  "05": (
    <svg {...props}>
      <rect x="4" y="3" width="16" height="18" />
      <path d="M8 7h2M14 7h2M8 11h2M14 11h2M8 15h2M14 15h2M10.5 21v-3h3v3" />
    </svg>
  ),
  // Landing Pages — page w/ hero block
  "06": (
    <svg {...props}>
      <rect x="4" y="3" width="16" height="18" />
      <rect x="7" y="6" width="10" height="5" />
      <path d="M7 14h10M7 17h6" />
    </svg>
  ),
  // Travel & Services — location pin
  "07": (
    <svg {...props}>
      <path d="M12 2c-3.6 0-6 2.7-6 6 0 4.2 6 12 6 12s6-7.8 6-12c0-3.3-2.4-6-6-6z" />
      <circle cx="12" cy="8" r="2.2" />
    </svg>
  ),
  // Library System — books
  "08": (
    <svg {...props}>
      <path d="M5 4h3v16H5zM10 4h3v16h-3z" />
      <path d="M15.5 5l3 .8-3.2 14.4-3-.8z" />
    </svg>
  ),
  // Inventory Systems — boxes
  "09": (
    <svg {...props}>
      <rect x="3" y="3.5" width="8" height="8" />
      <rect x="13" y="3.5" width="8" height="8" />
      <rect x="8" y="13" width="8" height="8" />
    </svg>
  ),
};
