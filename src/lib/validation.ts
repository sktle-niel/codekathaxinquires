// Shared input validation for the "Start a project" form.
//
// Goal: reject obvious junk (keyboard-mashing like "wakjdk", letters in a phone
// field, numbers in a name) without being so strict that real names/brands fail.
// The SAME rules are mirrored on the server (app/validation.php) - the client
// checks are only for fast feedback; the server is the source of truth.

const VOWELS = new Set([..."aeiouyáéíóúàèìòùäëïöü"]);

/** Letters only (any language), used for ratio/run heuristics. */
function lettersOnly(s: string): string {
  return s.replace(/[^\p{L}]/gu, "");
}

/** Longest run of consecutive consonants (keyboard-mash signal). */
function maxConsonantRun(s: string): number {
  let run = 0;
  let max = 0;
  for (const ch of s.toLowerCase()) {
    if (/\p{L}/u.test(ch) && !VOWELS.has(ch)) {
      run += 1;
      if (run > max) max = run;
    } else {
      run = 0;
    }
  }
  return max;
}

/** Share of letters that are vowels (real words sit around 0.3-0.5). */
function vowelRatio(s: string): number {
  const letters = lettersOnly(s).toLowerCase();
  if (!letters) return 0;
  let v = 0;
  for (const ch of letters) if (VOWELS.has(ch)) v += 1;
  return v / letters.length;
}

/**
 * Heuristic: does a single token look like keyboard-mashing?
 * `runLimit` = how many consecutive consonants are allowed before we flag it.
 * Tokens shorter than 4 letters are never flagged (initials, short names).
 */
function tokenLooksFake(token: string, runLimit: number): boolean {
  const letters = lettersOnly(token);
  if (letters.length < 4) return false;
  if (maxConsonantRun(token) >= runLimit) return true;
  if (vowelRatio(token) === 0) return true;
  return false;
}

/** Person name: letters + spaces, hyphen, apostrophe, period only. */
export function validateName(raw: string): string | null {
  const s = raw.trim();
  if (s.length < 2) return "Please enter your full name.";
  if (s.length > 120) return "That name looks too long.";
  if (/[0-9]/.test(s)) return "Names should not contain numbers.";
  if (/[^\p{L}\s.''-]/u.test(s)) return "Please use letters only.";
  if (vowelRatio(s) === 0) return "Please enter a real name.";
  for (const tok of s.split(/\s+/)) {
    if (tokenLooksFake(tok, 4)) return "That doesn't look like a real name.";
  }
  return null;
}

export function validateEmail(raw: string): string | null {
  const s = raw.trim();
  if (!s) return "Please enter your email.";
  if (s.length > 160) return "That email looks too long.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s)) {
    return "Please enter a valid email address.";
  }
  return null;
}

/**
 * "Phone / Messenger" field (optional). Accepts a real phone number, OR a
 * Messenger/social link or @handle. Rejects random text like "kajwdkjk".
 */
export function validateContact(raw: string): string | null {
  const s = raw.trim();
  if (!s) return null; // optional
  if (s.length > 60) return "That's too long.";
  if (
    /^https?:\/\//i.test(s) ||
    /^@[\w.]+$/.test(s) ||
    /(facebook|fb\.com|m\.me|messenger|t\.me|wa\.me|viber)/i.test(s)
  ) {
    return null; // looks like a messenger link / handle
  }
  const digits = s.replace(/\D/g, "");
  if (digits.length >= 7 && digits.length <= 15 && /^[0-9+()\-\s]+$/.test(s)) {
    return null; // looks like a phone number
  }
  return "Enter a valid phone number or Messenger link.";
}

/** Free text (business name, project title, etc.) with a light junk check. */
export function validateText(
  raw: string,
  opts: { min?: number; max?: number; label: string; runLimit?: number }
): string | null {
  const { min = 2, max = 160, label, runLimit = 5 } = opts;
  const s = raw.trim();
  if (s.length < min) return `Please enter ${label}.`;
  if (s.length > max) return `That ${label} looks too long.`;
  if (!/[\p{L}]/u.test(s)) return `Please enter a valid ${label}.`;
  for (const tok of s.split(/\s+/)) {
    if (tokenLooksFake(tok, runLimit)) return `That ${label} doesn't look right.`;
  }
  return null;
}

/** Project description / "what should it do" (needs a real sentence). */
export function validateDescription(raw: string): string | null {
  const s = raw.trim();
  if (s.length < 15) return "Please add a little more detail (at least 15 characters).";
  if (s.length > 4000) return "That's too long.";
  if (vowelRatio(s) < 0.2) return "Please write a clear description.";
  return null;
}

/** Custom budget must reference an actual amount. */
export function validateCustomBudget(raw: string): string | null {
  const s = raw.trim();
  if (!s) return "Please enter your budget.";
  if (s.length > 120) return "That's too long.";
  if (!/\d/.test(s)) return "Please include an amount, e.g. ₱4,500.";
  return null;
}
