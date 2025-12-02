export type DocumentContent = {
  id: string;
  fileName: string;
  mimeType?: string | null;
  contentBase64: string; // data URL
};
 
function getBaseUrl(): string {
  const graphql = (import.meta as any).env?.VITE_GRAPHQL_URL || 'http://127.0.0.1:4000/graphql';
  const origin = new URL(graphql).origin;
  return origin;
}
 
/**
 * Fetch base64 content for a GraphQL-backed document by id.
 * Backend endpoint: GET /documents/content?id=
 */
export async function getDocumentContent(id: string, signal?: AbortSignal): Promise<DocumentContent> {
  if (!id) throw new Error('id is required');
  const url = new URL('/documents/content', getBaseUrl());
  url.searchParams.set('id', id);
  const res = await fetch(url.toString(), {
    method: 'GET',
    credentials: 'same-origin',
    signal,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Get document content failed (${res.status}): ${text || res.statusText}`);
  }
  return (await res.json()) as DocumentContent;
}

/**
 * Fetch base64 content for an archived document by id.
 * Backend endpoint: GET /documents/contentArchived?id=
 */
export async function getArchivedDocumentContent(id: string, signal?: AbortSignal): Promise<DocumentContent> {
  if (!id) throw new Error('id is required');
  const url = new URL('/documents/contentArchived', getBaseUrl());
  url.searchParams.set('id', id);
  const res = await fetch(url.toString(), {
    method: 'GET',
    credentials: 'same-origin',
    signal,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Get archived document content failed (${res.status}): ${text || res.statusText}`);
  }
  return (await res.json()) as DocumentContent;
}
 
/**
 * Helper to open a preview in a new tab/window.
 * Returns true if opened, false if failed.
 */
export async function previewDocumentInNewTab(id: string): Promise<boolean> {
  try {
    const doc = await getDocumentContent(id);
    const w = window.open(doc.contentBase64, '_blank', 'noopener,noreferrer');
    return !!w;
  } catch {
    return false;
  }
}
 
/**
 * Convert uploadedAt value from API (might be an ISO string or a millisecond epoch number as string)
 * into a human readable local date-time string.
 */
export function formatUploadedAt(uploadedAt?: string | null): string {
  if (!uploadedAt) return '';
  // If numeric string, parse as epoch ms
  if (/^\d+$/.test(uploadedAt)) {
    const n = Number(uploadedAt);
    if (Number.isFinite(n)) {
      const d = new Date(n);
      if (!Number.isNaN(d.getTime())) return d.toLocaleString();
    }
  }
  // Fallback: try native Date parsing
  const d = new Date(uploadedAt as string);
  if (!Number.isNaN(d.getTime())) return d.toLocaleString();
  return '';
}