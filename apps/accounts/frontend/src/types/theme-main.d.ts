// Type shim to satisfy TS resolution for host-injected theme bootstrap
declare module '@vidhione/theme/main' {
  const mod: unknown;
  export default mod;
}