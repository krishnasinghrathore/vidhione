// Type shim so TS accepts the theme bootstrap import path used by the host app
declare module '@vidhione/theme/main' {
    const mod: unknown;
    export default mod;
}
