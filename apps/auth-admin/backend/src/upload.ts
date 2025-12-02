import { api } from 'encore.dev/api';
import { randomUUID } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { db } from './drizzle/client';
import { attachments } from './drizzle/schemas/attachments';
import { and, desc, eq } from 'drizzle-orm';

/**
 * Simple JSON upload endpoint (demo-quality) to persist small files to local disk
 * and create an attachments row pointing to the stored file. Designed for frontend
 * base64 uploads without requiring multipart parsing or extra dependencies.
 *
 * POST /upload
 * {
 *   "ownerType": "driver" | "vehicle" | "work_order" | "maintenance_record",
 *   "ownerId": "UUID-of-owner",
 *   "docType": "<attachment_doc_type enum value>",
 *   "fileName": "document.pdf",
 *   "contentType": "application/pdf",
 *   "contentBase64": "..."  // base64-encoded file payload
 * }
 *
 * Response:
 * {
 *   "attachmentId": "uuid",
 *   "storageUrl": "file://...absolute-path",
 *   "sizeBytes": 12345
 * }
 */

type UploadRequest = {
  ownerType: 'vehicle' | 'driver' | 'work_order' | 'maintenance_record';
  ownerId: string;
  docType?:
    | 'title_document'
    | 'registration_document'
    | 'inspection_document'
    | 'drivers_license_front'
    | 'drivers_license_back'
    | 'medical_card'
    | 'twic_card'
    | 'i9_form'
    | 'work_order_attachment'
    | 'maintenance_record_attachment'
    | 'other';
  fileName: string;
  contentType?: string;
  contentBase64: string; // base64 payload (no data: prefix)
};

type UploadResponse = {
  attachmentId: string;
  storageUrl: string;
  sizeBytes: number;
};

export interface AttachmentListItem {
  id: string;
  ownerType: 'vehicle' | 'driver' | 'work_order' | 'maintenance_record';
  ownerId: string;
  docType?: string | null;
  fileName: string;
  contentType?: string | null;
  storageUrl: string;
  sizeBytes?: number | null;
  createdAt?: string | null;
}

export interface AttachmentListResponse {
  items: AttachmentListItem[];
}

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

function sanitizeFileName(name: string): string {
  // Keep only simple chars to avoid path traversal or special chars
  const base = name.replace(/[^\w.\-]/g, '_');
  return base.length ? base : 'file';
}

function decodeBase64(b64: string): Buffer {
  // strip data URL prefix if provided
  const idx = b64.indexOf(',');
  const raw = idx > -1 ? b64.slice(idx + 1) : b64;
  return Buffer.from(raw, 'base64');
}

// UUID validator (guards REST endpoints from DB cast errors)
function isUuid(s: string): boolean {
  return typeof s === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
}

export const upload = api<UploadRequest, UploadResponse>(
  { path: '/upload', method: 'POST', expose: true },
  async (req): Promise<UploadResponse> => {
    // Basic validation
    if (!req || !req.ownerId || !req.ownerType || !req.fileName || !req.contentBase64) {
      throw new Error('Invalid request: missing ownerId, ownerType, fileName or contentBase64');
    }

    // Prepare disk storage
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    const id = randomUUID();
    const safeName = sanitizeFileName(req.fileName);
    const filePath = path.join(UPLOAD_DIR, `${id}-${safeName}`);
    const buf = decodeBase64(req.contentBase64);
    // Ensure a Uint8Array for fs.writeFile type compatibility across TS lib configs
    const bytes = new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
    await fs.writeFile(filePath, bytes);
    const storageUrl = `file://${filePath}`;
    const sizeBytes = bytes.byteLength;

    // Persist attachment row
    const [row] = await db
      .insert(attachments)
      .values({
        id,
        ownerType: req.ownerType as any,
        ownerId: req.ownerId,
        docType: (req.docType as any) ?? 'other',
        fileName: safeName,
        contentType: req.contentType ?? undefined,
        storageUrl,
        sizeBytes,
      })
      .returning();

    return {
      attachmentId: row.id,
      storageUrl: row.storageUrl,
      sizeBytes: row.sizeBytes ?? sizeBytes,
    };
  }
);

