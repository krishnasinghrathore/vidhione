import React, { useMemo, useRef, useState, useCallback, useEffect } from 'react';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { InputSwitch } from 'primereact/inputswitch';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { gql } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import { isSuperAdminRole } from '../../../../lib/roles';
import { getGraphQLErrorMessage } from '../../../../lib/errors';

type Item = { id: string; name: string; isDefault: boolean; active: boolean };

function useDebouncedValue<T>(value: T, delay = 200) {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

const LIST = gql`
  query WorkOrderPrioritiesAdmin($includeInactive: Boolean = true) {
    workOrderPrioritiesAdmin(includeInactive: $includeInactive) {
      id
      name
      isDefault
      active
    }
  }
`;

const CREATE = gql`
  mutation CreateWorkOrderPriority($input: WorkOrderPriorityCreateInput!) {
    createWorkOrderPriority(input: $input) {
      id
      name
      isDefault
      active
    }
  }
`;

const UPDATE = gql`
  mutation UpdateWorkOrderPriority($id: ID!, $input: WorkOrderPriorityUpdateInput!) {
    updateWorkOrderPriority(id: $id, input: $input) {
      id
      name
      isDefault
      active
    }
  }
`;

const DELETE = gql`
  mutation DeleteWorkOrderPriority($id: ID!) {
    deleteWorkOrderPriority(id: $id)
  }
`;

const SET_DEFAULT = gql`
  mutation SetDefaultWorkOrderPriority($id: ID!) {
    setDefaultWorkOrderPriority(id: $id) {
      id
      name
      isDefault
      active
    }
  }
`;

const REORDER = gql`
  mutation ReorderWorkOrderPriorities($ids: [ID!]!) {
    reorderWorkOrderPriorities(ids: $ids)
  }
`;

export default function WorkOrderPrioritiesPage({ inDialog = false }: { inDialog?: boolean }) {
  const toast = useRef<Toast>(null);

  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);
  const [globalFilterRaw, setGlobalFilterRaw] = useState('');
  const globalFilter = useDebouncedValue(globalFilterRaw, 200);

  const [createVisible, setCreateVisible] = useState(false);

  const { data, loading, error, refetch } = useQuery<{ workOrderPrioritiesAdmin: Item[] }>(LIST, {
    variables: { includeInactive: true },
    fetchPolicy: 'cache-and-network'
  });

  const [createItem, { loading: creating }] = useMutation(CREATE);
  const [updateItem, { loading: updating }] = useMutation(UPDATE);
  const [deleteItem, { loading: deleting }] = useMutation(DELETE);
  const [setDefault, { loading: settingDefault }] = useMutation(SET_DEFAULT);
  const [reorder, { loading: reordering }] = useMutation(REORDER);

  const [newItem, setNewItem] = useState<{ name: string; isDefault: boolean; active: boolean }>({
    name: '',
    isDefault: false,
    active: true
  });
  const [editing, setEditing] = useState<{ id: string | null; name: string; active: boolean }>({
    id: null,
    name: '',
    active: true
  });
  const [busyId, setBusyId] = useState<string | null>(null);

  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Item | null>(null);

  const rows = useMemo(() => data?.workOrderPrioritiesAdmin ?? [], [data?.workOrderPrioritiesAdmin]);

  // Local order state + sync on fetch
  const [rowsState, setRowsState] = useState<Item[]>([]);
  useEffect(() => setRowsState(rows), [rows]);

  const filtered = useMemo(() => {
    const list = rowsState;
    const q = globalFilter.trim().toLowerCase();
    if (!q) return list;
    return list.filter((m) => (m.name ?? '').toLowerCase().includes(q));
  }, [rowsState, globalFilter]);

  const totalRecords = filtered.length;
  const pageSlice = useMemo(() => filtered.slice(offset, offset + limit), [filtered, offset, limit]);

  const onPage = useCallback((e: any) => {
    setOffset(e.first ?? 0);
    setLimit(e.rows ?? 10);
  }, []);

  const onRowReorder = useCallback(
    async (e: any) => {
      if (String(globalFilter).trim()) {
        try { toast.current?.show({ severity: 'warn', summary: 'Clear search', detail: 'Clear the search to change order.' }); } catch {}
        return;
      }
      // e.value is the reordered current page slice when paginator is enabled
      const slice = (e?.value ?? []) as Item[];
      const before = rowsState.slice(0, offset);
      const after = rowsState.slice(offset + slice.length);
      const merged = [...before, ...slice, ...after];

      setRowsState(merged);
      try {
        await reorder({ variables: { ids: merged.map((r) => r.id) } });
        await refetch();
        try { toast.current?.show({ severity: 'success', summary: 'Order saved' }); } catch {}
      } catch (err: any) {
        try { toast.current?.show({ severity: 'error', summary: 'Reorder failed', detail: getGraphQLErrorMessage(err) }); } catch {}
      }
    },
    [globalFilter, reorder, refetch, rowsState, offset]
  );

  async function handleCreate() {
    const name = newItem.name.trim();
    if (!name) {
      toast.current?.show({ severity: 'warn', summary: 'Validation', detail: 'Name is required.' });
      return;
    }
    // Client-side duplicate guard for clearer feedback
    const exists = (rows ?? []).some((m) => String(m?.name ?? '').trim().toLowerCase() === name.toLowerCase());
    if (exists) {
      toast.current?.show({ severity: 'warn', summary: 'Validation', detail: 'Name already exists.' });
      return;
    }
    try {
      await createItem({ variables: { input: { name, isDefault: !!newItem.isDefault, active: !!newItem.active } } });
      setNewItem({ name: '', isDefault: false, active: true });
      setCreateVisible(false);
      await refetch();
      toast.current?.show({ severity: 'success', summary: 'Created', detail: 'Priority added.' });
    } catch (e: any) {
      toast.current?.show({ severity: 'error', summary: 'Create failed', detail: getGraphQLErrorMessage(e) });
    }
  }

  function startEdit(m: Item) {
    setEditing({ id: m.id, name: m.name, active: m.active });
  }
  function cancelEdit() {
    setEditing({ id: null, name: '', active: true });
  }
  async function saveEdit() {
    if (!editing.id) return;
    const name = editing.name.trim();
    if (!name) {
      toast.current?.show({ severity: 'warn', summary: 'Validation', detail: 'Name is required.' });
      return;
    }
    // Client-side duplicate guard (exclude current editing row)
    const exists = (rows ?? []).some((m) => m.id !== editing.id && String(m?.name ?? '').trim().toLowerCase() === name.toLowerCase());
    if (exists) {
      toast.current?.show({ severity: 'warn', summary: 'Validation', detail: 'Name already exists.' });
      return;
    }
    try {
      setBusyId(editing.id);
      await updateItem({ variables: { id: editing.id, input: { name, active: editing.active } } });
      cancelEdit();
      await refetch();
      toast.current?.show({ severity: 'success', summary: 'Saved', detail: 'Priority updated.' });
    } catch (e: any) {
      toast.current?.show({ severity: 'error', summary: 'Update failed', detail: getGraphQLErrorMessage(e) });
    } finally {
      setBusyId(null);
    }
  }

  async function toggleActive(m: Item) {
    try {
      setBusyId(m.id);
      await updateItem({ variables: { id: m.id, input: { active: !m.active } } });
      await refetch();
    } catch (e: any) {
      toast.current?.show({ severity: 'error', summary: 'Update failed', detail: getGraphQLErrorMessage(e) });
    } finally {
      setBusyId(null);
    }
  }

  async function makeDefault(m: Item) {
    try {
      setBusyId(m.id);
      await setDefault({ variables: { id: m.id } });
      await refetch();
      toast.current?.show({ severity: 'success', summary: 'Updated', detail: 'Default priority set.' });
    } catch (e: any) {
      toast.current?.show({ severity: 'error', summary: 'Set default failed', detail: getGraphQLErrorMessage(e) });
    } finally {
      setBusyId(null);
    }
  }

  function handleConfirmDelete(row: Item) {
    setDeleteTarget(row);
    setDeleteDialogVisible(true);
  }

  async function handleDelete() {
    if (!deleteTarget) {
      setDeleteDialogVisible(false);
      return;
    }
    try {
      setBusyId(deleteTarget.id);
      await deleteItem({ variables: { id: deleteTarget.id } });
      await refetch();
      toast.current?.show({ severity: 'success', summary: 'Deleted', detail: 'Priority deleted.' });
    } catch (e: any) {
      toast.current?.show({ severity: 'error', summary: 'Delete failed', detail: getGraphQLErrorMessage(e) });
    } finally {
      setBusyId(null);
      setDeleteDialogVisible(false);
      setDeleteTarget(null);
    }
  }

  const defaultBody = (row: Item) => (
    <Button
      icon={row.isDefault ? 'pi pi-star-fill' : 'pi pi-star'}
      rounded
      text
      severity={row.isDefault ? 'warning' : undefined}
      aria-label={row.isDefault ? 'Default' : 'Set Default'}
      title={row.isDefault ? 'Default' : 'Set Default'}
      onClick={row.isDefault ? undefined : () => makeDefault(row)}
      disabled={busyId === row.id || row.isDefault}
    />
  );

  const activeBody = (row: Item) => (
    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '2rem', height: '2rem' }}>
      <InputSwitch
        checked={row.active}
        onChange={() => toggleActive(row)}
        disabled={busyId === row.id || updating}
        className="p-inputswitch-sm"
        style={{ transform: 'scale(0.78)', transformOrigin: 'center' }}
      />
    </div>
  );

  const [busyInlineId, setBusyInlineId] = useState<string | null>(null);
  const actionBody = (row: Item) => {
    if (!isSuperAdmin) return null;
    try { console.debug('[Priorities] actionBody', row); } catch {}
    const isEditing = editing.id === row.id;
    if (isEditing) {
      return (
        <div className="flex gap-2">
          <Button icon="pi pi-check" aria-label="Save" title="Save" onClick={saveEdit} loading={busyId === row.id && updating} className="p-button-success p-button-sm" text />
          <Button icon="pi pi-times" aria-label="Cancel" title="Cancel" onClick={cancelEdit} className="p-button-text p-button-sm" text />
        </div>
      );
    }
    return (
      <div className="flex gap-1">
        <Button icon="pi pi-pencil" aria-label="Edit" title="Edit" size="small" onClick={() => startEdit(row)} disabled={busyInlineId === row.id} text />
        <Button
          icon="pi pi-trash"
          aria-label="Delete"
          title="Delete"
          size="small"
          severity="danger"
          onClick={() => handleConfirmDelete(row)}
          disabled={busyInlineId === row.id}
          text
        />
      </div>
    );
  };

  const nameBody = (row: Item) =>
    editing.id === row.id ? <InputText value={editing.name} onChange={(e) => setEditing((p) => ({ ...p, name: e.target.value }))} className="w-16rem" /> : <span className="text-900 font-medium">{row.name}</span>;


  const isSuperAdmin = isSuperAdminRole();

  try { console.debug('[WorkOrderPriorities] isSuperAdmin =', isSuperAdmin); } catch {}

  return (
    <div className="grid">
      <Toast ref={toast} />
      <div className="col-12">
        <Card>
          {!inDialog ? (
            <div className="mb-4">
              <h2 className="m-0">Work Order Priorities</h2>
            </div>
          ) : null}

          <div className="flex justify-content-between align-items-center mb-3">
            <div className="flex align-items-center gap-2">
              <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText
                  value={globalFilterRaw}
                  onChange={(e) => setGlobalFilterRaw((e.target as HTMLInputElement).value)}
                  placeholder="Search by name..."
                  className="w-20rem"
                />
              </span>
              {isSuperAdmin && (
                <Button
                  label="Add Priority"
                  icon="pi pi-plus"
                  onClick={() => setCreateVisible(true)}
                  className="p-button-success"
                />
              )}
            </div>
            <span className="text-500">Rows: {filtered.length}</span>
          </div>

          <DataTable
            value={pageSlice}
            dataKey="id"
            rowHover
            paginator
            rows={limit}
            first={offset}
            totalRecords={totalRecords}
            onPage={onPage}
            rowsPerPageOptions={[5, 10, 20, 50]}
            reorderableRows={!globalFilter.trim() && offset === 0}
            onRowReorder={onRowReorder}
            emptyMessage={loading ? 'Loading…' : 'No priorities found.'}
            className="p-datatable-sm"
            loading={loading || reordering}
          >
            <Column rowReorder style={{ width: '2.5rem' }} />
            <Column field="name" header="Name" body={nameBody} />
            <Column field="isDefault" header="Default" body={defaultBody} style={{ width: '120px' }} />
            <Column field="active" header="Active" body={activeBody} style={{ width: '120px' }} />
            {isSuperAdmin && <Column header="Actions" body={actionBody} style={{ width: '120px' }} />}
          </DataTable>
        </Card>
      </div>

      {/* Create Dialog */}
      <Dialog
        visible={createVisible}
        header="Add Priority"
        modal
        style={{ width: '520px' }}
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
            <InputText value={newItem.name} onChange={(e) => setNewItem((p) => ({ ...p, name: e.target.value }))} placeholder="e.g., Medium" className="w-full" />
          </div>
          <div className="col-6 flex align-items-center gap-2">
            <InputSwitch checked={newItem.active} onChange={(e) => setNewItem((p) => ({ ...p, active: !!e.value }))} />
            <label>Active</label>
          </div>
          <div className="col-6 flex align-items-center gap-2">
            <InputSwitch checked={newItem.isDefault} onChange={(e) => setNewItem((p) => ({ ...p, isDefault: !!e.value }))} />
            <label>Set as Default</label>
          </div>
        </div>
      </Dialog>

      {/* Delete confirm dialog */}
      <Dialog
        visible={deleteDialogVisible}
        header="Delete Priority"
        modal
        style={{ width: '520px' }}
        onHide={() => setDeleteDialogVisible(false)}
        footer={
          <div className="flex justify-content-end gap-2">
            <Button label="Cancel" text onClick={() => setDeleteDialogVisible(false)} />
            <Button label="Delete" icon="pi pi-trash" severity="danger" onClick={handleDelete} loading={busyId === (deleteTarget?.id ?? '')} />
          </div>
        }
      >
        <p>
          Are you sure you want to delete
          {deleteTarget ? (
            <>
              {' '}
              <strong>{deleteTarget.name}</strong>
            </>
          ) : (
            ''
          )}
          ?
        </p>
        <small className="text-600">This may fail if the priority is referenced by existing work orders.</small>
      </Dialog>
    </div>
  );
}