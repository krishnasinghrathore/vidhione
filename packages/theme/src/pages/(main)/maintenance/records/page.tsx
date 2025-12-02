'use client';
import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Tag } from 'primereact/tag';
import { Dialog } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { Toast } from 'primereact/toast';
import { useMutation, useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { MaintenanceRecordsDocument, CreateMaintenanceRecordDocument, UpdateMaintenanceRecordDocument, DeleteMaintenanceRecordDocument } from '../../../../graphql/maintenanceRecords/operations.generated';
import { VehiclesDocument } from '../../../../graphql/vehicles/operations.generated';
import { MaintenanceRecordCreateSchema } from '../../../../validation/maintenance';
import { zodErrorToRecord } from '../../../../validation/utils';
import { getGraphQLErrorMessage } from '../../../../lib/errors';

type RecordEntryState = {
    vehicleId: string | null;
    date: Date | null;
    services: string[];
    serviceInput: string;
    maintenanceCompletionTypeId: string | null;
    completedBy: string;
    meterReading: string;
    laborHours: number | null;
    totalCost: number | null;
    partsUsed: string;
    notes: string;
};

function toISODate(d: Date | null): string | null {
    if (!d) return null;
    const x = new Date(d);
    if (isNaN(x.getTime())) return null;
    const y = x.getFullYear();
    const m = String(x.getMonth() + 1).padStart(2, '0');
    const day = String(x.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

export default function MaintenanceRecords() {
    const toast = useRef<Toast>(null);

    // Pagination and search
    const [limit, setLimit] = useState(20);
    const [offset, setOffset] = useState(0);
    const [search, setSearch] = useState('');

    // GraphQL: list maintenance records
    const {
        data: gqlData,
        loading: gqlLoading,
        error: gqlError,
        refetch
    } = useQuery(MaintenanceRecordsDocument, {
        variables: { limit, offset },
        fetchPolicy: 'cache-and-network'
    });

    // GraphQL: vehicles for dropdown
    const { data: vehData } = useQuery(VehiclesDocument, {
        variables: { limit: 200, offset: 0 }
    });

    // GraphQL: maintenance completion types (include inactive for edit display)
    const MAINTENANCE_COMPLETION_TYPES = gql`
        query MaintenanceCompletionTypesAdmin {
            maintenanceCompletionTypesAdmin(includeInactive: true) {
                id
                name
                isDefault
                active
            }
        }
    `;
    const { data: mctData } = useQuery<{ maintenanceCompletionTypesAdmin: { id: string; name: string; isDefault: boolean; active: boolean }[] }>(MAINTENANCE_COMPLETION_TYPES);

    const maintenanceCompletionTypeOptions = useMemo(
        () => (mctData?.maintenanceCompletionTypesAdmin ?? []).map((t: any) => ({ label: t.name, value: t.id })),
        [mctData?.maintenanceCompletionTypesAdmin]
    );

    const defaultMctId = useMemo(() => {
        const list = mctData?.maintenanceCompletionTypesAdmin ?? [];
        const d = list.find((t: any) => t.isDefault) ?? list[0];
        return d?.id ?? null;
    }, [mctData?.maintenanceCompletionTypesAdmin]);


    const vehicleOptions = useMemo(
        () =>
            (vehData?.vehicles ?? []).map((v: any) => ({
                label: `${v.unitNumber}${v.make ? ' - ' + v.make : ''}${v.model ? ' ' + v.model : ''}`,
                value: v.id
            })),
        [vehData?.vehicles]
    );

    // Map vehicleId -> human-readable label for display in cards
    const vehicleLabelById = useMemo<Record<string, string>>(() => {
        const list = vehData?.vehicles ?? [];
        const entries = list.map((v: any) => [
            v.id,
            `${v.unitNumber}${v.make ? ' - ' + v.make : ''}${v.model ? ' ' + v.model : ''}`
        ]);
        return Object.fromEntries(entries);
    }, [vehData?.vehicles]);

    const live = useMemo(() => gqlData?.maintenanceRecords ?? [], [gqlData?.maintenanceRecords]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return live;
        return live.filter((r: any) => {
            const dateStr = r.serviceDate ? String(r.serviceDate).toLowerCase() : '';
            const unitOrVehicle = String(r.vehicleId ?? '').toLowerCase();
            const notes = String(r.notes ?? '').toLowerCase();
            const parts = String(r.partsUsed ?? '').toLowerCase();
            const services = Array.isArray(r.services) ? r.services.join(' ').toLowerCase() : '';
            return dateStr.includes(q) || unitOrVehicle.includes(q) || notes.includes(q) || parts.includes(q) || services.includes(q);
        });
    }, [live, search]);

    // Mutations
    const [createRec, { loading: creating }] = useMutation(CreateMaintenanceRecordDocument);
    const [updateRec, { loading: updating }] = useMutation(UpdateMaintenanceRecordDocument);
    const [deleteRec, { loading: deleting }] = useMutation(DeleteMaintenanceRecordDocument);

    // Dialog state for add/edit
    const [manualVisible, setManualVisible] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [entry, setEntry] = useState<RecordEntryState>({
        vehicleId: null,
        date: new Date(),
        services: [],
        serviceInput: '',
        maintenanceCompletionTypeId: null,
        completedBy: '',
        meterReading: '',
        laborHours: null,
        totalCost: null,
        partsUsed: '',
        notes: ''
    });

    // Ensure default maintenance completion type is set when available for new entries
    useEffect(() => {
        if (!editingId && defaultMctId && !entry.maintenanceCompletionTypeId) {
            setEntry((prev) => ({ ...prev, maintenanceCompletionTypeId: defaultMctId }));
        }
    }, [defaultMctId, editingId, entry.maintenanceCompletionTypeId]);

    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    // Refs to focus first invalid control
    const vehicleRef = useRef<any>(null);
    const dateRef = useRef<any>(null);
    const serviceInputRef = useRef<HTMLInputElement>(null);
    const maintenanceCompletionTypeRef = useRef<any>(null);
    const completedByRef = useRef<HTMLInputElement>(null);

    const resetEntry = () => {
        setEntry({
            vehicleId: null,
            date: new Date(),
            services: [],
            serviceInput: '',
            maintenanceCompletionTypeId: defaultMctId,
            completedBy: '',
            meterReading: '',
            laborHours: null,
            totalCost: null,
            partsUsed: '',
            notes: ''
        });
        setValidationErrors({});
    };

    const openAddDialog = () => {
        setEditingId(null);
        resetEntry();
        setManualVisible(true);
    };

    const openEditDialog = (rec: any) => {
        setEditingId(rec.id);
        setEntry({
            vehicleId: rec.vehicleId ?? null,
            date: rec.serviceDate
                ? new Date(
                      Number(String(rec.serviceDate).slice(0, 4)),
                      Number(String(rec.serviceDate).slice(5, 7)) - 1,
                      Number(String(rec.serviceDate).slice(8, 10))
                  )
                : new Date(),
            services: Array.isArray(rec.services) ? [...rec.services] : [],
            serviceInput: '',
            maintenanceCompletionTypeId: rec.maintenanceCompletionTypeId ?? defaultMctId,
            completedBy: rec.completedBy ?? '',
            meterReading: rec.meterReading ?? '',
            laborHours: rec.laborHours != null ? Number(rec.laborHours) : null,
            totalCost: rec.totalCost != null ? Number(rec.totalCost) : null,
            partsUsed: rec.partsUsed ?? '',
            notes: rec.notes ?? ''
        });
        setManualVisible(true);
    };

    const addService = () => {
        const s = entry.serviceInput.trim();
        if (!s) return;
        setEntry((prev) => ({ ...prev, services: [...prev.services, s], serviceInput: '' }));
        // Clear services error when adding a service
        if (validationErrors.services) {
            setValidationErrors((prev) => {
                const { services, ...rest } = prev;
                return rest;
            });
        }
    };
    const removeService = (i: number) => {
        setEntry((prev) => ({ ...prev, services: prev.services.filter((_, idx) => idx !== i) }));
    };

    async function handleSaveRecord() {
        // Normalize services (allow quick add from the single input)
        const normalizedServices = entry.services.length ? entry.services : entry.serviceInput.trim() ? [entry.serviceInput.trim()] : [];

        // Prepare object for Zod validation
        const toValidate = {
            vehicleId: entry.vehicleId ?? '',
            serviceDate: toISODate(entry.date) || '',
            maintenanceCompletionTypeId: entry.maintenanceCompletionTypeId ?? '',
            completedBy: entry.completedBy.trim(),
            services: normalizedServices
        };

        // Zod validation
        try {
            MaintenanceRecordCreateSchema.parse(toValidate);
            setValidationErrors({});
        } catch (err: any) {
            const rec = zodErrorToRecord(err);
            // Map serviceDate -> date to match UI state keys
            if ((rec as any).serviceDate) {
                (rec as any).date = (rec as any).serviceDate;
                delete (rec as any).serviceDate;
            }
            setValidationErrors(rec);
            // Focus first invalid control by priority
            if (rec.vehicleId) {
                vehicleRef.current?.focus?.();
            } else if ((rec as any).date) {
                dateRef.current?.focus?.();
            } else if (rec.services) {
                serviceInputRef.current?.focus?.();
            } else if ((rec as any).maintenanceCompletionTypeId) {
                maintenanceCompletionTypeRef.current?.focus?.();
            } else if (rec.completedBy) {
                completedByRef.current?.focus?.();
            }
            return;
        }

        try {
            if (editingId) {
                // Update
                const input = {
                    vehicleId: toValidate.vehicleId,
                    serviceDate: toValidate.serviceDate,
                    maintenanceCompletionTypeId: toValidate.maintenanceCompletionTypeId,
                    completedBy: toValidate.completedBy,
                    meterReading: entry.meterReading || null,
                    laborHours: entry.laborHours != null ? String(entry.laborHours) : null,
                    totalCost: entry.totalCost != null ? String(entry.totalCost) : null,
                    partsUsed: entry.partsUsed || null,
                    notes: entry.notes || null,
                    services: toValidate.services
                } as any;

                await updateRec({ variables: { id: editingId, input }, context: { suppressGlobalError: true } });
                toast.current?.show({ severity: 'success', summary: 'Saved', detail: 'Maintenance record updated', life: 1500 });
            } else {
                // Create
                const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;

                const input = {
                    id,
                    vehicleId: toValidate.vehicleId,
                    serviceDate: toValidate.serviceDate,
                    maintenanceCompletionTypeId: toValidate.maintenanceCompletionTypeId,
                    completedBy: toValidate.completedBy,
                    meterReading: entry.meterReading || null,
                    laborHours: entry.laborHours != null ? String(entry.laborHours) : null,
                    totalCost: entry.totalCost != null ? String(entry.totalCost) : null,
                    partsUsed: entry.partsUsed || null,
                    notes: entry.notes || null,
                    services: toValidate.services
                } as any;

                await createRec({ variables: { input }, context: { suppressGlobalError: true } });
                toast.current?.show({ severity: 'success', summary: 'Created', detail: 'Maintenance record added', life: 1500 });
            }

            setManualVisible(false);
            resetEntry();
            await refetch?.({ limit, offset });
        } catch (e: any) {
            console.error('Save maintenance record error', e);
            toast.current?.show({
                severity: 'error',
                summary: 'Save failed',
                detail: getGraphQLErrorMessage(e),
                life: 2500
            });
        }
    }

    // Delete flow
    const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<any>(null);

    const confirmDelete = (rec: any) => {
        setDeleteTarget(rec);
        setDeleteDialogVisible(true);
    };
    const handleDelete = async () => {
        if (!deleteTarget?.id) {
            setDeleteDialogVisible(false);
            setDeleteTarget(null);
            return;
        }
        try {
            await deleteRec({ variables: { id: deleteTarget.id }, context: { suppressGlobalError: true } });
            await refetch?.({ limit, offset });
            toast.current?.show({ severity: 'success', summary: 'Deleted', detail: 'Maintenance record removed', life: 1500 });
        } catch (e: any) {
            console.error('Delete maintenance record error', e);
            toast.current?.show({
                severity: 'error',
                summary: 'Delete failed',
                detail: e?.message ?? 'Unable to delete record',
                life: 2500
            });
        } finally {
            setDeleteDialogVisible(false);
            setDeleteTarget(null);
        }
    };

    const paginatorTotal = useMemo(() => {
        const pageCount = live?.length ?? 0;
        const hasNext = pageCount === limit;
        return offset + pageCount + (hasNext ? 1 : 0);
    }, [live?.length, limit, offset]);

    return (
        <div className="grid">
            <Toast ref={toast} />

            {/* Header */}
            <div className="col-12">
                <Card>
                    <div className="flex justify-content-between align-items-center mb-4">
                        <div>
                            <h2 className="m-0">Maintenance Records</h2>
                            <p className="text-500 mt-2 mb-0">Digitize and manage vehicle maintenance history</p>
                        </div>
                        <div className="flex gap-2">
                            <Button label="Add Record" icon="pi pi-plus" onClick={openAddDialog} className="p-button-success" />
                        </div>
                    </div>

                    {/* Search */}
                    <div className="mb-3">
                        <span className="p-input-icon-left">
                            <i className="pi pi-search" />
                            <InputText value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search date, services, notes..." className="w-20rem" />
                        </span>
                    </div>

                    {gqlError && <div className="p-error mb-3">Error loading maintenance records</div>}

                    {/* Records List */}
                    {filtered.length === 0 ? (
                        <div className="text-center py-6">
                            <i className="pi pi-database text-4xl text-400 mb-3"></i>
                            <div className="text-700">No maintenance records found.</div>
                        </div>
                    ) : (
                        <div className="grid">
                            {filtered.map((rec: any) => (
                                <div className="col-12 md:col-6 lg:col-3" key={rec.id}>
                                    <div className="border-1 surface-border border-round p-3 h-full flex flex-column">
                                        <div className="flex align-items-center justify-content-between mb-2">
                                            <div className="flex align-items-center gap-2">
                                                <Tag value={rec.serviceDate} severity="info" />
                                            </div>
                                            {rec.totalCost != null && <Tag value={`$${Number(rec.totalCost).toFixed(2)}`} severity="success" />}
                                        </div>

                                        <div className="text-900 font-semibold mb-2">Vehicle: {rec.vehicleId ? (vehicleLabelById[rec.vehicleId] ?? rec.vehicleId) : '—'}</div>

                                        <ul className="m-0 pl-3 flex-grow-1">
                                            {(rec.services ?? []).map((s: string, i: number) => (
                                                <li key={i} className="text-700 text-sm">
                                                    {s}
                                                </li>
                                            ))}
                                        </ul>

                                        {rec.notes && <div className="text-600 text-sm mt-2">{rec.notes}</div>}

                                        <div className="flex justify-content-end gap-2 mt-3">
                                            <Button icon="pi pi-pencil" rounded text aria-label="Edit" onClick={() => openEditDialog(rec)} />
                                            <Button icon="pi pi-trash" rounded text severity="danger" aria-label="Delete" onClick={() => confirmDelete(rec)} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Simple paginator controls (offset/limit) */}
                    <div className="flex justify-content-end align-items-center mt-3 gap-2">
                        <Button label="Prev" icon="pi pi-angle-left" className="p-button-text" disabled={offset === 0 || gqlLoading} onClick={() => setOffset(Math.max(0, offset - limit))} />
                        <span className="text-600">
                            Showing {offset + 1}-{offset + (live?.length ?? 0)} of ~{paginatorTotal}
                        </span>
                        <Button label="Next" iconPos="right" icon="pi pi-angle-right" className="p-button-text" disabled={(live?.length ?? 0) < limit || gqlLoading} onClick={() => setOffset(offset + limit)} />
                    </div>
                </Card>
            </div>

            {/* Manual entry / add-edit dialog */}
            <Dialog
                header={
                    <div className="flex align-items-center gap-2">
                        <i className="pi pi-plus text-primary"></i>
                        <span className="font-semibold">{editingId ? 'Edit Maintenance Entry' : 'Create Maintenance Entry'}</span>
                    </div>
                }
                visible={manualVisible}
                onHide={() => setManualVisible(false)}
                modal
                className="p-fluid"
                style={{ width: '80vw' }}
                footer={
                    <div className="flex justify-content-end gap-2">
                        <Button label="Cancel" text onClick={() => setManualVisible(false)} />
                        <Button label={editingId ? 'Save Changes' : 'Save Record'} icon="pi pi-check" onClick={handleSaveRecord} loading={creating || updating} />
                    </div>
                }
            >
                {/* Link to Vehicle and Date */}
                <div className="grid">
                    <div className="col-12 md:col-6 lg:col-4">
                        <label className="font-bold block mb-2">
                            Link to Vehicle <span className="text-red-500">*</span>
                        </label>
                        <Dropdown
                            value={entry.vehicleId}
                            ref={vehicleRef}
                            options={vehicleOptions}
                            onChange={(e) => {
                                setEntry((p) => ({ ...p, vehicleId: e.value }));
                                if (validationErrors.vehicleId) {
                                    setValidationErrors((prev) => {
                                        const { vehicleId, ...rest } = prev;
                                        return rest;
                                    });
                                }
                            }}
                            placeholder="Select a vehicle"
                            className={`w-full ${validationErrors.vehicleId ? 'p-invalid' : ''}`}
                            showClear
                        />
                        {validationErrors.vehicleId && <small className="p-error">{validationErrors.vehicleId}</small>}
                    </div>
                    <div className="col-12 md:col-6 lg:col-4">
                        <label className="font-bold block mb-2">
                            Maintenance Date <span className="text-red-500">*</span>
                        </label>
                        <Calendar
                            value={entry.date}
                            ref={dateRef}
                            onChange={(e) => {
                                setEntry((p) => ({ ...p, date: (e.value as Date) || new Date() }));
                                if (validationErrors.date) {
                                    setValidationErrors((prev) => {
                                        const { date, ...rest } = prev;
                                        return rest;
                                    });
                                }
                            }}
                            showIcon
                            dateFormat="mm/dd/yy"
                            className={`w-full ${validationErrors.date ? 'p-invalid' : ''}`}
                        />
                        {validationErrors.date && <small className="p-error">{validationErrors.date}</small>}
                    </div>
                </div>

                {/* Services Performed */}
                <div className="mt-3">
                    <label className="font-bold block mb-2">
                        Services Performed <span className="text-red-500">*</span>
                    </label>

                    {/* First quick input */}
                    <div className="mb-2">
                        <InputText
                            value={entry.serviceInput}
                            ref={serviceInputRef}
                            onChange={(e) => setEntry((p) => ({ ...p, serviceInput: e.target.value }))}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    addService();
                                }
                            }}
                            placeholder="Enter service..."
                            className={`w-full ${validationErrors.services ? 'p-invalid' : ''}`}
                        />
                    </div>

                    {/* Added services list */}
                    {entry.services.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                            {entry.services.map((s, idx) => (
                                <div key={idx} className="inline-flex align-items-center gap-2 px-2 py-1 border-1 surface-border border-round">
                                    <span className="text-700 text-sm">{s}</span>
                                    <Button icon="pi pi-times" size="small" text rounded onClick={() => removeService(idx)} />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Dashed add new service area */}
                    <div className="p-2 border-1 border-round" style={{ borderStyle: 'dashed' }}>
                        <div className="p-inputgroup">
                            <InputText value={entry.serviceInput} onChange={(e) => setEntry((p) => ({ ...p, serviceInput: e.target.value }))} placeholder="Add new service..." />
                            <Button icon="pi pi-plus" onClick={addService} />
                        </div>
                    </div>
                    {validationErrors.services && <small className="p-error">{validationErrors.services}</small>}
                </div>

                {/* Completion Details */}
                <div className="mt-4">
                    <h3 className="mb-3 text-900">Completion Details</h3>

                    <div className="grid">
                        <div className="col-12 md:col-4">
                            <label className="font-bold block mb-2">
                                Completion Type <span className="text-red-500">*</span>
                            </label>
                            <Dropdown
                                value={entry.maintenanceCompletionTypeId}
                                ref={maintenanceCompletionTypeRef}
                                options={maintenanceCompletionTypeOptions}
                                optionLabel="label"
                                optionValue="value"
                                onChange={(e) => {
                                    setEntry((p) => ({ ...p, maintenanceCompletionTypeId: e.value as string }));
                                    if ((validationErrors as any).maintenanceCompletionTypeId) {
                                        setValidationErrors((prev) => {
                                            const { maintenanceCompletionTypeId, ...rest }: any = prev as any;
                                            return rest;
                                        });
                                    }
                                }}
                                className={`w-full ${(validationErrors as any).maintenanceCompletionTypeId ? 'p-invalid' : ''}`}
                                placeholder="Select maintenance completion type"
                            />
                            {(validationErrors as any).maintenanceCompletionTypeId && <small className="p-error">{(validationErrors as any).maintenanceCompletionTypeId}</small>}
                        </div>
                        <div className="col-12 md:col-4">
                            <label className="font-bold block mb-2">
                                Completed By <span className="text-red-500">*</span>
                            </label>
                            <InputText
                                value={entry.completedBy}
                                ref={completedByRef}
                                onChange={(e) => {
                                    setEntry((p) => ({ ...p, completedBy: e.target.value }));
                                    if (validationErrors.completedBy) {
                                        setValidationErrors((prev) => {
                                            const { completedBy, ...rest } = prev;
                                            return rest;
                                        });
                                    }
                                }}
                                placeholder="Name or shop"
                                className={`w-full ${validationErrors.completedBy ? 'p-invalid' : ''}`}
                            />
                            {validationErrors.completedBy && <small className="p-error">{validationErrors.completedBy}</small>}
                        </div>
                        <div className="col-12 md:col-4">
                            <label className="font-bold block mb-2">Meter Reading (miles)</label>
                            <InputText value={entry.meterReading} onChange={(e) => setEntry((p) => ({ ...p, meterReading: e.target.value }))} placeholder="Current mileage" className="w-full" />
                        </div>

                        <div className="col-12 md:col-4">
                            <label className="font-bold block mb-2">Labor Hours</label>
                            <InputNumber
                                value={entry.laborHours ?? undefined}
                                onValueChange={(e) => setEntry((p) => ({ ...p, laborHours: e.value ?? null }))}
                                placeholder="e.g. 2.5"
                                className="w-full"
                                mode="decimal"
                                minFractionDigits={1}
                                maxFractionDigits={2}
                            />
                        </div>
                        <div className="col-12 md:col-4">
                            <label className="font-bold block mb-2">Total Cost</label>
                            <InputNumber value={entry.totalCost ?? undefined} onValueChange={(e) => setEntry((p) => ({ ...p, totalCost: e.value ?? null }))} placeholder="e.g. 150.00" className="w-full" mode="currency" currency="USD" locale="en-US" />
                        </div>
                    </div>

                    <div className="grid mt-2">
                        <div className="col-12 md:col-6">
                            <label className="font-bold block mb-2">Parts Used</label>
                            <InputTextarea autoResize rows={3} value={entry.partsUsed} onChange={(e) => setEntry((p) => ({ ...p, partsUsed: e.target.value }))} placeholder="List parts and quantities used..." className="w-full" />
                        </div>
                        <div className="col-12 md:col-6">
                            <label className="font-bold block mb-2">Notes</label>
                            <InputTextarea autoResize rows={3} value={entry.notes} onChange={(e) => setEntry((p) => ({ ...p, notes: e.target.value }))} placeholder="Additional notes, observations, or recommendations..." className="w-full" />
                        </div>
                    </div>
                </div>
            </Dialog>

            {/* Delete dialog */}
            <Dialog
                visible={deleteDialogVisible}
                header="Delete Maintenance Record"
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
                <p>Are you sure you want to delete this maintenance record?</p>
            </Dialog>
        </div>
    );
}
