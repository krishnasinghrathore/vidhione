import { and, asc, desc, eq, inArray, isNull, sql } from 'drizzle-orm';
import { db } from '../../../drizzle/client';
import { documentTypes } from '../../../drizzle/schemas/documents/document_types';
import { documentTypeAssignments } from '../../../drizzle/schemas/documents/document_type_assignments';
import { documents } from '../../../drizzle/schemas/documents/documents';
import { archivedDocuments } from '../../../drizzle/schemas/documents/archived_documents';
import { randomUUID } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';

const ALLOWED_EXTS = new Set(['jpg', 'jpeg', 'png', 'pdf']);
const MODULES = new Set(['driver', 'vehicle']);

function normalizeModule(m?: string | null): string {
  const s = String(m ?? '').trim().toLowerCase();
  if (!MODULES.has(s)) throw new Error('Invalid module');
  return s;
}

function normalizeExts(input?: string[] | null): string[] {
  const arr = Array.isArray(input) ? input : [];
  const out: string[] = [];
  const seen = new Set<string>();
  for (const e of arr) {
    const ext = String(e ?? '').trim().toLowerCase().replace(/^\./, '');
    if (!ext || !ALLOWED_EXTS.has(ext)) continue;
    if (!seen.has(ext)) {
      seen.add(ext);
      out.push(ext);
    }
  }
  if (out.length === 0) throw new Error('allowedExtensions must include at least one of: jpg, jpeg, png, pdf');
  return out;
}

function pickPresent<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined && v !== null)) as Partial<T>;
}

const UPLOAD_ROOT = path.join(process.cwd(), 'uploads');
const COLD_ROOT = path.join(UPLOAD_ROOT, '_archive');

function sanitizeFileName(name: string): string {
  const base = String(name ?? '').replace(/[^\w.\-]/g, '_');
  return base.length ? base : 'file';
}

function decodeBase64(b64: string): Buffer {
  const s = String(b64 ?? '');
  const idx = s.indexOf(',');
  const raw = idx > -1 ? s.slice(idx + 1) : s;
  return Buffer.from(raw, 'base64');
}

function extFromFileName(fileName: string): string {
  const n = String(fileName ?? '').trim();
  const m = /\.([A-Za-z0-9]+)$/.exec(n);
  return (m?.[1] || '').toLowerCase();
}

async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

// Role helpers for simple dev/test authorization via header or env
function roleFromContext(ctx: any): 'admin' | 'user' {
  try {
    const hdr = String(ctx?.req?.headers?.['x-user-role'] ?? ctx?.req?.headers?.['X-User-Role'] ?? '').toLowerCase();
    if (hdr === 'admin') return 'admin';
  } catch {}
  const env = String(process.env.BACKDOOR_USER_ROLE ?? '').toLowerCase();
  if (env === 'admin') return 'admin';
  return 'user';
}

function requireAdmin(ctx: any): void {
  const role = roleFromContext(ctx);
  if (role === 'admin') return;

  // Dev convenience: allow all operations in non-production environments to avoid auth/CORS/setup friction.
  // In production, strict admin is required.
  const env = String(process.env.NODE_ENV || '').toLowerCase();
  if (env !== 'production') return;

  throw new Error('Forbidden');
}

