import React, { useMemo, useState, useCallback } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Tag } from 'primereact/tag';
import { Card } from 'primereact/card';
import { Dialog } from 'primereact/dialog';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client/react';
import { DriversDocument, DeleteDriverDocument } from '../../../../../graphql/drivers/operations.generated';
import { getGraphQLErrorMessage } from '../../../../../lib/errors';
import { publishError } from '../../../../../lib/eventBus';

function useDebouncedValue<T>(value: T, delay = 200) {
    const [debounced, setDebounced] = React.useState(value);
    React.useEffect(() => {
        const id = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(id);
    }, [value, delay]);
    return debounced;
}

export default function DriversList() {
    const navigate = useNavigate();

    // Pagination state for offset-based queries
    const [limit, setLimit] = useState(10);
    const [offset, setOffset] = useState(0);
    const [globalFilterRaw, setGlobalFilterRaw] = useState('');
    const globalFilter = useDebouncedValue(globalFilterRaw, 200);

    const { data, loading, error, refetch } = useQuery(DriversDocument, {
        variables: { limit, offset },
        fetchPolicy: 'cache-and-network'
    });

    const drivers = useMemo(() => data?.drivers ?? [], [data]);

    // Delete dialog state
    const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<any>(null);
    const [deleteDriver, { loading: deleting }] = useMutation(DeleteDriverDocument);

    const handleConfirmDelete = (rowData: any) => {
        setDeleteTarget(rowData);
        setDeleteDialogVisible(true);
    };

    const handleDelete = async () => {
        if (!deleteTarget?.id) {
            setDeleteDialogVisible(false);
            setDeleteTarget(null);
            return;
        }
        try {
            // Suppress global generic toast; we will surface a specific one below.
            await deleteDriver({ variables: { id: deleteTarget.id }, context: { suppressGlobalError: true } });
            await refetch?.({ limit, offset });
        } catch (e: any) {
            console.error('Delete driver error', e);
            const msg = getGraphQLErrorMessage(e) || 'Cannot delete driver: this driver is referenced by other records (e.g., vehicles).';
            publishError(msg, 'error');
        } finally {
            setDeleteDialogVisible(false);
            setDeleteTarget(null);
        }
    };

    const statusBodyTemplate = useCallback((rowData: any) => {
        const getStatusColor = (status?: string) => {
            switch (status) {
                case 'Active':
                    return 'success';
                case 'Expiring Soon':
                    return 'warning';
                case 'Expired Documents':
                    return 'danger';
                case 'Inactive':
                    return 'info';
                default:
                    return 'info';
            }
        };
        return <Tag value={rowData.status ?? '—'} severity={getStatusColor(rowData.status)} />;
    }, []);

    const cdlClassBodyTemplate = (rowData: any) => {
        const endorsements = Array.isArray(rowData.cdlEndorsements) ? rowData.cdlEndorsements : []; // backend type is JSON; render array only if it's an array
        return (
            <div className="flex align-items-center gap-2">
                <span className="font-bold">{rowData.cdlClass ?? '—'}</span>
                <div className="flex gap-1">
                    {endorsements.map((endorsement: string, index: number) => (
                        <Tag key={index} value={endorsement} severity="info" className="text-xs" />
                    ))}
                </div>
            </div>
        );
    };

    const actionBodyTemplate = useCallback(
        (rowData: any) => {
            return (
                <div className="flex gap-2">
                    <Button icon="pi pi-eye" size="small" text tooltip="View" onClick={() => navigate(`/fleet/drivers/${rowData.id}`)} />
                    <Button icon="pi pi-pencil" size="small" text tooltip="Edit" onClick={() => navigate(`/fleet/drivers/${rowData.id}/edit`)} />
                    <Button icon="pi pi-trash" size="small" text severity="danger" tooltip="Delete" onClick={() => handleConfirmDelete(rowData)} />
                </div>
            );
        },
        [navigate]
    );

    // Derive simple status counters from the current page (not global totals)
    const { totalDrivers, activeDrivers, expiringSoon, expiredDocuments } = useMemo(() => {
        const ds = drivers ?? [];
        const total = ds.length;
        const active = ds.filter((d: any) => d.status === 'Active').length;
        const soon = ds.filter((d: any) => d.status === 'Expiring Soon').length;
        const expired = ds.filter((d: any) => d.status === 'Expired Documents').length;
        return { totalDrivers: total, activeDrivers: active, expiringSoon: soon, expiredDocuments: expired };
    }, [drivers]);

    const onPage = useCallback((e: any) => {
        // PrimeReact gives first (offset) and rows (page size)
        setOffset(e.first ?? 0);
        setLimit(e.rows ?? 10);
    }, []);

    // Without a count endpoint, approximate totalRecords so next button works when page is full
    const totalRecords = useMemo(() => {
        const pageCount = drivers.length;
        const hasNext = pageCount === limit;
        return offset + pageCount + (hasNext ? 1 : 0);
    }, [drivers.length, limit, offset]);

    return (
        <div className="grid">
            {/* Header Section */}
            <div className="col-12">
                <div className="flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 className="m-0 text-900">Driver Management</h2>
                        <p className="text-600 mt-1 mb-0">Manage driver profiles and FMCSA compliance documents</p>
                    </div>
                    <Button label="Add New Driver" icon="pi pi-plus" onClick={() => navigate('/fleet/drivers/add')} className="p-button-success" />
                </div>
            </div>

            {/* Status Cards - Current page summary */}
            <div className="col-12 md:col-3">
                <div className="surface-card p-3 border-round text-center shadow-1">
                    <div className="text-3xl font-bold text-blue-500 mb-1">{totalDrivers}</div>
                    <div className="text-600 text-sm">Drivers (page)</div>
                </div>
            </div>
            <div className="col-12 md:col-3">
                <div className="surface-card p-3 border-round text-center shadow-1">
                    <div className="text-3xl font-bold text-green-500 mb-1">{activeDrivers}</div>
                    <div className="text-600 text-sm">Active</div>
                </div>
            </div>
            <div className="col-12 md:col-3">
                <div className="surface-card p-3 border-round text-center shadow-1">
                    <div className="text-3xl font-bold text-orange-500 mb-1">{expiringSoon}</div>
                    <div className="text-600 text-sm">Expiring Soon</div>
                </div>
            </div>
            <div className="col-12 md:col-3">
                <div className="surface-card p-3 border-round text-center shadow-1">
                    <div className="text-3xl font-bold text-red-500 mb-1">{expiredDocuments}</div>
                    <div className="text-600 text-sm">Expired</div>
                </div>
            </div>

            {/* Drivers Table */}
            <div className="col-12">
                <Card className="shadow-2">
                    <div className="flex justify-content-between align-items-center mb-3">
                        <h3 className="m-0 text-900">All Drivers (page)</h3>
                    </div>

                    {/* Search Section inside table card (client-side filter only) */}
                    <div className="flex justify-content-between align-items-center mb-3">
                        <span className="p-input-icon-left">
                            <i className="pi pi-search" />
                            <InputText value={globalFilterRaw} onChange={(e) => setGlobalFilterRaw((e.target as HTMLInputElement).value)} placeholder="Search drivers by name, code, or license number..." className="w-25rem" />
                        </span>
                        <Button label="Clear" icon="pi pi-times" onClick={() => setGlobalFilterRaw('')} className="p-button-outlined" disabled={!globalFilterRaw} />
                    </div>

                    {error && <div className="p-error mb-3">Error loading drivers</div>}

                    <DataTable
                        value={drivers}
                        dataKey="id"
                        rowHover
                        paginator
                        rows={limit}
                        first={offset}
                        totalRecords={totalRecords}
                        onPage={onPage}
                        rowsPerPageOptions={[5, 10, 25]}
                        globalFilter={globalFilter}
                        emptyMessage="No drivers found."
                        className="p-datatable-sm"
                        sortField="fullName"
                        sortOrder={1}
                        loading={loading}
                    >
                        <Column field="fullName" header="Driver" sortable style={{ width: '160px' }} />
                        <Column field="driverCode" header="Driver Code" sortable style={{ width: '140px' }} />
                        <Column field="email" header="Email" sortable />
                        <Column field="licenseNumber" header="License" sortable />
                        <Column field="cdlClass" header="CDL Class" body={cdlClassBodyTemplate} sortable />
                        <Column field="medicalCardExpires" header="Medical Card" sortable />
                        <Column field="status" header="Status" body={statusBodyTemplate} sortable />
                        <Column header="Actions" body={actionBodyTemplate} style={{ width: '150px' }} />
                    </DataTable>
                </Card>
            </div>

            {/* Delete Driver Dialog */}
            <Dialog
                visible={deleteDialogVisible}
                header="Delete Driver"
                modal
                className="p-fluid"
                style={{ width: '420px' }}
                onHide={() => setDeleteDialogVisible(false)}
                footer={
                    <div>
                        <Button label="Cancel" icon="pi pi-times" onClick={() => setDeleteDialogVisible(false)} className="p-button-text" />
                        <Button label="Delete" icon="pi pi-trash" severity="danger" loading={deleting} onClick={handleDelete} />
                    </div>
                }
            >
                <p>Are you sure you want to delete this driver?</p>
            </Dialog>
        </div>
    );
}
