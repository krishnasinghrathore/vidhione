import React, { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState, forwardRef } from 'react';
import { gql } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { FileUpload } from 'primereact/fileupload';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { Menu } from 'primereact/menu';
import { useSystemConfig } from '../../lib/systemConfig';
import { useParams } from 'react-router-dom';
import { getDocumentContent, getArchivedDocumentContent, formatUploadedAt } from '../../lib/documents';

type ModuleType = 'driver' | 'vehicle';

type Assignment = {
  id: string;
  documentTypeId: string;
  module: ModuleType;
  mandatory: boolean;
  active: boolean;
  documentType?: {
    id: string;
    name: string;
    allowedExtensions: string[];
    active: boolean;
  } | null;
};

type DocRow = {
  id: string;
  module: ModuleType;
  entityId: string;
  documentTypeId: string;
  originalFilename: string;
  mimeType: string;
  fileExt: string;
  fileSizeBytes: number;
  uploadedAt: string;
  deletedAt?: string | null;
  documentType?: {
    id: string;
    name: string;
    allowedExtensions: string[];
    active: boolean;
  } | null;
};

export type DocumentUploaderHandle = {
  // Commit staged changes (uploads + deletes). entityIdOverride is required when props.entityId is not set (create flow).
  commit: (entityIdOverride?: string) => Promise<void>;
  // Clear all staged changes (useful on cancel/reset).
  reset: () => void;
};

type Props = {
  module: ModuleType;
  entityId?: string; // if undefined (create flow), staging still works; commit() must be called with the new id after save.
  onValidityChange?: (ok: boolean, missingNames: string[]) => void;
  maxUploadSizeMB?: number;
  // When true, allow Save even if mandatory docs would be missing due to "Mark for Removal"
  // (useful to let user commit deletions without staging a replacement).
  allowDeleteWithoutReplacement?: boolean;
  // Notify parent when uploader has pending changes (staged uploads or pending deletes)
  onDirtyChange?: (dirty: boolean) => void;
  // Show an internal "Documents" header inside the component; default is false to avoid duplicate titles
  showHeader?: boolean;
  // When true, display the "Missing mandatory document(s)" banner inside this component.
  // Leave false (default) when the parent form renders its own banner to avoid duplicates.
  showMissingBanner?: boolean;
};

const ASSIGN_LIST = gql`
  query AssignmentsByModule($module: String!) {
    documentTypeAssignmentsByModule(module: $module) {
      id
      documentTypeId
      module
      mandatory
      active
      documentType {
        id
        name
        allowedExtensions
        active
      }
    }
  }
`;

const LIST_DOCS = gql`
  query ListDocuments($module: String!, $entityId: ID!, $includeDeleted: Boolean!) {
    listDocuments(module: $module, entityId: $entityId, includeDeleted: $includeDeleted) {
      id
      module
      entityId
      documentTypeId
      originalFilename
      mimeType
      fileExt
      fileSizeBytes
      uploadedAt
      deletedAt
      documentType {
        id
        name
        allowedExtensions
        active
      }
    }
  }
`;

const UPLOAD_DOCUMENT = gql`
  mutation UploadDocument($input: UploadDocumentInput!) {
    uploadDocument(input: $input) {
      id
      module
      entityId
      documentTypeId
      originalFilename
      mimeType
      fileExt
      fileSizeBytes
      uploadedAt
      documentType {
        id
        name
        allowedExtensions
        active
      }
    }
  }
`;

const DELETE_DOCUMENT = gql`
  mutation DeleteDocument($id: ID!) {
    deleteDocument(id: $id)
  }
`;

const ARCHIVE_DOCUMENT = gql`
  mutation ArchiveDocument($id: ID!) {
    archiveDocument(id: $id)
  }
`;

const LIST_ARCHIVED_DOCS = gql`
  query ListArchivedDocuments($module: String!, $entityId: ID!) {
    listArchivedDocuments(module: $module, entityId: $entityId) {
      id
      module
      entityId
      documentTypeId
      originalFilename
      mimeType
      fileExt
      fileSizeBytes
      storagePath
      uploadedAt
      archivedDate
      archivedByUser
      documentType {
        id
        name
        allowedExtensions
        active
      }
    }
  }
`;

const RESTORE_ARCHIVED = gql`
  mutation RestoreArchivedDocument($id: ID!) {
    restoreArchivedDocument(id: $id)
  }
`;


function formatBytes(bytes?: number | null): string {
  if (bytes == null || Number.isNaN(bytes as any)) return '';
  const b = Number(bytes);
  if (b < 1024) return `${b} B`;
  const kb = b / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  const gb = mb / 1024;
  return `${gb.toFixed(2)} GB`;
}

function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onerror = () => reject(new Error('Failed to read file'));
    fr.onload = () => resolve(String(fr.result || ''));
    fr.readAsDataURL(file);
  });
}

