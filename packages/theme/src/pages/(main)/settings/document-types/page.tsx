import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { MultiSelect } from 'primereact/multiselect';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { gql } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';

type DocumentType = {
  id: string;
  name: string;
  allowedExtensions: string[];
  active: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
};

type Assignment = {
  id: string;
  documentTypeId: string;
  module: 'driver' | 'vehicle';
  mandatory: boolean;
  active: boolean;
  documentType?: {
    id: string;
    name: string;
    allowedExtensions: string[];
    active: boolean;
  } | null;
};

const EXT_OPTIONS = [
  { label: 'jpg', value: 'jpg' },
  { label: 'jpeg', value: 'jpeg' },
  { label: 'png', value: 'png' },
  { label: 'pdf', value: 'pdf' }
];

const MODULE_OPTIONS = [
  { label: 'Driver', value: 'driver' },
  { label: 'Vehicle', value: 'vehicle' }
] as const;

// GraphQL: Document Types
const DT_LIST = gql`
  query DocumentTypesAdmin($includeInactive: Boolean = true) {
    documentTypesAdmin(includeInactive: $includeInactive) {
      id
      name
      allowedExtensions
      active
      createdAt
      updatedAt
    }
  }
`;

const DT_CREATE = gql`
  mutation CreateDocType($input: DocumentTypeCreateInput!) {
    createDocumentType(input: $input) {
      id
      name
      allowedExtensions
      active
    }
  }
`;

const DT_UPDATE = gql`
  mutation UpdateDocType($id: ID!, $input: DocumentTypeUpdateInput!) {
    updateDocumentType(id: $id, input: $input) {
      id
      name
      allowedExtensions
      active
    }
  }
`;

const DT_DELETE = gql`
  mutation DeleteDocType($id: ID!) {
    deleteDocumentType(id: $id)
  }
`;

// GraphQL: Assignments
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

const ASSIGN_UPSERT = gql`
  mutation UpsertAssignment($input: DocumentTypeAssignmentUpsertInput!) {
    upsertDocumentTypeAssignment(input: $input) {
      id
      documentTypeId
      module
      mandatory
      active
    }
  }
`;

const ASSIGN_DELETE = gql`
  mutation DeleteAssignment($id: ID!) {
    deleteDocumentTypeAssignment(id: $id)
  }
`;

function useDebounced<T>(value: T, delay = 200) {
  const [v, setV] = React.useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return v;
}

