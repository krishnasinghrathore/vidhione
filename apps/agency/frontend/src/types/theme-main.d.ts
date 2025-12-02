// Type shim to satisfy TS for host-injected theme bootstrap import path
declare module '@vidhione/theme/main' {
  const mod: unknown;
  export default mod;
}