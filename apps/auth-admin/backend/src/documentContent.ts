import { api } from 'encore.dev/api';
import { promises as fs } from 'node:fs';
import { db } from './drizzle/client';
import { documents } from './drizzle/schemas/documents/documents';
import { archivedDocuments } from './drizzle/schemas/documents/archived_documents';
import { and, eq, sql } from 'drizzle-orm';

export interface DocContentRequest {
  id: string;
}

export interface DocContentResponse {
  id: string;
  fileName: string;
  mimeType: string;
  contentBase64: string; // data URL
}

function isUuid(s: string): boolean {
  return typeof s === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
}

/**
 * GET /documents/content?id=
 * Returns a base64 data URL of the stored document file to enable browser preview/download.
 * Note: Files are read from local disk using the storagePath persisted at upload time.
 */
export const getDocumentContent = api<DocContentRequest, DocContentResponse>(
  { path: '/documents/content', method: 'GET', expose: true },
  async (req): Promise<DocContentResponse> => {
    if (!req?.id) throw new Error('id is required');
    if (!isUuid(req.id)) throw new Error('invalid id');

    const rows = await db
      .select()
      .from(documents)
      .where(eq(documents.id, req.id as any))
      .limit(1);

    const row: any = rows?.[0];
    if (!row) throw new Error('Document not found');

    const storagePath: string = row.storagePath || '';
    if (!storagePath) throw new Error('Document storage path missing');

    const buf = await fs.readFile(storagePath);
    const base64 = buf.toString('base64');
    const mime = String(row.mimeType || 'application/octet-stream');
    const dataUrl = `data:${mime};base64,${base64}`;

    return {
      id: String(row.id),
      fileName: String(row.originalFilename || 'document'),
      mimeType: mime,
      contentBase64: dataUrl,
    };
  }
);

// Archived content endpoint (read from cold storage table)
export const getArchivedDocumentContent = api<DocContentRequest, DocContentResponse>(
  { path: '/documents/contentArchived', method: 'GET', expose: true },
  async (req): Promise<DocContentResponse> => {
    if (!req?.id) throw new Error('id is required');
    if (!isUuid(req.id)) throw new Error('invalid id');

    const rows = await db
      .select()
      .from(archivedDocuments)
      .where(eq(archivedDocuments.id, req.id as any))
      .limit(1);

    const row: any = rows?.[0];
    if (!row) throw new Error('Archived document not found');

    const storagePath: string = row.storagePath || '';
    if (!storagePath) throw new Error('Archived document storage path missing');

    const buf = await fs.readFile(storagePath);
    const base64 = buf.toString('base64');
    const mime = String(row.mimeType || 'application/octet-stream');
    const dataUrl = `data:${mime};base64,${base64}`;

    return {
      id: String(row.id),
      fileName: String(row.originalFilename || 'document'),
      mimeType: mime,
      contentBase64: dataUrl,
    };
  }
);