// GET /attachments?ownerType=&ownerId=
export interface ListRequest {
  ownerType: 'vehicle' | 'driver' | 'work_order' | 'maintenance_record';
  ownerId: string;
}

export const listAttachments = api<ListRequest, AttachmentListResponse>(
  { path: '/attachments', method: 'GET', expose: true },
  async (req): Promise<AttachmentListResponse> => {
    if (!req?.ownerId || !req?.ownerType) throw new Error('ownerId and ownerType are required');

    // Owner ID column is UUID in the DB. If a non-UUID (e.g. "D-0001") is provided,
    // avoid querying to prevent "invalid input syntax for type uuid" and return empty.
    if (!isUuid(req.ownerId)) {
      return { items: [] };
    }

    const rows = await db
      .select()
      .from(attachments)
      .where(and(eq(attachments.ownerId, req.ownerId), eq(attachments.ownerType, req.ownerType as any)))
      .orderBy(desc(attachments.createdAt));

    return {
      items: rows.map((r: any) => ({
        id: r.id,
        ownerType: r.ownerType,
        ownerId: r.ownerId,
        docType: r.docType,
        fileName: r.fileName,
        contentType: r.contentType,
        storageUrl: r.storageUrl,
        sizeBytes: r.sizeBytes,
        createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : null,
      })),
    };
  }
);

// DELETE /attachments?id=
export interface DeleteRequest {
  id: string;
}
export interface DeleteResponse {
  deleted: boolean;
}

export const deleteAttachment = api<DeleteRequest, DeleteResponse>(
  { path: '/attachments', method: 'DELETE', expose: true },
  async (req): Promise<DeleteResponse> => {
    if (!req?.id) throw new Error('id is required');

    // Try to load row to delete file from disk as well
    const rows = await db.select().from(attachments).where(eq(attachments.id, req.id)).limit(1);
    const row: any = rows[0];

    // Delete DB row
    const res = await db.delete(attachments).where(eq(attachments.id, req.id)).returning({ id: attachments.id });

    // Best-effort: remove stored file if present and on disk
    try {
      const fileUrl: string | undefined = row?.storageUrl;
      if (fileUrl && fileUrl.startsWith('file://')) {
        const filePath = fileUrl.replace(/^file:\/\//, '');
        await fs.unlink(filePath).catch(() => {});
      }
    } catch {
      // ignore file deletion errors in demo
    }

    return { deleted: (res?.length ?? 0) > 0 };
  }
);

// GET /attachments/content?id=
export interface ContentRequest {
  id: string;
}
export interface ContentResponse {
  id: string;
  fileName: string;
  contentType?: string | null;
  contentBase64: string; // data URL format to allow direct <img src="">
}

export const getAttachmentContent = api<ContentRequest, ContentResponse>(
  { path: '/attachments/content', method: 'GET', expose: true },
  async (req): Promise<ContentResponse> => {
    if (!req?.id) throw new Error('id is required');
    const rows = await db.select().from(attachments).where(eq(attachments.id, req.id)).limit(1);
    const row: any = rows[0];
    if (!row) throw new Error('Attachment not found');
    const fileUrl: string = row.storageUrl || '';
    if (!fileUrl.startsWith('file://')) throw new Error('Invalid storage URL');
    const filePath = fileUrl.replace(/^file:\/\//, '');
    const buff = await fs.readFile(filePath);
    const base64 = buff.toString('base64');
    const dataUrl = `data:${row.contentType || 'application/octet-stream'};base64,${base64}`;
    return {
      id: row.id,
      fileName: row.fileName,
      contentType: row.contentType,
      contentBase64: dataUrl,
    };
  }
);
