import React, { useMemo, useState, useRef, useCallback } from 'react';
import { gql } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import { Card } from 'primereact/card';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { formatUploadedAt, getArchivedDocumentContent } from '../../../../lib/documents';

const LIST_ARCHIVED = gql`
  query ListArchivedByModule($module: String!, $entityId: ID, $limit: Int, $offset: Int) {
    listArchivedByModule(module: $module, entityId: $entityId, limit: $limit, offset: $offset) {
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
      documentType { id name }
    }
  }
`;

// Fallback query for servers that don't yet have listArchivedByModule
const LIST_ARCHIVED_ENTITY = gql`
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
      documentType { id name }
    }
  }
`;

const RESTORE_ARCHIVED = gql`
  mutation RestoreArchivedDocument($id: ID!) {
    restoreArchivedDocument(id: $id)
  }
`;

type Row = {
  id: string;
  module: string;
  entityId: string;
  documentTypeId: string;
  originalFilename: string;
  mimeType: string;
  fileExt: string;
  fileSizeBytes: number;
  storagePath: string;
  uploadedAt: string;
  archivedDate: string;
  documentType?: { id: string; name: string } | null;
};

export default function ArchivedDocumentsPage() {
  const toast = useRef<Toast>(null);

  const [mod, setMod] = useState<'driver' | 'vehicle'>('driver');
  const [entityId, setEntityId] = useState<string>('');
  const [limit] = useState<number>(100);
  const [offset] = useState<number>(0);

  // Primary module-wise query
  const { data: dataMod, loading: loadingMod, error: errorMod, refetch: refetchMod } = useQuery<{ listArchivedByModule: Row[] }>(LIST_ARCHIVED, {
    variables: { module: mod, entityId: entityId.trim() ? entityId.trim() : null, limit, offset },
    fetchPolicy: 'network-only',
    errorPolicy: 'ignore',
    context: { suppressGlobalError: true }
  });

  // Fallback: entity-specific query (older servers)
  const { data: dataEnt, loading: loadingEnt, error: errorEnt, refetch: refetchEnt } = useQuery<{ listArchivedDocuments: Row[] }>(LIST_ARCHIVED_ENTITY, {
    variables: { module: mod, entityId: entityId.trim() },
    skip: !entityId.trim(),
    fetchPolicy: 'network-only',
    errorPolicy: 'ignore',
    context: { suppressGlobalError: true }
  });

  const [mutRestore, { loading: restoring }] = useMutation(RESTORE_ARCHIVED);

  const rows = useMemo<Row[]>(() => {
    const a = dataMod?.listArchivedByModule ?? [];
    if (a.length > 0) return a;
    const b = dataEnt?.listArchivedDocuments ?? [];
    return b;
  }, [dataMod?.listArchivedByModule, dataEnt?.listArchivedDocuments]);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState<string>('');
  const [previewType, setPreviewType] = useState<string | undefined>(undefined);
  const [previewLoading, setPreviewLoading] = useState(false);

  const preview = useCallback(async (r: Row) => {
    setPreviewLoading(true);
    try {
      const body = await getArchivedDocumentContent(r.id);
      setPreviewTitle(String(body?.fileName || r.originalFilename));
      setPreviewType(String(body?.mimeType || r.mimeType || 'application/octet-stream'));
      setPreviewSrc(String(body?.contentBase64 || ''));
      setPreviewOpen(true);
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.error('previewArchived failed', e);
      toast.current?.show({ severity: 'warn', summary: 'Preview failed', detail: String(e?.message || e), life: 2000 });
    } finally {
      setPreviewLoading(false);
    }
  }, []);

  const restore = useCallback(async (r: Row) => {
    try {
      await mutRestore({ variables: { id: r.id }, context: { suppressGlobalError: true } });
      toast.current?.show({ severity: 'success', summary: 'Restored', detail: r.originalFilename, life: 1200 });
      await Promise.allSettled([
        refetchMod(),
        entityId.trim() ? refetchEnt() : Promise.resolve(null)
      ]);
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.error('restoreArchivedDocument failed', e);
      toast.current?.show({ severity: 'error', summary: 'Restore failed', detail: String(e?.message || e), life: 2200 });
    }
  }, [mutRestore, refetchMod, refetchEnt, entityId]);

  const loadingCombined = !!(loadingMod || loadingEnt);
  // Show an error only if both queries fail when entityId is provided.
  const showError = !!(errorMod && entityId.trim() && errorEnt);

  const header = (
    <div className="flex justify-content-between align-items-center mb-3">
      <div className="flex align-items-center gap-2">
        <h3 className="m-0">Archived Documents</h3>
        <Tag value={mod} />
        {loadingCombined ? <i className="pi pi-spin pi-spinner text-600" /> : null}
      </div>
      <div className="flex align-items-center gap-2">
        <Dropdown
          value={mod}
          options={[{ label: 'Driver', value: 'driver' }, { label: 'Vehicle', value: 'vehicle' }]}
          onChange={(e) => setMod((e as any).value)}
          style={{ width: '12rem' }}
        />
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText value={entityId} onChange={(e) => setEntityId(e.target.value)} placeholder="Filter by Entity ID (optional)" style={{ width: '22rem' }} />
        </span>
        <Button
          label="Search"
          icon="pi pi-search"
          onClick={async () => {
            await Promise.allSettled([
              refetchMod(),
              entityId.trim() ? refetchEnt() : Promise.resolve(null)
            ]);
          }}
        />
      </div>
    </div>
  );

  return (
    <Card>
      <Toast ref={toast} />
      {header}
      {errorMod && !entityId.trim() ? (
        <div className="mb-2 text-600">Server does not support module-wise listing yet. Enter an Entity ID to fetch archived files.</div>
      ) : null}
      {showError ? (
        <div className="mb-3 text-red-600">Failed to load archived documents.</div>
      ) : null}
      {rows.length === 0 ? (
        <div className="text-600">No archived files{entityId.trim() ? ' for this entity' : ''}.</div>
      ) : (
        <div className="grid">
          {rows.map((r) => (
            <div key={r.id} className="col-12 md:col-6 lg:col-4">
              <div className="border-1 surface-border border-round p-2 h-full" style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: 6, right: 6, display: 'flex', gap: 6 }}>
                  <Button type="button" icon="pi pi-eye" className="p-button-rounded p-button-text p-button-sm" title="Preview" onClick={() => preview(r)} />
                  <Button type="button" icon="pi pi-undo" className="p-button-rounded p-button-text p-button-sm" title="Restore" loading={restoring} onClick={() => restore(r)} />
                </div>
                <div className="text-sm text-700 mb-1 pr-6" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                  <strong>{r.originalFilename}</strong>
                </div>
                <div className="text-600 text-xs mb-2 pr-6" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                  {r.documentType?.name ? <span>{r.documentType?.name} • </span> : null}
                  .{r.fileExt} • {(r.fileSizeBytes / 1024).toFixed(0)} KB • Archived: {formatUploadedAt(r.archivedDate || r.uploadedAt)}
                </div>
                <div className="mt-2 flex align-items-center gap-2">
                  <Tag value={r.entityId} />
                  <Tag value="Archived" severity="info" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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
    </Card>
  );
}