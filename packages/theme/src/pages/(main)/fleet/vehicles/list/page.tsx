import React, { useMemo, useState, useCallback } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Tag } from 'primereact/tag';
import { Card } from 'primereact/card';
import { useNavigate } from 'react-router-dom';

import { useQuery, useMutation } from '@apollo/client/react';
import { VehiclesDocument, DeleteVehicleDocument } from '../../../../../graphql/vehicles/operations.generated';
import { DriversDocument } from '../../../../../graphql/drivers/operations.generated';

function useDebouncedValue<T>(value: T, delay = 200) {
    const [debounced, setDebounced] = React.useState(value);
    React.useEffect(() => {
        const id = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(id);
    }, [value, delay]);
    return debounced;
}

export default function VehiclesList() {
    const navigate = useNavigate();

    // Pagination UI state
    const [limit, setLimit] = useState(10);
    const [offset, setOffset] = useState(0);
    const [globalFilterRaw, setGlobalFilterRaw] = useState('');
    const globalFilter = useDebouncedValue(globalFilterRaw, 200);

    const { data, loading, error, refetch } = useQuery(VehiclesDocument, {
        variables: { limit, offset },
        fetchPolicy: 'cache-and-network'
    });

    const vehicles = useMemo(() => data?.vehicles ?? [], [data]);

    // Fetch drivers to display driver names in the list instead of raw IDs
    const { data: driversData } = useQuery(DriversDocument, { variables: { limit: 500, offset: 0 } });

    // Build an id -> "Full Name (Code)" map for quick lookup
    const driverMap = useMemo(() => {
        const map = new Map<string, string>();
        const ds = driversData?.drivers ?? [];
        for (const d of ds) {
            const label = `${d.fullName}${d.driverCode ? ` (${d.driverCode})` : ''}`;
            map.set(d.id, label);
        }
        return map;
    }, [driversData?.drivers]);

    // Delete dialog state and mutation
    const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<any>(null);
    const [deleteVehicle, { loading: deleting }] = useMutation(DeleteVehicleDocument);

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
            await deleteVehicle({ variables: { id: deleteTarget.id }, context: { suppressGlobalError: true } });
            await refetch?.({ limit, offset });
        } catch (e) {
            console.error('Delete vehicle error', e);
        } finally {
            setDeleteDialogVisible(false);
            setDeleteTarget(null);
        }
    };

    const statusBodyTemplate = useCallback((rowData: any) => {
        const labelFor = (s?: string) => {
            const v = (s ?? '').toString().trim().toLowerCase();
            if (v === 'operational') return 'Operational';
            if (v === 'maintenance') return 'Maintenance';
            if (v === 'out_of_service') return 'Out of Service';
            return s ?? '—';
        };
        const getStatusColor = (status?: string) => {
            const v = (status ?? '').toString().toLowerCase();
            switch (v) {
                case 'operational':
                case 'active':
                    return 'success';
                case 'maintenance':
                case 'expiring soon':
                    return 'warning';
                case 'out_of_service':
                case 'expired':
                case 'expired documents':
                    return 'danger';
                default:
                    return 'info';
            }
        };

        return <Tag value={labelFor(rowData.status)} severity={getStatusColor(rowData.status)} />;
    }, []);

    // Render driver name instead of UUID using the driverMap
    const driverBodyTemplate = useCallback(
        (rowData: any) => {
            const id = rowData?.driverId;
            if (!id) return '—';
            return driverMap.get(id) ?? id;
        },
        [driverMap]
    );

    const actionBodyTemplate = useCallback(
        (rowData: any) => {
            return (
                <div className="flex gap-2">
                    <Button icon="pi pi-eye" size="small" text tooltip="View Details" onClick={() => navigate(`/fleet/vehicles/${rowData.id}`)} />
                    <Button icon="pi pi-pencil" size="small" text tooltip="Edit" onClick={() => navigate(`/fleet/vehicles/${rowData.id}/edit`)} />
                    <Button icon="pi pi-wrench" size="small" text tooltip="Maintenance" disabled />
                    <Button icon="pi pi-trash" size="small" text severity="danger" tooltip="Delete" onClick={() => handleConfirmDelete(rowData)} />
                </div>
            );
        },
        [navigate]
    );

    const onPage = useCallback((e: any) => {
        setOffset(e.first ?? 0);
        setLimit(e.rows ?? 10);
    }, []);

    // Without total count, approximate totalRecords so next works when page is full
    const totalRecords = useMemo(() => {
        const pageCount = vehicles.length;
        const hasNext = pageCount === limit;
        return offset + pageCount + (hasNext ? 1 : 0);
    }, [vehicles.length, limit, offset]);

    return (
        <div className="grid">
            <div className="col-12">
                <Card>
                    <div className="flex justify-content-between align-items-center mb-4">
                        <h2 className="m-0">Fleet Vehicles</h2>
                        <div className="flex gap-2">
                            <Button label="Add Vehicle" icon="pi pi-plus" onClick={() => navigate('/fleet/vehicles/add')} className="p-button-success" />
                        </div>
                    </div>

                    <div className="flex justify-content-between mb-3">
                        <span className="p-input-icon-left">
                            <i className="pi pi-search" />
                            <InputText value={globalFilterRaw} onChange={(e) => setGlobalFilterRaw((e.target as HTMLInputElement).value)} placeholder="Search vehicles..." className="w-20rem" />
                        </span>
                        <span className="text-500">Rows: {vehicles.length}</span>
                    </div>

                    {error && <div className="p-error mb-3">Error loading vehicles</div>}

                    <DataTable
                        value={vehicles}
                        dataKey="id"
                        rowHover
                        paginator
                        rows={limit}
                        first={offset}
                        totalRecords={totalRecords}
                        onPage={onPage}
                        rowsPerPageOptions={[5, 10, 25]}
                        globalFilter={globalFilter}
                        emptyMessage="No vehicles found."
                        className="p-datatable-sm"
                        loading={loading}
                    >
                        <Column field="unitNumber" header="Vehicle #" sortable />
                        <Column field="make" header="Make" sortable />
                        <Column field="model" header="Model" sortable />
                        <Column field="year" header="Year" sortable />
                        <Column field="plateNumber" header="License Plate" sortable />
                        <Column field="vin" header="VIN" sortable />
                        <Column field="status" header="Status" body={statusBodyTemplate} sortable />
                        <Column field="driverId" header="Driver" body={driverBodyTemplate} sortable />
                        <Column field="mileage" header="Mileage" sortable />
                        <Column header="Actions" body={actionBodyTemplate} style={{ width: '200px' }} />
                    </DataTable>
                </Card>
            </div>
        </div>
    );
}
