// Barrel for Agency pages to mirror Accounts' import ergonomics.
// This exposes the named component pages implemented in the monolithic pages.tsx
// so that leaf route files can import from "pages" (directory) instead of relying
// on deep relative paths to pages.tsx.

export * from '../pages';