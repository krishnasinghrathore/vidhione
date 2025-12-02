import React, { useMemo, useRef, useState, useCallback, useEffect } from 'react';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputSwitch } from 'primereact/inputswitch';
import { InputText } from 'primereact/inputtext';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { gql } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import { isSuperAdminRole } from '../../../../lib/roles';
import { getGraphQLErrorMessage } from '../../../../lib/errors';

type Mct = { id: string; name: string; isDefault: boolean; active: boolean };

function useDebouncedValue<T>(value: T, delay = 200) {
    const [debounced, setDebounced] = React.useState(value);
    React.useEffect(() => {
        const id = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(id);
    }, [value, delay]);
    return debounced;
}

const MCT_LIST = gql`
    query MaintenanceCompletionTypesAdmin($includeInactive: Boolean = true) {
        maintenanceCompletionTypesAdmin(includeInactive: $includeInactive) {
            id
            name
            isDefault
            active
        }
    }
`;

const MCT_CREATE = gql`
    mutation CreateMct($input: MaintenanceCompletionTypeCreateInput!) {
        createMaintenanceCompletionType(input: $input) {
            id
            name
            isDefault
            active
        }
    }
`;

const MCT_UPDATE = gql`
    mutation UpdateMct($id: ID!, $input: MaintenanceCompletionTypeUpdateInput!) {
        updateMaintenanceCompletionType(id: $id, input: $input) {
            id
            name
            isDefault
            active
        }
    }
`;

const MCT_DELETE = gql`
    mutation DeleteMct($id: ID!) {
        deleteMaintenanceCompletionType(id: $id)
    }
`;

const MCT_SET_DEFAULT = gql`
    mutation SetDefaultMct($id: ID!) {
        setDefaultMaintenanceCompletionType(id: $id) {
            id
            name
            isDefault
            active
        }
    }
`;

const MCT_REORDER = gql`
    mutation ReorderMct($ids: [ID!]!) {
        reorderMaintenanceCompletionTypes(ids: $ids)
    }
`;


