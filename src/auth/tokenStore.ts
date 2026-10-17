const KEY = 'loyalty.token';

/**
 * The Sanctum bearer token is kept in sessionStorage: simple, survives a page
 * reload within the tab, and is discarded when the tab closes. It is readable
 * by JavaScript, so it is exposed to XSS — a known trade-off documented in the
 * README, with the cookie-based Sanctum SPA flow described as the hardening
 * path. All access is wrapped so a disabled/blocked storage never throws.
 */
export const tokenStore = {
  get(): string | null {
    try {
      return sessionStorage.getItem(KEY);
    } catch {
      return null;
    }
  },
  set(token: string): void {
    try {
      sessionStorage.setItem(KEY, token);
    } catch {
      /* storage unavailable — the session simply will not persist */
    }
  },
  clear(): void {
    try {
      sessionStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  },
};
