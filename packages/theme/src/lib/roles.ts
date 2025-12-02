/**
 * Role helpers for UI gating.
 * Uses multiple fallbacks so SUPERADMIN works reliably in dev and prod.
 */
export function isSuperAdminRole(): boolean {
  try {
    // Primary: Vite env at build-time
    const viteVal = import.meta.env.VITE_USER_ROLE;

    // Fallbacks at runtime (no TS "process" ref to avoid node typings):
    const procVal = (globalThis as any)?.process?.env?.VITE_USER_ROLE;

    // Runtime fallbacks: window override or localStorage (support multiple keys)
    const winVal =
      typeof window !== 'undefined'
        ? ((window as any).__USER_ROLE ||
            window.localStorage?.getItem?.('VITE_USER_ROLE') ||
            window.localStorage?.getItem?.('USER_ROLE') ||
            window.localStorage?.getItem?.('userRole'))
        : undefined;

    const roleRaw =
      [viteVal, procVal, winVal].find((v) => typeof v === 'string' && v.length > 0) ?? '';

    const role = String(roleRaw).trim().toLowerCase();
    return role === 'superadmin';
  } catch {
    return false;
  }
}