export default function MaintenanceCompletionTypesPage({ inDialog = false }: { inDialog?: boolean }) {
    const toast = useRef<Toast>(null);

    // Page state (match other list pages style)
    const [limit, setLimit] = useState(10);
    const [offset, setOffset] = useState(0);
    const [globalFilterRaw, setGlobalFilterRaw] = useState('');
    const globalFilter = useDebouncedValue(globalFilterRaw, 200);

    // Create dialog state
    const [createVisible, setCreateVisible] = useState(false);

    // Role-based UI control (show row actions only for SUPERADMIN)
    const isSuperAdmin = (() => {
      const v1 = isSuperAdminRole();
      const v2 = String((import.meta as any)?.env?.VITE_USER_ROLE || '').toLowerCase() === 'superadmin';
      const v3 =
        (typeof window !== 'undefined'
          ? String(
              (localStorage.getItem('userRole') as string) ||
                (localStorage.getItem('VITE_USER_ROLE') as string) ||
                ''
            )
          : ''
        ).toLowerCase() === 'superadmin';
      const flag = v1 || v2 || v3;
      try {
        console.debug('[MaintenanceCompletionTypes] isSuperAdmin', { v1, v2, v3, flag });
      } catch {}
      return flag;
    })();

    // Query and mutations
    const {
        data: mctData,
        loading: mctLoading,
        error: mctError,
        refetch: refetchMct
    } = useQuery<{ maintenanceCompletionTypesAdmin: Mct[] }>(MCT_LIST, {
        variables: { includeInactive: true },
        fetchPolicy: 'cache-and-network'
    });

    const [createMct, { loading: creatingMct }] = useMutation(MCT_CREATE);
    const [updateMct, { loading: updatingMct }] = useMutation(MCT_UPDATE);
    const [deleteMct, { loading: deletingMct }] = useMutation(MCT_DELETE);
    const [setDefaultMct, { loading: settingDefault }] = useMutation(MCT_SET_DEFAULT);
    const [reorderMct, { loading: reorderingMct }] = useMutation(MCT_REORDER);

    // Local state for create and edit
    const [newType, setNewType] = useState<{ name: string; isDefault: boolean; active: boolean }>({
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

    // Live preview for generated code from label
    // Delete confirmation dialog state
    const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Mct | null>(null);

    const mcts = useMemo(() => mctData?.maintenanceCompletionTypesAdmin ?? [], [mctData?.maintenanceCompletionTypesAdmin]);

    // Local ordering state for drag and drop
    const [rowsState, setRowsState] = useState<Mct[]>([]);
    useEffect(() => {
        setRowsState(mcts);
    }, [mcts]);

    const filtered = useMemo(() => {
        const list = rowsState;
        const q = globalFilter.trim().toLowerCase();
        if (!q) return list;
        return list.filter((m) => (m.name ?? '').toLowerCase().includes(q));
    }, [rowsState, globalFilter]);

    // Paging handled client-side (no count endpoint)
    const totalRecords = filtered.length;
    const pageSlice = useMemo(() => filtered.slice(offset, offset + limit), [filtered, offset, limit]);

    const onPage = useCallback((e: any) => {
        setOffset(e.first ?? 0);
        setLimit(e.rows ?? 10);
    }, []);

    // Row reorder handler
    const onRowReorder = useCallback(
        async (e: any) => {
            if (String(globalFilter).trim()) {
                toast.current?.show({ severity: 'warn', summary: 'Clear search', detail: 'Clear the search to change order.' });
                return;
            }
            // e.value contains the reordered current page slice when pagination is enabled.
            const slice = (e?.value ?? []) as Mct[];
            const before = rowsState.slice(0, offset);
            const after = rowsState.slice(offset + slice.length);
            const merged = [...before, ...slice, ...after];

            setRowsState(merged);
            try {
                await reorderMct({ variables: { ids: merged.map((r) => r.id) } });
                await refetchMct();
                toast.current?.show({ severity: 'success', summary: 'Order saved' });
            } catch (err: any) {
                toast.current?.show({ severity: 'error', summary: 'Reorder failed', detail: getGraphQLErrorMessage(err) });
            }
        },
        [globalFilter, reorderMct, refetchMct, rowsState, offset]
    );

    // Create new (from dialog)
    async function handleCreate() {
            const name = newType.name.trim();
            if (!name) {
                toast.current?.show({ severity: 'warn', summary: 'Validation', detail: 'Name is required.' });
                return;
            }

            // Client-side duplicate guard to show friendly error immediately
            const exists = (mcts ?? []).some((m) => String(m?.name ?? '').trim().toLowerCase() === name.toLowerCase());
            if (exists) {
                toast.current?.show({ severity: 'warn', summary: 'Validation', detail: 'Name already exists.' });
                return;
            }

            try {
                await createMct({ variables: { input: { name, isDefault: !!newType.isDefault, active: !!newType.active } } });
                setNewType({ name: '', isDefault: false, active: true });
                setCreateVisible(false);
                await refetchMct();
                toast.current?.show({ severity: 'success', summary: 'Created', detail: 'Maintenance completion type added.' });
            } catch (e: any) {
                toast.current?.show({ severity: 'error', summary: 'Create failed', detail: getGraphQLErrorMessage(e) });
            }
        }

    // Edit flow (inline row edit like other lists often allow quick updates)
    function startEdit(m: Mct) {
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
            try {
                setBusyId(editing.id);
                await updateMct({ variables: { id: editing.id, input: { name, active: editing.active } } });
                cancelEdit();
                await refetchMct();
                toast.current?.show({ severity: 'success', summary: 'Saved', detail: 'Type updated.' });
            } catch (e: any) {
                toast.current?.show({ severity: 'error', summary: 'Update failed', detail: getGraphQLErrorMessage(e) });
            } finally {
                setBusyId(null);
            }
        }

    // Actions
    async function toggleActive(m: Mct) {
        try {
            setBusyId(m.id);
            await updateMct({ variables: { id: m.id, input: { active: !m.active } } });
            await refetchMct();
        } catch (e: any) {
            toast.current?.show({ severity: 'error', summary: 'Update failed', detail: getGraphQLErrorMessage(e) });
        } finally {
            setBusyId(null);
        }
    }
    async function makeDefault(m: Mct) {
        try {
            setBusyId(m.id);
            await setDefaultMct({ variables: { id: m.id } });
            await refetchMct();
            toast.current?.show({ severity: 'success', summary: 'Updated', detail: 'Default type set.' });
        } catch (e: any) {
            toast.current?.show({ severity: 'error', summary: 'Set default failed', detail: getGraphQLErrorMessage(e) });
        } finally {
            setBusyId(null);
        }
    }
    async function removeMct(m: Mct) {
        try {
            setBusyId(m.id);
            await deleteMct({ variables: { id: m.id } });
            await refetchMct();
            toast.current?.show({ severity: 'success', summary: 'Removed', detail: 'Type deactivated.' });
        } catch (e: any) {
            toast.current?.show({ severity: 'error', summary: 'Remove failed', detail: getGraphQLErrorMessage(e) });
        } finally {
            setBusyId(null);
        }
    }

    // Delete dialog handlers
    function handleConfirmDelete(row: Mct) {
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
            await deleteMct({ variables: { id: deleteTarget.id } });
            await refetchMct();
            toast.current?.show({ severity: 'success', summary: 'Deleted', detail: 'Type deleted.' });
        } catch (e: any) {
            // Backend throws when FK prevents delete
            toast.current?.show({ severity: 'error', summary: 'Delete failed', detail: getGraphQLErrorMessage(e) });
        } finally {
            setBusyId(null);
            setDeleteDialogVisible(false);
            setDeleteTarget(null);
        }
    }

    // Table body templates
    const defaultBody = (row: Mct) => (
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

    const activeBody = (row: Mct) => (
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '2rem', height: '2rem' }}>
            <InputSwitch
                checked={row.active}
                onChange={() => toggleActive(row)}
                disabled={busyId === row.id || updatingMct}
                className="p-inputswitch-sm"
                style={{ transform: 'scale(0.78)', transformOrigin: 'center' }}
            />
        </div>
    );
    const actionBody = (row: Mct) => {
        if (!isSuperAdmin) return null;

        const isEditing = editing.id === row.id;
        if (isEditing) {
            return (
                <div className="flex gap-2">
                    <Button icon="pi pi-check" aria-label="Save" title="Save" onClick={saveEdit} loading={busyId === row.id && updatingMct} className="p-button-success p-button-sm" text />
                    <Button icon="pi pi-times" aria-label="Cancel" title="Cancel" onClick={cancelEdit} className="p-button-text p-button-sm" text />
                </div>
            );
        }
        return (
            <div className="flex gap-1">
                <Button icon="pi pi-pencil" aria-label="Edit" title="Edit" size="small" text onClick={() => startEdit(row)} disabled={busyId === row.id} />
                <Button
                    icon="pi pi-trash"
                    aria-label="Delete"
                    title="Delete"
                    size="small"
                    text
                    severity="danger"
                    onClick={() => handleConfirmDelete(row)}
                    disabled={busyId === row.id}
                />
            </div>
        );
    };

    // code column removed; internal code remains hidden

    const nameBody = (row: Mct) =>
            editing.id === row.id ? (
                <InputText value={editing.name} onChange={(e) => setEditing((p) => ({ ...p, name: e.target.value }))} className="w-16rem" />
            ) : (
                <span className="text-900 font-medium">{row.name}</span>
            );

    return (
        <div className="grid">
            <Toast ref={toast} />
            <div className="col-12">
                <Card>
                    {/* Header - hidden when rendered inside a Dialog */}
                    {!inDialog ? (
                        <div className="mb-4">
                            <h2 className="m-0">Maintenance Completion Types</h2>
                        </div>
                    ) : null}

                    {/* Search + Add on one line */}
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
                                    label="Add Type"
                                    icon="pi pi-plus"
                                    onClick={() => setCreateVisible(true)}
                                    className="p-button-success"
                                />
                            )}
                        </div>
                        <span className="text-500">Rows: {filtered.length}</span>
                    </div>

                    {mctError && <div className="p-error mb-3">Error loading types</div>}

                    {/* Table */}
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
                        emptyMessage={mctLoading ? 'Loading…' : 'No types found.'}
                        className="p-datatable-sm"
                        loading={mctLoading || reorderingMct}
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
                header="Add Maintenance Completion Type"
                modal
                style={{ width: '520px' }}
                onHide={() => setCreateVisible(false)}
                footer={
                    <div className="flex justify-content-end gap-2">
                        <Button label="Cancel" text onClick={() => setCreateVisible(false)} />
                        <Button label="Add" icon="pi pi-check" onClick={handleCreate} loading={creatingMct} />
                    </div>
                }
            >
                <div className="grid">
                    <div className="col-12">
                        <label className="font-bold block mb-1">Name</label>
                        <InputText value={newType.name} onChange={(e) => setNewType((p) => ({ ...p, name: e.target.value }))} placeholder="e.g., Corrective" className="w-full" />
                    </div>
                    <div className="col-6">
                        <div className="flex align-items-center gap-2">
                            <Checkbox inputId="dlgActive" checked={newType.active} onChange={(e) => setNewType((p) => ({ ...p, active: !!e.checked }))} />
                            <label htmlFor="dlgActive">Active</label>
                        </div>
                    </div>
                    <div className="col-6">
                        <div className="flex align-items-center gap-2">
                            <Checkbox inputId="dlgDefault" checked={newType.isDefault} onChange={(e) => setNewType((p) => ({ ...p, isDefault: !!e.checked }))} />
                            <label htmlFor="dlgDefault">Set as Default</label>
                        </div>
                    </div>
                </div>
            </Dialog>

            {/* Delete confirm dialog */}
            <Dialog
                visible={deleteDialogVisible}
                header="Delete Maintenance Completion Type"
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
                <small className="text-600">This will fail if the type is referenced by existing maintenance records.</small>
            </Dialog>
        </div>
    );
}