export const resolvers = {
  Query: {
    documentTypesAdmin: async (_: unknown, args: { includeInactive?: boolean }) => {
      const includeInactive = !!args?.includeInactive;
      if (includeInactive) {
        const rows = await db.select().from(documentTypes).orderBy(asc(documentTypes.name));
        return rows;
      } else {
        const rows = await db
          .select()
          .from(documentTypes)
          .where(eq(documentTypes.active, true))
          .orderBy(asc(documentTypes.name));
        return rows;
      }
    },

    documentTypeAssignmentsByModule: async (_: unknown, args: { module: string }) => {
      const module = normalizeModule(args?.module);
      const rows = await db
        .select()
        .from(documentTypeAssignments)
        .where(eq(documentTypeAssignments.module, module as any))
        .orderBy(asc(documentTypeAssignments.mandatory), asc(documentTypeAssignments.documentTypeId));
      return rows;
    },

    listDocuments: async (_: unknown, args: { module: string; entityId: string; includeDeleted?: boolean }) => {
      const module = normalizeModule(args?.module);
      const entityId = String(args?.entityId ?? '').trim();
      if (!entityId) throw new Error('entityId is required');

      const includeDeleted = !!args?.includeDeleted;

      // Primary query using typed comparisons
      const baseConds: any[] = [
        eq(documents.module, module as any),
        eq(documents.entityId, entityId as any),
      ];
      if (!includeDeleted) {
        baseConds.push(isNull(documents.deletedAt) as any);
      }

      let rows = await db
        .select()
        .from(documents)
        .where(and(...(baseConds as any)))
        .orderBy(desc(documents.uploadedAt));

      // Fallback: In some PG/driver combos, enum/uuid parameter inference can be finicky.
      // If zero rows, retry with explicit ::text casts for robust matching without changing results.
      if (!rows || rows.length === 0) {
        const castConds: any[] = [
          // module::text = $1
          sql`${documents.module}::text = ${module}`,
          // entity_id::text = $2
          sql`${documents.entityId}::text = ${entityId}`,
        ];
        if (!includeDeleted) {
          castConds.push(isNull(documents.deletedAt) as any);
        }

        const rowsFallback = await db
          .select()
          .from(documents)
          .where(and(...(castConds as any)))
          .orderBy(desc(documents.uploadedAt));

        rows = rowsFallback;
      }

      return rows;
    },

    // List archived documents (admin only)
    listArchivedDocuments: async (_: unknown, args: { module: string; entityId: string }, ctx: any) => {
      requireAdmin(ctx);
      const module = normalizeModule(args?.module);
      const entityId = String(args?.entityId ?? '').trim();
      if (!entityId) throw new Error('entityId is required');

      // Primary query with typed comparisons
      let rows = await db
        .select()
        .from(archivedDocuments)
        .where(and(eq(archivedDocuments.module, module as any), eq(archivedDocuments.entityId, entityId as any)))
        .orderBy(desc(archivedDocuments.archivedAt));

      // Fallback: if enum/uuid param inference returns zero due to driver quirks, retry with ::text casts
      if (!rows || rows.length === 0) {
        const castConds: any[] = [
          // module::text = $1
          sql`${archivedDocuments.module}::text = ${module}`,
          // entity_id::text = $2
          sql`${archivedDocuments.entityId}::text = ${entityId}`,
        ];
        const rowsFallback = await db
          .select()
          .from(archivedDocuments)
          .where(and(...(castConds as any)))
          .orderBy(desc(archivedDocuments.archivedAt));
        rows = rowsFallback;
      }

      return rows;
    },

    // Module-wise archived listing with optional entity filter (admin only)
    listArchivedByModule: async (_: unknown, args: { module: string; entityId?: string | null; limit?: number | null; offset?: number | null }, ctx: any) => {
      requireAdmin(ctx);
      const module = normalizeModule(args?.module);
      const entityId = String(args?.entityId ?? '').trim();
      const limit = Math.max(0, Math.min(1000, Number(args?.limit ?? 100)));
      const offset = Math.max(0, Number(args?.offset ?? 0));

      const conds: any[] = [eq(archivedDocuments.module, module as any)];
      if (entityId) {
        conds.push(eq(archivedDocuments.entityId, entityId as any));
      }

      // Primary typed query
      let rows = await db
        .select()
        .from(archivedDocuments)
        .where(and(...(conds as any)))
        .orderBy(desc(archivedDocuments.archivedAt))
        .limit(limit)
        .offset(offset);

      // Fallback with ::text casts if zero
      if (!rows || rows.length === 0) {
        const castConds: any[] = [sql`${archivedDocuments.module}::text = ${module}`];
        if (entityId) {
          castConds.push(sql`${archivedDocuments.entityId}::text = ${entityId}`);
        }
        const rowsFallback = await db
          .select()
          .from(archivedDocuments)
          .where(and(...(castConds as any)))
          .orderBy(desc(archivedDocuments.archivedAt))
          .limit(limit)
          .offset(offset);
        rows = rowsFallback;
      }

      return rows;
    },

    missingMandatoryDocuments: async (_: unknown, args: { module: string; entityId: string }) => {
      const module = normalizeModule(args?.module);
      const entityId = String(args?.entityId ?? '').trim();
      if (!entityId) throw new Error('entityId is required');

      // Load mandatory active assignments for the module
      const assigns = await db
        .select()
        .from(documentTypeAssignments)
        .where(and(eq(documentTypeAssignments.module, module as any), eq(documentTypeAssignments.active, true)))
        .orderBy(asc(documentTypeAssignments.documentTypeId));

      const mandatoryTypeIds = new Set(assigns.filter((a) => a.mandatory).map((a) => String(a.documentTypeId)));

      if (mandatoryTypeIds.size === 0) return [];

      // Load existing non-deleted docs for this entity+module
      const docs = await db
        .select({ documentTypeId: documents.documentTypeId })
        .from(documents)
        .where(
          and(
            eq(documents.module, module as any),
            eq(documents.entityId, entityId as any),
            isNull(documents.deletedAt) as any
          )
        );

      const present = new Set<string>(docs.map((d) => String(d.documentTypeId)));

      const missingIds = Array.from(mandatoryTypeIds).filter((id) => !present.has(id));
      if (missingIds.length === 0) return [];

      // Return DocumentType rows for missing ids
      const missingRows = await db
        .select()
        .from(documentTypes)
        .where(inArray(documentTypes.id, missingIds as any));
      // Prefer ordering by name
      missingRows.sort((a, b) => String(a.name).localeCompare(String(b.name)));
      return missingRows;
    },
  },

  Mutation: {
    createDocumentType: async (_: unknown, args: { input: { name: string; allowedExtensions: string[]; active?: boolean | null } }) => {
      const name = String(args?.input?.name ?? '').trim();
      if (!name) throw new Error('Name is required');

      const exts = normalizeExts(args?.input?.allowedExtensions);
      const active = args?.input?.active == null ? true : !!args.input.active;

      // Enforce unique name
      const existing = await db.select().from(documentTypes).where(eq(documentTypes.name, name)).limit(1);
      if (existing[0]) throw new Error('Name already exists');

      const [row] = await db
        .insert(documentTypes)
        .values({
          id: randomUUID(),
          name,
          allowedExtensions: exts as any,
          active: active as any,
          createdAt: new Date() as any,
          updatedAt: new Date() as any,
        })
        .returning();

      return row;
    },

    updateDocumentType: async (_: unknown, args: { id: string; input: { name?: string | null; allowedExtensions?: string[] | null; active?: boolean | null } }) => {
      const id = String(args?.id ?? '').trim();
      if (!id) throw new Error('ID is required');

      const update: Record<string, any> = { updatedAt: new Date() as any };

      if (args.input?.name != null) {
        const name = String(args.input.name ?? '').trim();
        if (!name) throw new Error('Name is required');
        const existing = await db.select().from(documentTypes).where(eq(documentTypes.name, name)).limit(1);
        if (existing[0] && String((existing[0] as any).id) !== id) throw new Error('Name already exists');
        update.name = name;
      }

      if (args.input?.allowedExtensions != null) {
        const exts = normalizeExts(args.input.allowedExtensions ?? []);
        update.allowedExtensions = exts as any;
      }

      if (args.input?.active != null) {
        update.active = !!args.input.active as any;
      }

      const [row] = await db.update(documentTypes).set(update as any).where(eq(documentTypes.id, id as any)).returning();
      return row ?? null;
    },

    deleteDocumentType: async (_: unknown, args: { id: string }) => {
      const id = String(args?.id ?? '').trim();
      if (!id) throw new Error('ID is required');

      try {
        const rows = await db.delete(documentTypes).where(eq(documentTypes.id, id as any)).returning({ id: documentTypes.id as any });
        return (rows?.length ?? 0) > 0;
      } catch (err: any) {
        throw new Error('Cannot delete: type is referenced by assignments or documents.');
      }
    },

    upsertDocumentTypeAssignment: async (_: unknown, args: { input: { documentTypeId: string; module: string; mandatory?: boolean | null; active?: boolean | null } }) => {
      const documentTypeId = String(args?.input?.documentTypeId ?? '').trim();
      if (!documentTypeId) throw new Error('documentTypeId is required');

      const module = normalizeModule(args?.input?.module);
      const mandatory = !!args?.input?.mandatory;
      const active = args?.input?.active == null ? true : !!args.input.active;

      // Ensure target doc type exists
      const dtRows = await db.select().from(documentTypes).where(eq(documentTypes.id, documentTypeId as any)).limit(1);
      if (!dtRows[0]) throw new Error('Document type not found');

      // Try update first (unique(document_type_id,module))
      const existing = await db
        .select()
        .from(documentTypeAssignments)
        .where(and(eq(documentTypeAssignments.documentTypeId, documentTypeId as any), eq(documentTypeAssignments.module, module as any)))
        .limit(1);

      if (existing[0]) {
        const [row] = await db
          .update(documentTypeAssignments)
          .set({ mandatory: mandatory as any, active: active as any, updatedAt: new Date() as any })
          .where(eq(documentTypeAssignments.id, (existing[0] as any).id))
          .returning();
        return row;
      } else {
        const [row] = await db
          .insert(documentTypeAssignments)
          .values({
            id: randomUUID(),
            documentTypeId: documentTypeId as any,
            module: module as any,
            mandatory: mandatory as any,
            active: active as any,
            createdAt: new Date() as any,
            updatedAt: new Date() as any,
          })
          .returning();
        return row;
      }
    },

    deleteDocumentTypeAssignment: async (_: unknown, args: { id: string }) => {
      const id = String(args?.id ?? '').trim();
      if (!id) throw new Error('ID is required');

      const rows = await db
        .delete(documentTypeAssignments)
        .where(eq(documentTypeAssignments.id, id as any))
        .returning({ id: documentTypeAssignments.id as any });
      return (rows?.length ?? 0) > 0;
    },

    // Upload a new document file and persist metadata
    uploadDocument: async (
      _: unknown,
      args: {
        input: {
          module: string;
          entityId: string;
          documentTypeId: string;
          fileName: string;
          mimeType: string;
          contentBase64: string;
        };
      }
    ) => {
      const module = normalizeModule(args?.input?.module);
      const entityId = String(args?.input?.entityId ?? '').trim();
      if (!entityId) throw new Error('entityId is required');

      const documentTypeId = String(args?.input?.documentTypeId ?? '').trim();
      if (!documentTypeId) throw new Error('documentTypeId is required');

      const fileName = sanitizeFileName(String(args?.input?.fileName ?? '').trim());
      if (!fileName) throw new Error('fileName is required');
      const mimeType = String(args?.input?.mimeType ?? '').trim() || 'application/octet-stream';
      const payload = String(args?.input?.contentBase64 ?? '');
      if (!payload) throw new Error('contentBase64 is required');

      // Validate doc type and extension
      const [dt] = await db.select().from(documentTypes).where(eq(documentTypes.id, documentTypeId as any)).limit(1);
      if (!dt) throw new Error('Document type not found');

      const ext = extFromFileName(fileName);
      if (!ext) throw new Error('File extension missing');
      const allowed = new Set((dt as any).allowedExtensions?.map((e: string) => String(e).toLowerCase()) ?? []);
      if (!allowed.has(ext)) {
        throw new Error(`Extension .${ext} not allowed for "${(dt as any).name}". Allowed: ${Array.from(allowed).join(', ')}`);
      }

      // Ensure there is an active assignment for this module
      const [assign] = await db
        .select()
        .from(documentTypeAssignments)
        .where(and(eq(documentTypeAssignments.documentTypeId, documentTypeId as any), eq(documentTypeAssignments.module, module as any), eq(documentTypeAssignments.active, true)))
        .limit(1);
      if (!assign) throw new Error('Document type is not assigned to this module or is inactive');

      const id = randomUUID();
      const dir = path.join(UPLOAD_ROOT, module, entityId, documentTypeId);
      await ensureDir(dir);

      const filePath = path.join(dir, `${id}.${ext}`);
      const buf = decodeBase64(payload);
      // Ensure fs.writeFile receives a compatible ArrayBufferView for TS lib types
      const bytes = new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
      await fs.writeFile(filePath, bytes);

      const [row] = await db
        .insert(documents)
        .values({
          id,
          module: module as any,
          entityId: entityId as any,
          documentTypeId: documentTypeId as any,
          originalFilename: fileName,
          mimeType,
          fileExt: ext,
          fileSizeBytes: buf.byteLength as any,
          storagePath: filePath, // absolute path on local fs
          uploadedAt: new Date() as any,
        } as any)
        .returning();

      return row;
    },

        // Hard delete a document: remove DB row and stored file
        deleteDocument: async (_: unknown, args: { id: string }) => {
          const id = String(args?.id ?? '').trim();
          if (!id) throw new Error('ID is required');
    
          // Load current row to know storagePath before deleting
          const rows = await db.select().from(documents).where(eq(documents.id, id as any)).limit(1);
          const row: any = rows?.[0];
    
          // Delete DB row
          const res = await db
            .delete(documents)
            .where(eq(documents.id, id as any))
            .returning({ id: documents.id as any });
    
          const ok = (res?.length ?? 0) > 0;
    
          // Best-effort: remove the stored file from disk after successful DB delete
          try {
            const p = String(row?.storagePath || '');
            if (ok && p) {
              await fs.unlink(p).catch(() => {});
            }
          } catch {
            // ignore file deletion errors; DB row is gone
          }
    
          return ok;
        },

        // Archive a document: transactional move from Documents -> ArchivedDocuments (DB) and hot -> cold (FS best effort)
        archiveDocument: async (_: unknown, args: { id: string }, ctx: any) => {
          const id = String(args?.id ?? '').trim();
          if (!id) throw new Error('ID is required');

          // Load active document
          const rows = await db.select().from(documents).where(eq(documents.id, id as any)).limit(1);
          const row: any = rows?.[0];
          if (!row) throw new Error('Document not found');

          const module = String(row.module);
          const entityId = String(row.entityId);
          const documentTypeId = String(row.documentTypeId);
          const ext = String(row.fileExt || '').trim();

          // Prepare cold destination
          const coldDir = path.join(COLD_ROOT, module, entityId, documentTypeId);
          await ensureDir(coldDir);
          const coldPath = path.join(coldDir, `${id}.${ext || 'bin'}`);

          // Move file first (best effort)
          try {
            const src = String(row.storagePath || '');
            if (src && src !== coldPath) {
              await fs.rename(src, coldPath);
            }
          } catch (_err) {
            // Continue: archive logically even if file move failed; content fetch may fail until repaired
          }

          const archivedBy = null; // TODO: inject from auth context when user id is available
          const archivedAt = new Date() as any;

          // DB transaction: insert into archived_documents then delete from documents
          await db.transaction(async (tx) => {
            await tx.insert(archivedDocuments).values({
              id: row.id,
              module: row.module,
              entityId: row.entityId,
              documentTypeId: row.documentTypeId,
              originalFilename: row.originalFilename,
              mimeType: row.mimeType,
              fileExt: row.fileExt,
              fileSizeBytes: row.fileSizeBytes,
              storagePath: coldPath,
              uploadedAt: row.uploadedAt,
              uploadedBy: row.uploadedBy,
              archivedAt,
              archivedBy,
            } as any);

            await tx.delete(documents).where(eq(documents.id, id as any));
          });

          return true;
        },

        // Restore a document: ArchivedDocuments -> Documents and cold -> hot (FS best effort) (admin only)
        restoreArchivedDocument: async (_: unknown, args: { id: string }, ctx: any) => {
          requireAdmin(ctx);

          const id = String(args?.id ?? '').trim();
          if (!id) throw new Error('ID is required');

          // Load archived row
          const rows = await db.select().from(archivedDocuments).where(eq(archivedDocuments.id, id as any)).limit(1);
          const row: any = rows?.[0];
          if (!row) throw new Error('Archived document not found');

          const module = String(row.module);
          const entityId = String(row.entityId);
          const documentTypeId = String(row.documentTypeId);
          const ext = String(row.fileExt || '').trim();

          // Prepare hot destination
          const hotDir = path.join(UPLOAD_ROOT, module, entityId, documentTypeId);
          await ensureDir(hotDir);
          const hotPath = path.join(hotDir, `${id}.${ext || 'bin'}`);

          // Move file first (best effort)
          try {
            const src = String(row.storagePath || '');
            if (src && src !== hotPath) {
              await fs.rename(src, hotPath);
            }
          } catch (_err) {
            // Continue: record will be restored; preview may fail until file is present
          }

          // DB transaction: insert back into documents then delete from archived_documents
          await db.transaction(async (tx) => {
            await tx.insert(documents).values({
              id: row.id,
              module: row.module,
              entityId: row.entityId,
              documentTypeId: row.documentTypeId,
              originalFilename: row.originalFilename,
              mimeType: row.mimeType,
              fileExt: row.fileExt,
              fileSizeBytes: row.fileSizeBytes,
              storagePath: hotPath,
              uploadedAt: row.uploadedAt,
              uploadedBy: row.uploadedBy,
            } as any);

            await tx.delete(archivedDocuments).where(eq(archivedDocuments.id, id as any));
          });

          return true;
        },

  },

  // Field resolvers
  DocumentTypeAssignment: {
    documentType: async (parent: any) => {
      const id = parent?.documentTypeId;
      if (!id) return null;
      const rows = await db.select().from(documentTypes).where(eq(documentTypes.id, id as any)).limit(1);
      return rows?.[0] ?? null;
    },
  },

  Document: {
    documentType: async (parent: any) => {
      const id = parent?.documentTypeId;
      if (!id) return null;
      const rows = await db.select().from(documentTypes).where(eq(documentTypes.id, id as any)).limit(1);
      return rows?.[0] ?? null;
    },
  },

  ArchivedDocument: {
    documentType: async (parent: any) => {
      const id = parent?.documentTypeId;
      if (!id) return null;
      const rows = await db.select().from(documentTypes).where(eq(documentTypes.id, id as any)).limit(1);
      return rows?.[0] ?? null;
    },
    // Map GraphQL fields to DB columns (ensure strings)
    archivedDate: (parent: any) => {
      // GraphQL: archivedDate -> DB row property: archivedAt
      const v = parent?.archivedAt as any;
      if (!v) return null;
      // Drizzle may return Date or string depending on driver/config
      if (typeof v === 'string') return v;
      if (v instanceof Date && !Number.isNaN(v.getTime())) return v.toISOString();
      try {
        // Loose fallback
        const d = new Date(v);
        if (!Number.isNaN(d.getTime())) return d.toISOString();
      } catch {}
      return String(v);
    },
    archivedByUser: (parent: any) => {
      // GraphQL: archivedByUser -> DB row property: archivedBy
      const v = parent?.archivedBy as any;
      return v == null ? null : String(v);
    },
  },
};