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
import { WorkOrdersDocument, DeleteWorkOrderDocument } from '../../../../../graphql/workOrders/operations.generated';
import { DriversDocument } from '../../../../../graphql/drivers/operations.generated';
import { VehiclesDocument } from '../../../../../graphql/vehicles/operations.generated';

function useDebouncedValue<T>(value: T, delay = 200) {
    const [debounced, setDebounced] = React.useState(value);
    React.useEffect(() => {
        const id = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(id);
    }, [value, delay]);
    return debounced;
}

export default function WorkOrdersList() {
    const navigate = useNavigate();

    // Pagination + filtering (client-side filter like Vehicles/Drivers)
    const [limit, setLimit] = useState(10);
    const [offset, setOffset] = useState(0);
    const [globalFilterRaw, setGlobalFilterRaw] = useState('');
    const globalFilter = useDebouncedValue(globalFilterRaw, 200);

    // GraphQL list (offset-based, fast-load like Vehicles/Drivers)
    const { data, loading, error, refetch } = useQuery(WorkOrdersDocument, {
        variables: { limit, offset },
        fetchPolicy: 'cache-and-network'
    });

    const workOrders = useMemo(() => data?.workOrders ?? [], [data]);
    
    // Fetch drivers to display names for assignedTo (mirrors fleet/vehicles list)
    const { data: driversData } = useQuery(DriversDocument, { variables: { limit: 500, offset: 0 } });
    const driverMap = useMemo(() => {
        const map = new Map<string, string>();
        const ds = driversData?.drivers ?? [];
        for (const d of ds) {
            const label = `${d.fullName}${d.driverCode ? ` (${d.driverCode})` : ''}`;
            map.set(d.id, label);
        }
        return map;
    }, [driversData?.drivers]);
    
    // Fetch vehicles to display friendly labels instead of raw IDs
    const { data: vehiclesData } = useQuery(VehiclesDocument, { variables: { limit: 500, offset: 0 } });
    const vehicleMap = useMemo(() => {
        const map = new Map<string, string>();
        const vs = vehiclesData?.vehicles ?? [];
        for (const v of vs) {
            const makeModel = [v.make, v.model].filter(Boolean).join(' ');
            const label = [v.unitNumber, makeModel].filter(Boolean).join(' - ') || v.unitNumber || v.id;
            map.set(v.id, label);
        }
        return map;
    }, [vehiclesData?.vehicles]);

    // Delete dialog state and mutation
    const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<any>(null);
    const [deleteWorkOrder, { loading: deleting }] = useMutation(DeleteWorkOrderDocument);

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
            await deleteWorkOrder({ variables: { id: deleteTarget.id }, context: { suppressGlobalError: true } });
            await refetch?.({ limit, offset });
        } catch (e) {
            console.error('Delete work order error', e);
        } finally {
            setDeleteDialogVisible(false);
            setDeleteTarget(null);
        }
    };

    // Cell templates (match the lightweight patterns used in Vehicles/Drivers)
    const statusBodyTemplate = useCallback((rowData: any) => {
        const v = (rowData.status ?? '').toString().toLowerCase();
        const getStatusColor = (status: string) => {
            switch (status) {
                case 'completed':
                    return 'success';
                case 'in_progress':
                    return 'info';
                case 'scheduled':
                    return 'warning';
                case 'canceled':
                case 'cancelled':
                    return 'danger';
                default:
                    return 'info';
            }
        };
        // Normalize label for display
        const label = v
            ? v === 'in_progress'
                ? 'In Progress'
                : v.charAt(0).toUpperCase() + v.slice(1).replace(/_/g, ' ')
            : '—';

        return <Tag value={label} severity={getStatusColor(v)} />;
    }, []);

    const priorityBodyTemplate = useCallback((rowData: any) => {
        const v = (rowData.priority ?? '').toString().toLowerCase();
        const getPriorityColor = (priority: string) => {
            switch (priority) {
                case 'high':
                    return 'danger';
                case 'medium':
                    return 'warning';
                case 'low':
                    return 'success';
                default:
                    return 'info';
            }
        };
        const label = v ? v.charAt(0).toUpperCase() + v.slice(1) : '—';
        return <Tag value={label} severity={getPriorityColor(v)} />;
    }, []);

    const workOrderNoTemplate = useCallback((rowData: any) => rowData.number ?? rowData.workOrderNumber ?? '—', []);
    const vehicleTemplate = useCallback(
        (rowData: any) => {
            const id = rowData?.vehicleId;
            if (!id) return '—';
            return vehicleMap.get(id) ?? id;
        },
        [vehicleMap]
    );
    const formatUSD = useCallback((val: any) => {
        const n = Number(val);
        if (Number.isFinite(n)) {
            return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
        }
        const s = (val ?? '').toString().trim();
        return s ? s : '—';
    }, []);
    const estCostTemplate = useCallback((rowData: any) => {
        const v = rowData.estCost ?? rowData.estimatedCost;
        return formatUSD(v);
    }, [formatUSD]);
    
    const assignedToBodyTemplate = useCallback(
        (rowData: any) => {
            const id = rowData?.assignedTo;
            if (!id) return '—';
            return driverMap.get(id) ?? id;
        },
        [driverMap]
    );

    const actionBodyTemplate = useCallback(
        (rowData: any) => {
            return (
                <div className="flex gap-2">
                    <Button icon="pi pi-eye" size="small" text tooltip="View Details" onClick={() => navigate(`/maintenance/work-orders/${rowData.id}`)} />
                    <Button icon="pi pi-pencil" size="small" text tooltip="Edit" onClick={() => navigate(`/maintenance/work-orders/${rowData.id}/edit`)} />
                    <Button icon="pi pi-trash" size="small" text severity="danger" tooltip="Delete" onClick={() => handleConfirmDelete(rowData)} />
                </div>
            );
        },
        [navigate]
    );

    // Paginator handlers and approximate total (no count endpoint)
    const onPage = useCallback((e: any) => {
        setOffset(e.first ?? 0);
        setLimit(e.rows ?? 10);
    }, []);

    const totalRecords = useMemo(() => {
        const pageCount = workOrders.length;
        const hasNext = pageCount === limit;
        return offset + pageCount + (hasNext ? 1 : 0);
    }, [workOrders.length, limit, offset]);

    return (
        <div className="grid">
            <div className="col-12">
                <Card className="shadow-2">
                    <div className="flex justify-content-between align-items-center mb-4">
                        <h2 className="m-0 text-900">Work Orders</h2>
                        <div className="flex gap-2">
                            <Button label="Create Work Order" icon="pi pi-plus" onClick={() => navigate('/maintenance/work-orders/add')} className="p-button-success" />
                            <Button label="Schedule Maintenance" icon="pi pi-calendar" onClick={() => navigate('/maintenance/schedule')} className="p-button-outlined" />
                        </div>
                    </div>

                    <div className="flex justify-content-between align-items-center mb-3">
                        <span className="p-input-icon-left">
                            <i className="pi pi-search" />
                            <InputText
                                value={globalFilterRaw}
                                onChange={(e) => setGlobalFilterRaw((e.target as HTMLInputElement).value)}
                                placeholder="Search work orders by number, vehicle, or task..."
                                className="w-25rem"
                            />
                        </span>
                        <Button label="Clear" icon="pi pi-times" onClick={() => setGlobalFilterRaw('')} className="p-button-outlined" disabled={!globalFilterRaw} />
                    </div>

                    {error && <div className="p-error mb-3">Error loading work orders</div>}

                    <DataTable
                        value={workOrders}
                        dataKey="id"
                        rowHover
                        paginator
                        rows={limit}
                        first={offset}
                        totalRecords={totalRecords}
                        onPage={onPage}
                        rowsPerPageOptions={[5, 10, 25]}
                        globalFilter={globalFilter}
                        emptyMessage="No work orders found."
                        className="p-datatable-sm"
                        sortField="dueDate"
                        sortOrder={1}
                        loading={loading}
                    >
                        <Column header="Work Order #" body={workOrderNoTemplate} sortable style={{ width: '160px' }} />
                        <Column header="Vehicle" body={vehicleTemplate} sortable style={{ width: '140px' }} />
                        <Column field="taskName" header="Task" sortable />
                        <Column field="priority" header="Priority" body={priorityBodyTemplate} sortable style={{ width: '120px' }} />
                        <Column field="status" header="Status" body={statusBodyTemplate} sortable style={{ width: '140px' }} />
                        <Column field="dueDate" header="Due Date" sortable style={{ width: '140px' }} />
                        <Column field="assignedTo" header="Assigned To" body={assignedToBodyTemplate} sortable />
                        <Column header="Est. Cost ($)" body={estCostTemplate} sortable style={{ width: '140px' }} />
                        <Column header="Actions" body={actionBodyTemplate} style={{ width: '220px' }} />
                    </DataTable>
                </Card>
            </div>

            {/* Delete Work Order Dialog */}
            <Dialog
                visible={deleteDialogVisible}
                header="Delete Work Order"
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
                <p>Are you sure you want to delete this work order?</p>
            </Dialog>
        </div>
    );
}