export default function DocumentTypesPage() {
  const toast = useRef<Toast>(null);

  // Filters and paging
  const [globalFilterRaw, setGlobalFilterRaw] = useState('');
  const globalFilter = useDebounced(globalFilterRaw, 200);
  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);

  // Module tab for assignments manager
  const [moduleTab, setModuleTab] = useState<'driver' | 'vehicle'>('driver');

  // Create dialog state
  const [createVisible, setCreateVisible] = useState(false);
  const [newType, setNewType] = useState<{ name: string; allowed: string[]; active: boolean }>({
    name: '',
    allowed: ['jpg', 'jpeg', 'png', 'pdf'],
    active: true
  });

  // Edit state per row
  const [editing, setEditing] = useState<{
    id: string | null;
    name: string;
    allowed: string[];
    active: boolean;
  }>({ id: null, name: '', allowed: [], active: true });

  const [busyId, setBusyId] = useState<string | null>(null);

  // Document types
  const {
    data: dtData,
    loading: dtLoading,
    error: dtError,
    refetch: refetchDt
  } = useQuery<{ documentTypesAdmin: DocumentType[] }>(DT_LIST, {
    variables: { includeInactive: true },
    fetchPolicy: 'cache-and-network'
  });
  const dtypes = useMemo(() => dtData?.documentTypesAdmin ?? [], [dtData?.documentTypesAdmin]);

  const [createDocType, { loading: creating }] = useMutation(DT_CREATE);
  const [updateDocType, { loading: updating }] = useMutation(DT_UPDATE);
  const [deleteDocType, { loading: deleting }] = useMutation(DT_DELETE);

  // Assignments
  const {
    data: assignData,
    loading: assignLoading,
    error: assignError,
    refetch: refetchAssign
  } = useQuery<{ documentTypeAssignmentsByModule: Assignment[] }>(ASSIGN_LIST, {
    variables: { module: moduleTab },
    fetchPolicy: 'cache-and-network'
  });
  const assignments = useMemo(
    () => assignData?.documentTypeAssignmentsByModule ?? [],
    [assignData?.documentTypeAssignmentsByModule]
  );

  const [upsertAssignment, { loading: upserting }] = useMutation(ASSIGN_UPSERT);
  const [deleteAssignment, { loading: deletingAssign }] = useMutation(ASSIGN_DELETE);

  // New assignment controls
  const [assignPickDocTypeId, setAssignPickDocTypeId] = useState<string | null>(null);
  const [assignMandatory, setAssignMandatory] = useState(false);

  useEffect(() => {
    // Reset selection when switching tab
    setAssignPickDocTypeId(null);
    setAssignMandatory(false);
  }, [moduleTab]);

  // Derived lists for assignment add dropdown
  const assignedTypeIds = new Set(assignments.map((a) => a.documentTypeId));
  const assignableDocTypes = dtypes.filter((dt) => !assignedTypeIds.has(dt.id) && dt.active);

  // Filter and page dtypes
  const filtered = useMemo(() => {
    const list = dtypes;
    const q = globalFilter.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (d) =>
        (d.name ?? '').toLowerCase().includes(q) ||
        (d.allowedExtensions ?? []).some((e) => e.toLowerCase().includes(q))
    );
  }, [dtypes, globalFilter]);
  const totalRecords = filtered.length;
  const pageSlice = useMemo(() => filtered.slice(offset, offset + limit), [filtered, offset, limit]);

  const onPage = (e: any) => {
    setOffset(e.first ?? 0);
    setLimit(e.rows ?? 10);
  };

  // Handlers: Document Types
  async function handleCreate() {
    const name = newType.name.trim();
    if (!name) {
      toast.current?.show({ severity: 'warn', summary: 'Validation', detail: 'Name is required.' });
      return;
    }
    const allowed = newType.allowed;
    if (!allowed || allowed.length === 0) {
      toast.current?.show({ severity: 'warn', summary: 'Validation', detail: 'Select at least one allowed extension.' });
      return;
    }
    try {
      await createDocType({ variables: { input: { name, allowedExtensions: allowed, active: !!newType.active } } });
      setNewType({ name: '', allowed: ['jpg', 'jpeg', 'png', 'pdf'], active: true });
      setCreateVisible(false);
      await refetchDt();
      toast.current?.show({ severity: 'success', summary: 'Created', detail: 'Document type added.' });
    } catch (e: any) {
      toast.current?.show({ severity: 'error', summary: 'Create failed', detail: String(e?.message || e) });
    }
  }

  function startEdit(row: DocumentType) {
    setEditing({ id: row.id, name: row.name, allowed: row.allowedExtensions ?? [], active: row.active });
  }
  function cancelEdit() {
    setEditing({ id: null, name: '', allowed: [], active: true });
  }
  async function saveEdit() {
    if (!editing.id) return;
    const name = editing.name.trim();
    if (!name) {
      toast.current?.show({ severity: 'warn', summary: 'Validation', detail: 'Name is required.' });
      return;
    }
    if (!editing.allowed || editing.allowed.length === 0) {
      toast.current?.show({ severity: 'warn', summary: 'Validation', detail: 'Select at least one allowed extension.' });
      return;
    }
    try {
      setBusyId(editing.id);
      await updateDocType({
        variables: { id: editing.id, input: { name, allowedExtensions: editing.allowed, active: editing.active } }
      });
      cancelEdit();
      await refetchDt();
      toast.current?.show({ severity: 'success', summary: 'Saved', detail: 'Document type updated.' });
    } catch (e: any) {
      toast.current?.show({ severity: 'error', summary: 'Update failed', detail: String(e?.message || e) });
    } finally {
      setBusyId(null);
    }
  }
  async function toggleActive(row: DocumentType) {
    try {
      setBusyId(row.id);
      await updateDocType({ variables: { id: row.id, input: { active: !row.active } } });
      await refetchDt();
    } catch (e: any) {
      toast.current?.show({ severity: 'error', summary: 'Update failed', detail: String(e?.message || e) });
    } finally {
      setBusyId(null);
    }
  }
  async function removeDocType(row: DocumentType) {
    try {
      setBusyId(row.id);
      await deleteDocType({ variables: { id: row.id } });
      await refetchDt();
      toast.current?.show({ severity: 'success', summary: 'Removed', detail: 'Document type deleted.' });
    } catch (e: any) {
      toast.current?.show({ severity: 'error', summary: 'Delete failed', detail: String(e?.message || e) });
    } finally {
      setBusyId(null);
    }
  }

  // Handlers: Assignments
  async function addAssignment() {
    if (!assignPickDocTypeId) {
      toast.current?.show({ severity: 'warn', summary: 'Validation', detail: 'Select a document type to assign.' });
      return;
    }
    try {
      await upsertAssignment({
        variables: { input: { documentTypeId: assignPickDocTypeId, module: moduleTab, mandatory: assignMandatory, active: true } }
      });
      setAssignPickDocTypeId(null);
      setAssignMandatory(false);
      await refetchAssign();
      toast.current?.show({ severity: 'success', summary: 'Assigned', detail: 'Assignment added.' });
    } catch (e: any) {
      toast.current?.show({ severity: 'error', summary: 'Assign failed', detail: String(e?.message || e) });
    }
  }

  async function toggleAssignMandatory(a: Assignment) {
    try {
      await upsertAssignment({
        variables: { input: { documentTypeId: a.documentTypeId, module: a.module, mandatory: !a.mandatory, active: a.active } }
      });
      await refetchAssign();
    } catch (e: any) {
      toast.current?.show({ severity: 'error', summary: 'Update failed', detail: String(e?.message || e) });
    }
  }
  async function toggleAssignActive(a: Assignment) {
    try {
      await upsertAssignment({
        variables: { input: { documentTypeId: a.documentTypeId, module: a.module, mandatory: a.mandatory, active: !a.active } }
      });
      await refetchAssign();
    } catch (e: any) {
      toast.current?.show({ severity: 'error', summary: 'Update failed', detail: String(e?.message || e) });
    }
  }
  async function removeAssignment(a: Assignment) {
    try {
      await deleteAssignment({ variables: { id: a.id } });
      await refetchAssign();
      toast.current?.show({ severity: 'success', summary: 'Removed', detail: 'Assignment removed.' });
    } catch (e: any) {
      toast.current?.show({ severity: 'error', summary: 'Remove failed', detail: String(e?.message || e) });
    }
  }

  // Table cell templates
  const nameBody = (row: DocumentType) =>
    editing.id === row.id ? (
      <InputText value={editing.name} onChange={(e) => setEditing((p) => ({ ...p, name: e.target.value }))} className="w-16rem" />
    ) : (
      <span className="text-900 font-medium">{row.name}</span>
    );

  const extsBody = (row: DocumentType) =>
    editing.id === row.id ? (
      <MultiSelect
        value={editing.allowed}
        onChange={(e) => setEditing((p) => ({ ...p, allowed: (e.value as string[]) ?? [] }))}
        options={EXT_OPTIONS}
        optionLabel="label"
        optionValue="value"
        placeholder="Allowed extensions"
        className="w-20rem"
      />
    ) : (
      <div className="flex gap-2 flex-wrap">
        {(row.allowedExtensions ?? []).map((e) => (
          <Tag key={e} value={e} />
        ))}
      </div>
    );

  const activeBody = (row: DocumentType) => <Tag value={row.active ? 'Active' : 'Inactive'} severity={row.active ? 'success' : 'warning'} />;

  const actionBody = (row: DocumentType) => {
    const isEditing = editing.id === row.id;
    if (isEditing) {
      return (
        <div className="flex gap-2">
          <Button label="Save" icon="pi pi-check" onClick={saveEdit} loading={busyId === row.id && updating} className="p-button-success p-button-sm" />
          <Button label="Cancel" icon="pi pi-times" onClick={cancelEdit} className="p-button-text p-button-sm" />
        </div>
      );
    }
    return (
      <div className="flex gap-2">
        <Button label="Edit" icon="pi pi-pencil" size="small" text onClick={() => startEdit(row)} disabled={busyId === row.id} />
        <Button
          label={row.active ? 'Deactivate' : 'Activate'}
          icon={row.active ? 'pi pi-ban' : 'pi pi-check'}
          size="small"
          text
          onClick={() => toggleActive(row)}
          loading={busyId === row.id && updating}
        />
        <Button
          label="Delete"
          icon="pi pi-trash"
          size="small"
          text
          severity="danger"
          onClick={() => removeDocType(row)}
          disabled={busyId === row.id}
        />
      </div>
    );
  };

  return (
    <div className="grid">
      <Toast ref={toast} />
      <div className="col-12">
        <Card>
          <div className="flex justify-content-between align-items-center mb-4">
            <h2 className="m-0">Document Types</h2>
            <div className="flex gap-2">
              <Button label="Add Type" icon="pi pi-plus" onClick={() => setCreateVisible(true)} className="p-button-success" />
            </div>
          </div>

          {/* Search & rows indicator */}
          <div className="flex justify-content-between mb-3">
            <span className="p-input-icon-left">
              <i className="pi pi-search" />
              <InputText
                value={globalFilterRaw}
                onChange={(e) => setGlobalFilterRaw((e.target as HTMLInputElement).value)}
                placeholder="Search by name or extension..."
                className="w-20rem"
              />
            </span>
            <span className="text-500">Rows: {filtered.length}</span>
          </div>

          {dtError && <div className="p-error mb-3">Error loading document types</div>}

          <DataTable
            value={pageSlice}
            dataKey="id"
            rowHover
            paginator
            rows={limit}
            first={offset}
            totalRecords={totalRecords}
            onPage={onPage}
            rowsPerPageOptions={[5, 10, 25]}
            emptyMessage={dtLoading ? 'Loading…' : 'No document types found.'}
            className="p-datatable-sm"
            loading={dtLoading}
          >
            <Column field="name" header="Name" sortable body={nameBody} />
            <Column header="Allowed Extensions" body={extsBody} />
            <Column field="active" header="Active" body={activeBody} style={{ width: '140px' }} />
            <Column header="Actions" body={actionBody} style={{ width: '320px' }} />
          </DataTable>
        </Card>
      </div>

      {/* Assignments Manager */}
      <div className="col-12">
        <Card>
          <div className="flex justify-content-between align-items-center mb-4">
            <div className="flex align-items-center gap-2">
              <h3 className="m-0">Assignments</h3>
              <Dropdown
                value={moduleTab}
                options={MODULE_OPTIONS as any}
                onChange={(e) => setModuleTab(e.value)}
                optionLabel="label"
                optionValue="value"
              />
            </div>
          </div>

          {assignError && <div className="p-error mb-3">Error loading assignments</div>}

          {/* Add new assignment */}
          <div className="grid align-items-end mb-3">
            <div className="col-12 md:col-6">
              <label className="font-bold block mb-1">Document Type</label>
              <Dropdown
                value={assignPickDocTypeId}
                options={assignableDocTypes.map((d) => ({ label: d.name, value: d.id }))}
                onChange={(e) => setAssignPickDocTypeId(e.value)}
                placeholder={assignableDocTypes.length ? 'Select document type' : 'No active types to assign'}
                className="w-full md:w-20rem"
                disabled={assignableDocTypes.length === 0 || upserting}
              />
            </div>
            <div className="col-6 md:col-2">
              <div className="flex align-items-center gap-2">
                <Checkbox inputId="aMandatory" checked={assignMandatory} onChange={(e) => setAssignMandatory(!!e.checked)} />
                <label htmlFor="aMandatory">Mandatory</label>
              </div>
            </div>
            <div className="col-12 md:col-2">
              <Button label="Assign" icon="pi pi-plus" onClick={addAssignment} loading={upserting} className="p-button-success w-full md:w-auto" />
            </div>
          </div>

          {/* List assignments */}
          <DataTable
            value={assignments}
            dataKey="id"
            rowHover
            paginator
            rows={10}
            emptyMessage={assignLoading ? 'Loading…' : 'No assignments for this module.'}
            className="p-datatable-sm"
            loading={assignLoading}
          >
            <Column
              header="Document Type"
              body={(row: Assignment) => <span className="text-900 font-medium">{row.documentType?.name ?? '—'}</span>}
            />
            <Column
              header="Mandatory"
              body={(row: Assignment) => (
                <Button
                  label={row.mandatory ? 'Yes' : 'No'}
                  size="small"
                  text
                  icon={row.mandatory ? 'pi pi-check' : 'pi pi-times'}
                  onClick={() => toggleAssignMandatory(row)}
                />
              )}
              style={{ width: '140px' }}
            />
            <Column
              header="Active"
              body={(row: Assignment) => (
                <Button
                  label={row.active ? 'Active' : 'Inactive'}
                  size="small"
                  text
                  icon={row.active ? 'pi pi-check' : 'pi pi-ban'}
                  onClick={() => toggleAssignActive(row)}
                />
              )}
              style={{ width: '140px' }}
            />
            <Column
              header="Actions"
              body={(row: Assignment) => (
                <div className="flex gap-2">
                  <Button label="Remove" icon="pi pi-trash" size="small" text severity="danger" onClick={() => removeAssignment(row)} />
                </div>
              )}
              style={{ width: '160px' }}
            />
          </DataTable>
        </Card>
      </div>

      {/* Create Dialog */}
      <Dialog
        visible={createVisible}
        header="Add Document Type"
        modal
        style={{ width: '560px' }}
        onHide={() => setCreateVisible(false)}
        footer={
          <div className="flex justify-content-end gap-2">
            <Button label="Cancel" text onClick={() => setCreateVisible(false)} />
            <Button label="Add" icon="pi pi-check" onClick={handleCreate} loading={creating} />
          </div>
        }
      >
        <div className="grid">
          <div className="col-12">
            <label className="font-bold block mb-1">Name</label>
            <InputText
              value={newType.name}
              onChange={(e) => setNewType((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g., Driving License Front"
              className="w-full"
            />
          </div>
          <div className="col-12">
            <label className="font-bold block mb-1">Allowed Extensions</label>
            <MultiSelect
              value={newType.allowed}
              onChange={(e) => setNewType((p) => ({ ...p, allowed: (e.value as string[]) ?? [] }))}
              options={EXT_OPTIONS}
              optionLabel="label"
              optionValue="value"
              placeholder="Select extensions"
              className="w-full"
            />
          </div>
          <div className="col-12">
            <div className="flex align-items-center gap-2">
              <Checkbox inputId="dtActive" checked={newType.active} onChange={(e) => setNewType((p) => ({ ...p, active: !!e.checked }))} />
              <label htmlFor="dtActive">Active</label>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
}