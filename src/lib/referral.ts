// Referral attribution: when a client opens an agent's link (?ref=TOKEN),
// remember the token so it can be attached to their form submission.

const KEY = "ckx_ref";
const VALID = /^[A-Za-z0-9]{1,20}$/;

/** Read ?ref= from the URL, store it, then clean it out of the address bar. */
export function captureRef(): void {
  try {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref && VALID.test(ref)) {
      localStorage.setItem(KEY, ref);
      params.delete("ref");
      const qs = params.toString();
      const url =
        window.location.pathname + (qs ? `?${qs}` : "") + window.location.hash;
      window.history.replaceState(null, "", url);
    }
  } catch {
    /* localStorage / URL unavailable — ignore */
  }
}

/** The remembered referral token, or "" if none. */
export function getRef(): string {
  try {
    return localStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
}