function getExtFromName(name: string): string {
  const m = /\.([A-Za-z0-9]+)$/.exec(name || '');
  return (m?.[1] || '').toLowerCase();
}

// ForwardRef so parent can call commit() on Save
const DocumentUploader = forwardRef<DocumentUploaderHandle, Props>(function DocumentUploader(props, ref) {
  const { module, entityId: propEntityId, onValidityChange, allowDeleteWithoutReplacement, onDirtyChange } = props;
  const headerVisible = props.showHeader ?? false;
  const toast = useRef<Toast>(null);
  const { maxUploadSizeMB: cfgMaxUploadSizeMB } = useSystemConfig();
  // Keep a ref to each FileUpload instance to reset its input after staging
  const uploadRefs = useRef<Record<string, any>>({});
  const actionMenuRefs = useRef<Record<string, any>>({});

  // Fallback to route param id when entityId prop is not provided (ensures edit screens always load)
  const params = useParams<{ id?: string }>();
  const entityKey = useMemo(() => {
    return (propEntityId ?? params.id) || undefined;
  }, [propEntityId, params.id]);

  // Admin detection:
  // - From frontend env: VITE_USER_ROLE=admin or VITE_ADMIN_MODE=true/1
  // - Or from localStorage: userRole=admin (dev/testing)
  const isAdmin = useMemo(() => {
    try {
      const envRole = String((import.meta as any).env?.VITE_USER_ROLE || '').toLowerCase();
      const envFlag = String((import.meta as any).env?.VITE_ADMIN_MODE || '').toLowerCase();
      if (envRole === 'admin' || envFlag === 'true' || envFlag === '1') return true;
      const v = (localStorage.getItem('userRole') || '').toLowerCase();
      return v === 'admin';
    } catch {
      return false;
    }
  }, []);

  // Server data: assignments (always) and existing docs (only when entityId is present)
  const { data: assignData, loading: assignLoading, error: assignError, refetch: refetchAssign } = useQuery<{ documentTypeAssignmentsByModule: Assignment[] }>(ASSIGN_LIST, {
    variables: { module },
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
    context: { suppressGlobalError: true }
  });

  const includeDeleted = false;
  const { data: docsData, loading: docsLoading, error: docsError, refetch: refetchDocs } = useQuery<{ listDocuments: DocRow[] }>(LIST_DOCS, {
    variables: { module, entityId: entityKey || '', includeDeleted },
    skip: !entityKey,
    fetchPolicy: 'network-only',
    errorPolicy: 'all',
    context: { suppressGlobalError: true }
  });

  // Archived documents (admin-only; backend enforces role). If forbidden, we just ignore the error/UI silently.
  type ArchivedRow = {
    id: string;
    module: ModuleType;
    entityId: string;
    documentTypeId: string;
    originalFilename: string;
    mimeType: string;
    fileExt: string;
    fileSizeBytes: number;
    storagePath: string;
    uploadedAt: string;
    archivedDate: string | null;
    archivedByUser?: string | null;
    documentType?: { id: string; name: string; allowedExtensions: string[]; active: boolean } | null;
  };
  const { data: archivedData, loading: archivedLoading, error: archivedError, refetch: refetchArchived } = useQuery<{ listArchivedDocuments: ArchivedRow[] }>(
    LIST_ARCHIVED_DOCS,
    {
      variables: { module, entityId: entityKey || '' },
      // Query whenever entity exists; backend enforces admin. Errors are swallowed locally.
      skip: !entityKey,
      fetchPolicy: 'network-only',
      errorPolicy: 'ignore',
      // Do not send custom headers to avoid CORS preflight issues.
      // Backend uses BACKDOOR_USER_ROLE=admin for local admin mode.
      context: { suppressGlobalError: true }
    }
  );

  const [mutUpload, { loading: uploading }] = useMutation(UPLOAD_DOCUMENT);
  const [mutDelete] = useMutation(DELETE_DOCUMENT);
  const [mutArchive] = useMutation(ARCHIVE_DOCUMENT);
  const [mutRestore, { loading: restoring }] = useMutation(RESTORE_ARCHIVED);

  const assignments = useMemo<Assignment[]>(() => {
    const list = (assignData?.documentTypeAssignmentsByModule ?? []) as Assignment[];
    return list.filter((a: Assignment) => a.active && a.documentType && a.documentType.active);
  }, [assignData?.documentTypeAssignmentsByModule]);

  const docs = useMemo(() => docsData?.listDocuments ?? [], [docsData?.listDocuments]);
  const archivedDocs = useMemo(() => archivedData?.listArchivedDocuments ?? [], [archivedData?.listArchivedDocuments]);
 
  // DEBUG: Log queries/results to verify what's fetched on edit screens
  useEffect(() => {
    if (entityKey) {
      // eslint-disable-next-line no-console
      console.log('[DocumentUploader] listDocuments vars', { module, entityId: entityKey, includeDeleted });
      // eslint-disable-next-line no-console
      console.log('[DocumentUploader] listDocuments result', { count: docsData?.listDocuments?.length ?? 0, rows: docsData?.listDocuments });
    } else {
      // eslint-disable-next-line no-console
      console.log('[DocumentUploader] entityKey missing; skip listDocuments');
    }
    if (docsError) {
      // eslint-disable-next-line no-console
      console.error('[DocumentUploader] listDocuments error', docsError);
    }
  }, [entityKey, module, includeDeleted, docsData, docsError]);
 
  useEffect(() => {
    const assigns = assignData?.documentTypeAssignmentsByModule ?? [];
    // eslint-disable-next-line no-console
    console.log(
      '[DocumentUploader] assignments',
      assigns.map((a: Assignment) => ({
        id: a.documentTypeId,
        name: a.documentType?.name,
        mandatory: a.mandatory,
        active: a.active,
      }))
    );
    if (assignError) {
      // eslint-disable-next-line no-console
      console.error('[DocumentUploader] assignments error', assignError);
    }
  }, [assignData, assignError]);

  // Swallow archived query errors locally so global toasts don't show on edit screens
  useEffect(() => {
    if (archivedError) {
      // eslint-disable-next-line no-console
      console.warn('[DocumentUploader] listArchivedDocuments suppressed error:', archivedError);
    }
  }, [archivedError]);

  // DEBUG: Log archived results to verify what's fetched
  useEffect(() => {
    if (!entityKey) return;
    // eslint-disable-next-line no-console
    console.log('[DocumentUploader] listArchivedDocuments vars', { module, entityId: entityKey });
    // eslint-disable-next-line no-console
    console.log('[DocumentUploader] listArchivedDocuments result', {
      count: archivedData?.listArchivedDocuments?.length ?? 0,
      rows: archivedData?.listArchivedDocuments
    });
  }, [entityKey, module, archivedData]);
 
  // Staging state (not uploaded yet) by documentTypeId
  const [staged, setStaged] = useState<Record<string, File[]>>({});
  const [pendingDeletes, setPendingDeletes] = useState<Set<string>>(new Set()); // existing doc ids marked for removal (hard delete on save)
  const [pendingArchives, setPendingArchives] = useState<Set<string>>(new Set()); // existing doc ids marked for archive on save
  // Force-remount FileUpload per docType to reset caption after stage/remove
  const [uploadKeys, setUploadKeys] = useState<Record<string, number>>({});

  // Dirty state: true when there are staged uploads, pending deletions, or pending archives
  const dirty = useMemo(() => {
    if (pendingDeletes.size > 0) return true;
    if (pendingArchives.size > 0) return true;
    for (const arr of Object.values(staged)) {
      if ((arr?.length || 0) > 0) return true;
    }
    return false;
  }, [pendingDeletes, pendingArchives, staged]);

  useEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty, onDirtyChange]);

  // Inline preview dialog state for GraphQL documents
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState<string>('');
  const [previewType, setPreviewType] = useState<string | undefined>(undefined);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Archived modal state (per document type)
  const [archivedModalOpen, setArchivedModalOpen] = useState(false);
  const [archivedModalTypeId, setArchivedModalTypeId] = useState<string | null>(null);
  const [archivedModalTypeName, setArchivedModalTypeName] = useState<string>('');

  // Group existing docs by type (do NOT exclude pendingDeletes here, so we can show "Undo")
  const groupedDocs = useMemo(() => {
    const m = new Map<string, DocRow[]>();
    for (const d of docs) {
      const key = d.documentTypeId;
      const arr = m.get(key) || [];
      arr.push(d);
      m.set(key, arr);
    }
    return m;
  }, [docs]);

  // Group archived docs by documentTypeId
  const groupedArchived = useMemo(() => {
    const m = new Map<string, ArchivedRow[]>();
    for (const d of archivedDocs) {
      const key = d.documentTypeId;
      const arr = m.get(key) || [];
      arr.push(d);
      m.set(key, arr);
    }
    return m;
  }, [archivedDocs]);

 // Open archived modal for a specific assignment/type
 const openArchived = useCallback((a: Assignment) => {
   setArchivedModalTypeId(a.documentTypeId);
   setArchivedModalTypeName(a.documentType?.name || 'Archived');
   setArchivedModalOpen(true);
 }, []);

 // Items to show inside archived modal
 const archivedModalItems = useMemo(() => {
   const items = archivedModalTypeId ? (groupedArchived.get(archivedModalTypeId) || []) : [];
   // Show most recent first; fallback to uploadedAt if archivedDate is null
   return items.slice().sort((a, b) => {
     const ad = new Date(a.archivedDate || a.uploadedAt).getTime();
     const bd = new Date(b.archivedDate || b.uploadedAt).getTime();
     return bd - ad;
   });
 }, [archivedModalTypeId, groupedArchived]);

  // Docs that don't match current active assignments (still show them as "Other uploaded")
  const assignedTypeIdSet = useMemo(() => new Set(assignments.map((a: Assignment) => a.documentTypeId)), [assignments]);
  const unmatchedDocs = useMemo(() => (docs || []).filter((d: DocRow) => !assignedTypeIdSet.has(d.documentTypeId)), [docs, assignedTypeIdSet]);

  // Derived: missing mandatory (consider existing docs minus pendingDeletes/pendingArchives, plus staged)
  const missingNames = useMemo(() => {
    const present = new Set<string>();
    // existing GraphQL docs present (count only those NOT marked for deletion/archive)
    groupedDocs.forEach((arr, dtId) => {
      const hasActive = arr.some((doc) => !pendingDeletes.has(doc.id) && !pendingArchives.has(doc.id));
      if (hasActive) present.add(dtId);
    });
    // staged present
    for (const [dtId, arr] of Object.entries(staged)) {
      if ((arr?.length || 0) > 0) present.add(dtId);
    }

    const missing: string[] = [];
    for (const a of assignments) {
      if (a.mandatory && !present.has(a.documentTypeId)) {
        const name = a.documentType?.name || a.documentTypeId;
        missing.push(name);
      }
    }
    // Sort for stable output
    missing.sort((a, b) => a.localeCompare(b));
    return missing;
  }, [assignments, groupedDocs, staged, pendingDeletes, pendingArchives]);

  // Allow Save when the only reason for missing is that the user marked for removal (no replacement),
  // if allowDeleteWithoutReplacement is enabled.
  const canOverrideMissing = useMemo(() => {
    if (!allowDeleteWithoutReplacement) return false;
    if (missingNames.length === 0) return false;
    // Permit Save if any mandatory doc is marked for deletion or archive (lenient mode)
    return pendingDeletes.size > 0 || pendingArchives.size > 0;
  }, [allowDeleteWithoutReplacement, pendingDeletes.size, pendingArchives.size, missingNames.length]);

  useEffect(() => {
    const ok = (missingNames.length === 0) || canOverrideMissing;
    onValidityChange?.(ok, missingNames);
  }, [missingNames, canOverrideMissing]);

  const maxUploadSizeMB = useMemo(() => {
    // Prefer explicit prop, else take system config, else default 10 MB
    if (typeof props.maxUploadSizeMB === 'number' && props.maxUploadSizeMB > 0) return Math.floor(props.maxUploadSizeMB);
    const cfg = Number(cfgMaxUploadSizeMB);
    return Number.isFinite(cfg) && cfg > 0 ? Math.floor(cfg) : 10;
  }, [props.maxUploadSizeMB, cfgMaxUploadSizeMB]);

  const refreshAll = useCallback(async () => {
    const tasks: Promise<any>[] = [];
    tasks.push(refetchAssign());
    if (entityKey) tasks.push(refetchDocs());
    if (entityKey && refetchArchived) {
      // Guarded refetch that never throws to caller
      tasks.push(refetchArchived().catch((e: any) => {
        // eslint-disable-next-line no-console
        console.warn('[DocumentUploader] refetchArchived suppressed error:', e);
        return null;
      }));
    }
    await Promise.allSettled(tasks);
  }, [refetchAssign, refetchDocs, refetchArchived, entityKey]);
  
  // Ensure fresh documents when entering edit screen or when the entity changes
  useEffect(() => {
    if (entityKey) {
      void refetchDocs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityKey]);

  // Stage selection (no immediate upload)
  const stageFile = useCallback(
    (assignment: Assignment, file: File | null) => {
      if (!file) return;
      const dt = assignment.documentType!;
      const allowed = new Set((dt.allowedExtensions || []).map((e) => String(e).toLowerCase()));
      const ext = getExtFromName(file.name);
      if (!allowed.has(ext)) {
        toast.current?.show({
          severity: 'warn',
          summary: 'Invalid file type',
          detail: `.${ext} not allowed for "${dt.name}". Allowed: ${Array.from(allowed).join(', ')}`,
          life: 2500
        });
        return;
      }
      const sizeBytes = file.size;
      if (sizeBytes > maxUploadSizeMB * 1024 * 1024) {
        toast.current?.show({
          severity: 'warn',
          summary: 'File too large',
          detail: `Max ${maxUploadSizeMB} MB allowed. Selected: ${formatBytes(sizeBytes)}`,
          life: 2500
        });
        return;
      }
      setStaged((prev) => {
        const next: Record<string, File[]> = { ...prev };
        const list = next[assignment.documentTypeId] ? [...next[assignment.documentTypeId]] : [];
        list.push(file);
        next[assignment.documentTypeId] = list;
        return next;
      });
      // Reset the FileUpload control so the button caption returns to default after staging
      try {
        const comp = uploadRefs.current[assignment.documentTypeId];
        // PrimeReact FileUpload exposes clear() and getInput()
        comp?.clear?.();
        const inputEl = comp?.getInput?.();
        if (inputEl && typeof inputEl.value !== 'undefined') {
          inputEl.value = '';
        }
      } catch {
        // ignore UI reset errors
      }
      // Force remount to ensure caption is reset in all cases
      setUploadKeys((prev) => ({ ...prev, [assignment.documentTypeId]: (prev[assignment.documentTypeId] ?? 0) + 1 }));
      toast.current?.show({ severity: 'info', summary: 'Staged', detail: `${dt.name}: ${file.name}`, life: 1000 });
    },
    [maxUploadSizeMB]
  );

  const unstageFile = useCallback((docTypeId: string, idx: number) => {
    setStaged((prev) => {
      const list = [...(prev[docTypeId] || [])];
      list.splice(idx, 1);
      const next = { ...prev, [docTypeId]: list };
      return next;
    });
    // Also reset the underlying FileUpload input so the button caption returns to default
    try {
      const comp = uploadRefs.current[docTypeId];
      comp?.clear?.();
      const inputEl = comp?.getInput?.();
      if (inputEl && typeof inputEl.value !== 'undefined') {
        inputEl.value = '';
      }
    } catch {
      // ignore UI reset errors
    }
    // Force remount to ensure caption is reset
    setUploadKeys((prev) => ({ ...prev, [docTypeId]: (prev[docTypeId] ?? 0) + 1 }));
  }, []);

  // Existing docs actions
  const markDelete = useCallback((doc: DocRow) => {
    // Make delete/archive mutually exclusive: selecting delete removes any pending archive mark
    setPendingDeletes((prev) => {
      const next = new Set(prev);
      next.add(doc.id);
      return next;
    });
    setPendingArchives((prev) => {
      if (!prev.size) return prev;
      const next = new Set(prev);
      next.delete(doc.id);
      return next;
    });
  }, []);

  const undoDelete = useCallback((doc: DocRow) => {
    setPendingDeletes((prev) => {
      const next = new Set(prev);
      next.delete(doc.id);
      return next;
    });
  }, []);

  const markArchive = useCallback((doc: DocRow) => {
    // Make archive/delete mutually exclusive: selecting archive removes any pending delete mark
    setPendingArchives((prev) => {
      const next = new Set(prev);
      next.add(doc.id);
      return next;
    });
    setPendingDeletes((prev) => {
      if (!prev.size) return prev;
      const next = new Set(prev);
      next.delete(doc.id);
      return next;
    });
    // Notify user that the archive is staged and will be applied upon Save
    try {
      toast.current?.show({ severity: 'info', summary: 'Marked for archive', detail: doc.originalFilename, life: 1200 });
    } catch {}
  }, []);

  const undoArchive = useCallback((doc: DocRow) => {
    setPendingArchives((prev) => {
      const next = new Set(prev);
      next.delete(doc.id);
      return next;
    });
  }, []);

  // Staged archive UX: do not archive immediately; mark and allow undo until Save.
  // The actual archive mutation runs inside commit() via pendingArchives.
  // See: markArchive(doc) and commit() below.

const replaceExisting = useCallback((assignment: Assignment, doc: DocRow, file: File | null) => {
  if (!file) return;
  // stage the new file and mark old for deletion
  stageFile(assignment, file);
  markDelete(doc);
}, [stageFile, markDelete]);

const archiveAndReplace = useCallback((assignment: Assignment, doc: DocRow, file: File | null) => {
  if (!file) return;
  // stage the new file and mark old for archive
  stageFile(assignment, file);
  markArchive(doc);
}, [stageFile, markArchive]);


  
  const previewDoc = useCallback(async (doc: DocRow) => {
    setPreviewLoading(true);
    try {
      const res = await getDocumentContent(doc.id);
      setPreviewTitle(res.fileName);
      setPreviewType(res.mimeType || undefined);
      setPreviewSrc(res.contentBase64);
      setPreviewOpen(true);
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.error('previewDocument failed', e);
      toast.current?.show({
        severity: 'warn',
        summary: 'Preview failed',
        detail: String(e?.message || e),
        life: 2200
      });
    } finally {
      setPreviewLoading(false);
    }
  }, []);

  // Preview for archived documents
  const previewArchivedDoc = useCallback(async (doc: ArchivedRow) => {
    setPreviewLoading(true);
    try {
      const body = await getArchivedDocumentContent(doc.id);
      setPreviewTitle(String(body?.fileName || doc.originalFilename));
      setPreviewType(String(body?.mimeType || doc.mimeType || 'application/octet-stream'));
      setPreviewSrc(String(body?.contentBase64 || ''));
      setPreviewOpen(true);
    } catch (e: any) {
      console.error('previewArchivedDocument failed', e);
      toast.current?.show({ severity: 'warn', summary: 'Preview failed', detail: String(e?.message || e), life: 2200 });
    } finally {
      setPreviewLoading(false);
    }
  }, []);
 
  // Commit staged changes when parent clicks Save
  useImperativeHandle(ref, () => ({
    commit: async (entityIdOverride?: string) => {
      const targetEntityId = (entityIdOverride || entityKey || '').trim();
      if (!targetEntityId) {
        // nothing to upload to if entity id is missing
        return;
      }

      // Apply archives first (GraphQL)
      if (pendingArchives.size > 0) {
        const ids = Array.from(pendingArchives);
        for (const id of ids) {
          try {
            await mutArchive({ variables: { id }, context: { suppressGlobalError: true } });
          } catch (e) {
            // eslint-disable-next-line no-console
            console.error('archiveDocument failed', e);
          }
        }
      }

      // Apply deletes next (GraphQL)
      if (pendingDeletes.size > 0) {
        const ids = Array.from(pendingDeletes);
        for (const id of ids) {
          try {
            await mutDelete({ variables: { id } });
          } catch (e) {
            // continue but notify
            // eslint-disable-next-line no-console
            console.error('deleteDocument failed', e);
          }
        }
      }

      // Upload staged files (GraphQL)
      const tasks: Promise<any>[] = [];
      for (const [docTypeId, files] of Object.entries(staged)) {
        for (const file of files) {
          tasks.push(
            (async () => {
              const dataUrl = await readAsDataURL(file);
              await mutUpload({
                variables: {
                  input: {
                    module,
                    entityId: targetEntityId,
                    documentTypeId: docTypeId,
                    fileName: file.name,
                    mimeType: file.type || 'application/octet-stream',
                    contentBase64: dataUrl
                  }
                }
              });
            })()
          );
        }
      }
      if (tasks.length > 0) {
        await Promise.allSettled(tasks);
      }

      // Clear staging and refresh
      setStaged({});
      setPendingDeletes(new Set());
      setPendingArchives(new Set());
      await refreshAll();
    },
    reset: () => {
      setStaged({});
      setPendingDeletes(new Set());
      setPendingArchives(new Set());
    }
  }), [entityKey, module, staged, pendingDeletes, pendingArchives, mutUpload, mutDelete, mutArchive, refreshAll]);

  const renderStaged = (docTypeId: string) => {
    const list = staged[docTypeId] || [];
    if (list.length === 0) return null;
    return (
      <div className="mt-2">
        {list.map((f, i) => (
          <div key={`${docTypeId}:${i}`} className="flex align-items-center justify-content-between text-600 mb-1">
            <span>
              Staged: <strong>{f.name}</strong> • {formatBytes(f.size)}
            </span>
            <Button type="button" label="Remove" icon="pi pi-times" size="small" text onClick={() => unstageFile(docTypeId, i)} />
          </div>
        ))}
      </div>
    );
  };

  const renderExisting = (a: Assignment, list: DocRow[]) => {
    if (!entityKey) return null; // only show after entity exists

    const hasAny = list.length > 0;
    if (!hasAny) return <div className="col-12 text-600">No files uploaded.</div>;

    const acceptExt = (a.documentType?.allowedExtensions || []).map((e) => `.${e}`).join(',');

    return (
      <>
        {list.map((doc) => (
          <div key={doc.id} className="col-12">
            <div className={`border-1 surface-border border-round p-2 h-full`} style={{ position: 'relative' }}>
              <Menu
                id={`menu_${doc.id}`}
                model={[
                  { label: 'Mark for Removal', icon: 'pi pi-trash', command: () => markDelete(doc) },
                  { label: 'Remove and Replace', icon: 'pi pi-refresh', command: () => document.getElementById(`replace_${doc.id}`)?.click() },
                  { label: 'Archive and Replace', icon: 'pi pi-box', command: () => document.getElementById(`archive_replace_${doc.id}`)?.click() },
                  { label: 'Mark for Archive', icon: 'pi pi-box', command: () => markArchive(doc) }
                ]}
                popup
                ref={(el) => (actionMenuRefs.current[doc.id] = el)}
              />
              <div style={{ position: 'absolute', top: 6, right: 6, display: 'flex', gap: 6 }}>
                <Button type="button" icon="pi pi-eye" className="p-button-rounded p-button-text p-button-sm" title="Preview file" disabled={previewLoading} onClick={() => previewDoc(doc)} />
                <Button
                  type="button"
                  icon="pi pi-ellipsis-v"
                  className="p-button-rounded p-button-text p-button-sm"
                  title="More actions"
                  onClick={(event) => actionMenuRefs.current[doc.id]?.toggle(event)}
                  aria-haspopup
                  aria-controls={`menu_${doc.id}`}
                />
              </div>
              {/* Hidden inputs to support Replace actions triggered from the kebab menu */}
              <input
                id={`replace_${doc.id}`}
                type="file"
                accept={acceptExt}
                style={{ display: 'none' }}
                onChange={(e) => replaceExisting(a, doc, (e.target.files && e.target.files[0]) || null)}
              />
              <input
                id={`archive_replace_${doc.id}`}
                type="file"
                accept={acceptExt}
                style={{ display: 'none' }}
                onChange={(e) => archiveAndReplace(a, doc, (e.target.files && e.target.files[0]) || null)}
              />
              <div className="text-sm text-700 mb-1 pr-6" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                <strong>{doc.originalFilename}</strong>
              </div>
              <div className="text-600 text-xs mb-2 pr-6" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                .{doc.fileExt} • {formatBytes(doc.fileSizeBytes)} • {formatUploadedAt(doc.uploadedAt)}
              </div>
              <div className="mt-2 flex align-items-center gap-2">
                {pendingDeletes.has(doc.id) ? (
                  <>
                    <Button type="button" label="Undo" icon="pi pi-undo" className="p-button-text p-button-sm" onClick={() => undoDelete(doc)} />
                    <Tag value="Will be deleted" severity="danger" />
                  </>
                ) : pendingArchives.has(doc.id) ? (
                  <>
                    <Button type="button" label="Undo Archive" icon="pi pi-undo" className="p-button-text p-button-sm" onClick={() => undoArchive(doc)} />
                    <Tag value="Will be archived" severity="info" />
                  </>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </>
    );
  };

  // Render archived summary for a given assignment (compact row with modal trigger).
  // For non-admins, hide the row entirely if there are zero archived items.
  const renderArchived = (a: Assignment) => {
    const list = groupedArchived.get(a.documentTypeId) || [];
    if (!entityKey) return null;

    const count = list.length;
    if (count === 0 && !isAdmin) return null;

    return (
      <div className="col-12">
        <div className="flex align-items-center justify-content-between">
          <div className="text-600 text-xs">
            Archived ({count}) {archivedLoading ? <i className="pi pi-spin pi-spinner ml-2" /> : null}
          </div>
          <Button
            type="button"
            label="View Archived"
            icon="pi pi-history"
            className="p-button-text p-button-sm"
            title={count > 0 ? 'View archived files' : 'No archived files'}
            loading={archivedLoading}
            disabled={count === 0 || archivedLoading}
            onClick={() => openArchived(a)}
          />
        </div>
      </div>
    );
  };

  return (
    <Card>
      <Toast ref={toast} />
      {isAdmin && (
        <div className="mb-2">
          <Tag value="Admin Mode" severity="warning" icon="pi pi-lock-open" />
          {entityKey && (
            <span className="ml-2 text-600 text-xs">
              Archived items for this record: {archivedDocs.length}
              {archivedLoading ? <i className="pi pi-spin pi-spinner ml-2" /> : null}
            </span>
          )}
        </div>
      )}
      {headerVisible && (
        <div className="flex justify-content-between align-items-center mb-3">
          <h3 className="m-0">Documents</h3>
          <div className="flex align-items-center gap-2">
            {assignLoading || docsLoading ? <i className="pi pi-spin pi-spinner text-600" /> : null}
          </div>
        </div>
      )}

      {(assignError || docsError) && (
        <Message
          severity="error"
          text={`Failed to load document data.${assignError ? ' Assignments error.' : ''}${docsError ? ' Documents error.' : ''}`}
          className="mb-3"
        />
      )}

      {(props.showMissingBanner ?? false) && missingNames.length > 0 && (
        <Message
          severity={canOverrideMissing ? 'warn' : 'error'}
          className="mb-3"
          text={
            canOverrideMissing
              ? `You marked mandatory document(s) for deletion or archive: ${missingNames.join(', ')}. Saving will commit those changes and leave this record non-compliant.`
              : `Missing mandatory document(s): ${missingNames.join(', ')}`
          }
        />
      )}

      <div className="grid">
        {assignments.length === 0 ? (
          <div className="col-12">
            <Message severity="info" text="No document types assigned to this module." />
          </div>
        ) : (
          assignments.map((a: Assignment) => {
            const dt = a.documentType!;
            const list = groupedDocs.get(a.documentTypeId) || [];
            return (
              <div key={a.id} className="col-12 md:col-6 lg:col-4">
                <div className="border-1 surface-border border-round p-3">
                  <div className="flex align-items-center gap-2 mb-2">
                    <span className="text-900 font-medium">{dt.name}</span>
                    {a.mandatory ? <Tag value="Mandatory" severity="warning" /> : <Tag value="Optional" severity="success" />}
                    <Tag value={(dt.allowedExtensions || []).join(', ')} />
                  </div>

                  {/* Select (stage) file(s) */}
                  <div className="mb-3">
                    <FileUpload
                      key={`up-${a.documentTypeId}-${uploadKeys[a.documentTypeId] ?? 0}`}
                      ref={(el) => (uploadRefs.current[a.documentTypeId] = el)}
                      mode="basic"
                      name={`stage_${a.documentTypeId}`}
                      accept={(dt.allowedExtensions || []).map((e: string) => `.${e}`).join(',')}
                      chooseLabel="Choose File"
                      disabled={uploading}
                      customUpload
                      auto
                      uploadHandler={(e) => {
                        const file: File | undefined = e.files?.[0];
                        if (file) {
                          stageFile(a, file);
                        }
                        try {
                          const comp = uploadRefs.current[a.documentTypeId];
                          comp?.clear?.();
                          const inputEl = comp?.getInput?.();
                          if (inputEl && typeof inputEl.value !== 'undefined') {
                            inputEl.value = '';
                          }
                        } catch {}
                        setUploadKeys((prev) => ({ ...prev, [a.documentTypeId]: (prev[a.documentTypeId] ?? 0) + 1 }));
                      }}
                      className="w-full"
                    />
                    <small className="block mt-2 text-600">Max size: {maxUploadSizeMB} MB</small>
                    {renderStaged(a.documentTypeId)}
                  </div>

                  {/* Existing docs (when entity already exists) */}
                  <div className="grid">
                    {renderExisting(a, list)}
                  </div>
                  {/* Archived docs (admin-only; shows when query succeeded) */}
                  <div className="grid mt-2">
                    {renderArchived(a)}
                  </div>
                </div>
              </div>
            );
          })
        )}
      {/* Other uploaded documents not tied to current active assignments */}
      {unmatchedDocs.length > 0 && (
        <div className="mt-3">
          <h4 className="m-0 mb-2">Other uploaded documents</h4>
          <div className="grid">
            {unmatchedDocs.map((doc: DocRow) => (
              <div key={`other-${doc.id}`} className="col-12 md:col-6 lg:col-4">
                <div className="border-1 surface-border border-round p-2 h-full">
                  <div className="text-sm text-700 mb-1">
                    <strong>{doc.originalFilename}</strong>
                  </div>
                  <div className="text-600 text-xs mb-2">
                    .{doc.fileExt} • {formatBytes(doc.fileSizeBytes)} • {formatUploadedAt(doc.uploadedAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}


      {/* Inline preview dialog for GraphQL documents */}
      <Dialog
        header={previewTitle}
        visible={previewOpen}
        onHide={() => setPreviewOpen(false)}
        style={{ width: '92vw', maxWidth: '1200px' }}
        contentStyle={{ height: '82vh', padding: 0 }}
        dismissableMask
      >
        {previewLoading ? (
          <div className="text-600"><i className="pi pi-spin pi-spinner mr-2" /> Loading preview...</div>
        ) : previewSrc ? (
          previewType && /^image\//i.test(previewType) ? (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={previewSrc} alt={previewTitle} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            </div>
          ) : (
            <object data={previewSrc} type={previewType || 'application/pdf'} width="100%" height="100%">
              <a href={previewSrc} download={previewTitle}>
                Download {previewTitle}
              </a>
            </object>
          )
        ) : (
          <div className="text-600">No preview available.</div>
        )}
      </Dialog>

      {/* Archived items modal (per document type) */}
      <Dialog
        header={`Archived — ${archivedModalTypeName || 'Unknown'} (${archivedModalItems.length})`}
        visible={archivedModalOpen}
        onHide={() => setArchivedModalOpen(false)}
        style={{ width: '92vw', maxWidth: '900px' }}
        contentStyle={{ padding: '1rem', maxHeight: '70vh', overflow: 'auto' }}
        dismissableMask
      >
        {(!archivedModalItems || archivedModalItems.length === 0) ? (
          <div className="text-600">No archived files.</div>
        ) : (
          <div className="grid">
            {archivedModalItems.map((doc) => (
              <div key={`arch-modal-${doc.id}`} className="col-12 md:col-6">
                <div className="border-1 surface-border border-round p-2 h-full" style={{ position: 'relative', background: 'var(--surface-50)' }}>
                  <div style={{ position: 'absolute', top: 6, right: 6, display: 'flex', gap: 6 }}>
                    <Button type="button" icon="pi pi-eye" className="p-button-rounded p-button-text p-button-sm" title="Preview file" disabled={previewLoading} onClick={() => previewArchivedDoc(doc as any)} />
                    {isAdmin && (
                      <Button
                        type="button"
                        icon="pi pi-undo"
                        className="p-button-rounded p-button-text p-button-sm"
                        title="Restore file"
                        disabled={restoring}
                        loading={restoring}
                        onClick={async () => {
                          try {
                            await mutRestore({ variables: { id: (doc as any).id }, context: { suppressGlobalError: true } });
                          } catch (e) {
                            // eslint-disable-next-line no-console
                            console.error('restoreArchivedDocument failed', e);
                          } finally {
                            await refreshAll();
                          }
                        }}
                      />
                    )}
                  </div>
                  <div className="text-sm text-700 mb-1 pr-6" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                    <strong>{(doc as any).originalFilename}</strong>
                  </div>
                  <div className="text-600 text-xs mb-2 pr-6" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                    .{(doc as any).fileExt} • {formatBytes((doc as any).fileSizeBytes)} • Archived: {formatUploadedAt((doc as any).archivedDate || (doc as any).uploadedAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Dialog>
 
      </div>
    </Card>
  );
});

export default DocumentUploader;