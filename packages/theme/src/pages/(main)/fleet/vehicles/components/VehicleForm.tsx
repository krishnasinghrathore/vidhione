import React, { useEffect, useMemo, useRef, useState } from 'react';
import DocumentUploader from '../../../../../components/documents/DocumentUploader';
import type { DocumentUploaderHandle } from '../../../../../components/documents/DocumentUploader';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Message } from 'primereact/message';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { useMutation, useQuery } from '@apollo/client/react';
import { useNavigate, useParams } from 'react-router-dom';
import { CreateVehicleDocument, UpdateVehicleDocument, VehicleDocument } from '../../../../../graphql/vehicles/operations.generated';
import { DriversDocument } from '../../../../../graphql/drivers/operations.generated';
import { uploadAttachment } from '../../../../../lib/upload';
import { VehicleCreateSchema } from '../../../../../validation/vehicle';
import { zodErrorToRecord } from '../../../../../validation/utils';
import { getGraphQLErrorMessage } from '../../../../../lib/errors';
import { listAttachments, getAttachmentContent, deleteAttachment, type AttachmentListItem } from '../../../../../lib/attachments';

type VehicleFormProps = {
    id?: string; // explicit id (optional); otherwise read from useParams
};

type VehicleVM = {
    id: string; // UUID (read-only in edit)
    unitNumber: string;
    make: string;
    model: string;
    year: number | null;
    plateNumber: string;
    vin: string;
    tireSize: string;
    lessorOwner: string;
    registrationExpires: Date | null;
    inspectionExpires: Date | null;
    status: 'operational' | 'maintenance' | 'out_of_service';
    mileage: number | null;
    driverId: string | null; // optional FK to driver

    // Optional uploads (not wired yet; reserved for future REST upload flow)
    titleDocument: File | null;
    registrationDocument: File | null;
    inspectionDocument: File | null;
};

export default function VehicleForm(props: VehicleFormProps) {
    const navigate = useNavigate();
    const routeParams = useParams();
    const recordId = (props.id ?? (routeParams.id as string | undefined)) || undefined;
    const isEdit = !!recordId;
    const toast = useRef<Toast>(null);

    // Optional: upload vehicle documents to REST /upload
    const uploadVehicleDocs = async (ownerId: string) => {
        const tasks: Promise<any>[] = [];
        const push = (file: File | null, docType: string) => {
            if (file) {
                tasks.push(
                    uploadAttachment({
                        ownerType: 'vehicle',
                        ownerId,
                        docType: docType as any,
                        file
                    })
                );
            }
        };
        // existing single-file slots
        push(vehicle.titleDocument, 'title_document');
        push(vehicle.registrationDocument, 'registration_document');
        push(vehicle.inspectionDocument, 'inspection_document');
        // staged replacements
        for (const s of stagedUploads) {
            push(s.file, s.docType);
        }

        if (tasks.length === 0) return;

        const results = await Promise.allSettled(tasks);
        const ok = results.filter((r) => r.status === 'fulfilled').length;
        const fail = results.length - ok;
        if (ok > 0) {
            toast.current?.show({ severity: 'success', summary: 'Uploaded', detail: `Uploaded ${ok} document(s)`, life: 1500 });
        }
        if (fail > 0) {
            toast.current?.show({ severity: 'warn', summary: 'Upload issues', detail: `${fail} upload(s) failed`, life: 2500 });
        }
    };

    const normalizeApiStatus = (s?: string | null): 'operational' | 'maintenance' | 'out_of_service' => {
        if (!s) return 'operational';
        const v = String(s).trim().toLowerCase().replace(/\s+/g, '_');
        if (v === 'maintenance') return 'maintenance';
        if (v === 'out_of_service') return 'out_of_service';
        return 'operational';
    };

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ severity: 'success' | 'error' | 'info' | 'warn'; text: string } | null>(null);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    // Big preview dialog
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewSrc, setPreviewSrc] = useState<string | null>(null);
    const [previewTitle, setPreviewTitle] = useState<string>('');
    const [previewType, setPreviewType] = useState<string | undefined>(undefined);

    // Existing uploaded documents (attachments) and preview cache
    const [attachmentsList, setAttachmentsList] = useState<AttachmentListItem[]>([]);
    const [attachmentPreviews, setAttachmentPreviews] = useState<Record<string, string>>({});
    // Defer delete until user clicks "Save Changes"
    const [pendingDeletes, setPendingDeletes] = useState<Set<string>>(new Set());
    const [stagedUploads, setStagedUploads] = useState<{ docType: string; file: File }[]>([]);
    // Confirm remove dialog state
    const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false);
    const [removeTarget, setRemoveTarget] = useState<AttachmentListItem | null>(null);

    // Refs to focus first invalid control
    const unitNumberRef = useRef<HTMLInputElement>(null);
    const vinRef = useRef<HTMLInputElement>(null);
    const statusRef = useRef<any>(null);

    // Documents uploader ref and validation state
    const docUploaderRef = useRef<DocumentUploaderHandle>(null);
    const [docsOk, setDocsOk] = useState(true);
    const [missingDocNames, setMissingDocNames] = useState<string[]>([]);

    const [createVehicle] = useMutation(CreateVehicleDocument);
    const [updateVehicle] = useMutation(UpdateVehicleDocument);

    // When editing, fetch the vehicle to prefill the form
    const { data: vehicleData, loading: vehicleLoading } = useQuery(VehicleDocument, {
        variables: { id: recordId as string },
        skip: !isEdit || !recordId
    });

    // Fetch drivers for dropdown
    const { data: driversData } = useQuery(DriversDocument, {
        variables: { limit: 200, offset: 0 }
    });

    const [vehicle, setVehicle] = useState<VehicleVM>({
        id: '',
        unitNumber: '',
        make: '',
        model: '',
        year: new Date().getFullYear(),
        plateNumber: '',
        vin: '',
        tireSize: '',
        lessorOwner: '',
        registrationExpires: null,
        inspectionExpires: null,
        status: 'operational',
        mileage: 0,
        driverId: null,

        titleDocument: null,
        registrationDocument: null,
        inspectionDocument: null
    });

    const [prefilled, setPrefilled] = useState(false);

    // Prefill once
    useEffect(() => {
        if (!isEdit || !vehicleData?.vehicle || prefilled) return;
        const v = vehicleData.vehicle as any;
        setVehicle((prev) => ({
            ...prev,
            id: v.id,
            unitNumber: v.unitNumber ?? '',
            make: v.make ?? '',
            model: v.model ?? '',
            year: typeof v.year === 'number' ? v.year : v.year ? Number(v.year) : null,
            plateNumber: v.plateNumber ?? '',
            vin: v.vin ?? '',
            tireSize: v.tireSize ?? '',
            lessorOwner: v.lessorOwner ?? '',
            registrationExpires: v.registrationExpires ? new Date(v.registrationExpires) : null,
            inspectionExpires: v.inspectionExpires ? new Date(v.inspectionExpires) : null,
            status: normalizeApiStatus(v.status),
            mileage: typeof v.mileage === 'number' ? v.mileage : v.mileage ? Number(v.mileage) : null,
            driverId: v.driverId ?? null
        }));
        setPrefilled(true);
    }, [isEdit, recordId, vehicleData?.vehicle, prefilled]);

    // Load existing attachments when editing
    useEffect(() => {
        const run = async () => {
            if (!isEdit || !recordId) return;
            try {
                const res = await listAttachments('vehicle', recordId);
                setAttachmentsList(res || []);
            } catch (err: any) {
                const msg = getGraphQLErrorMessage(err);
                toast.current?.show({ severity: 'warn', summary: 'Documents', detail: msg, life: 2000 });
            }
        };
        run();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEdit, recordId, prefilled]);

    const statusOptions = [
        { label: 'Operational', value: 'operational' },
        { label: 'Maintenance', value: 'maintenance' },
        { label: 'Out of Service', value: 'out_of_service' }
    ];

    const driverOptions = useMemo(() => {
        const options = (driversData?.drivers ?? []).map((driver: any) => ({
            label: `${driver.fullName} (${driver.driverCode})`,
            value: driver.id
        }));
        // Add "No driver assigned" option
        options.unshift({ label: 'No driver assigned', value: null });
        return options;
    }, [driversData?.drivers]);

    const toISO = (d: Date | null) => (d ? new Date(d).toISOString() : null);

    // Format bytes into human-readable KB/MB/GB
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

    // VIN helpers: normalize and validate (NHTSA 17-character VIN excluding I, O, Q)
    const normalizeVin = (v: string) => v.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    const isValidVin = (v?: string | null) => !!v && /^[A-HJ-NPR-Z0-9]{17}$/.test((v || '').toUpperCase());

    // Attachments preview helpers
    const isImage = (ct?: string | null) => !!ct && /^image\//i.test(ct);
    const loadPreview = async (id: string): Promise<string | undefined> => {
        try {
            if (attachmentPreviews[id]) return attachmentPreviews[id];
            const res = await getAttachmentContent(id);
            setAttachmentPreviews((prev) => ({ ...prev, [id]: res.contentBase64 }));
            return res.contentBase64;
        } catch (err: any) {
            const msg = getGraphQLErrorMessage(err);
            toast.current?.show({ severity: 'warn', summary: 'Preview', detail: msg, life: 2000 });
            return undefined;
        }
    };
    const openPreview = async (a: AttachmentListItem) => {
        const src = (await loadPreview(a.id)) ?? attachmentPreviews[a.id];
        if (!src) return;
        setPreviewTitle(a.fileName);
        setPreviewType(a.contentType || undefined);
        setPreviewSrc(src);
        setPreviewOpen(true);
    };

    // Mark/unmark delete (deferred until Save)
    const markDelete = (a: AttachmentListItem) => {
        setPendingDeletes((prev) => {
            const next = new Set(prev);
            next.add(a.id);
            return next;
        });
    };
    const undoDelete = (a: AttachmentListItem) => {
        setPendingDeletes((prev) => {
            const next = new Set(prev);
            next.delete(a.id);
            return next;
        });
    };
    const requestMarkDelete = (a: AttachmentListItem) => {
        setRemoveTarget(a);
        setConfirmRemoveOpen(true);
    };
    const confirmMarkDelete = () => {
        if (removeTarget) {
            markDelete(removeTarget);
        }
        setConfirmRemoveOpen(false);
        setRemoveTarget(null);
    };
    // Remove and Replace handler: mark old for deletion and stage new upload
    const handleReplaceFile = (a: AttachmentListItem, file: File | null) => {
        if (!file) return;
        markDelete(a);
        setStagedUploads((prev) => [...prev, { docType: a.docType || 'misc_document', file }]);
        toast.current?.show({ severity: 'info', summary: 'Staged', detail: `New file staged to replace ${a.fileName}`, life: 1500 });
    };

    const onFileSelect = (e: any, field: keyof VehicleVM) => {
        const file = e.files?.[0];
        setVehicle((prev) => ({ ...prev, [field]: file ?? null } as VehicleVM));
    };

    const onFileClear = (field: keyof VehicleVM) => {
        setVehicle((prev) => ({ ...prev, [field]: null }));
    };

    const handleCancel = () => {
        navigate('/fleet/vehicles/list');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isEdit && vehicleLoading) {
            setMessage({ severity: 'warn', text: 'Loading existing vehicle. Please wait and try again.' });
            toast.current?.show({ severity: 'warn', summary: 'Please wait', detail: 'Loading existing vehicle. Try again shortly.', life: 2000 });
            return;
        }

        const toValidate = {
            unitNumber: vehicle.unitNumber.trim(),
            status: vehicle.status,
            vin: normalizeVin(vehicle.vin)
        };

        try {
            VehicleCreateSchema.parse(toValidate);
            setValidationErrors({});
        } catch (err: any) {
            const rec = zodErrorToRecord(err);
            setValidationErrors(rec);
            // Focus first invalid control by priority
            if (rec.unitNumber) {
                unitNumberRef.current?.focus?.();
            } else if (rec.status) {
                statusRef.current?.focus?.();
            } else if (rec.vin) {
                vinRef.current?.focus?.();
            }
            return;
        }

        setLoading(true);
        try {
            if (isEdit && recordId) {
                // Update existing
                const input = {
                    unitNumber: vehicle.unitNumber || null,
                    make: vehicle.make || null,
                    model: vehicle.model || null,
                    year: vehicle.year ?? null,
                    plateNumber: vehicle.plateNumber || null,
                    vin: vehicle.vin || null,
                    tireSize: vehicle.tireSize || null,
                    lessorOwner: vehicle.lessorOwner || null,
                    registrationExpires: toISO(vehicle.registrationExpires),
                    inspectionExpires: toISO(vehicle.inspectionExpires),
                    status: vehicle.status || null,
                    mileage: vehicle.mileage ?? null,
                    driverId: vehicle.driverId ?? null
                } as any;

                await updateVehicle({ variables: { id: recordId, input }, context: { suppressGlobalError: true } });

                // Commit staged document changes (uploads + deletes)
                try {
                    await docUploaderRef.current?.commit(recordId);
                } catch (e) {
                    console.error('Document commit error', e);
                }

                // Apply deferred deletions
                if (pendingDeletes.size > 0) {
                    try {
                        const ids = Array.from(pendingDeletes);
                        await Promise.all(ids.map((id) => deleteAttachment(id)));
                    } catch (e) {
                        console.error('Deferred delete error', e);
                    }
                    setPendingDeletes(new Set());
                }
                // Clear staged uploads after successful save
                setStagedUploads([]);

                setMessage({ severity: 'success', text: 'Vehicle updated successfully!' });
                toast.current?.show({ severity: 'success', summary: 'Saved', detail: 'Vehicle updated successfully', life: 1500 });
                setTimeout(() => navigate('/fleet/vehicles/list'), 800);
            } else {
                // Create new
                const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
                const input = {
                    id,
                    unitNumber: vehicle.unitNumber,
                    make: vehicle.make || null,
                    model: vehicle.model || null,
                    year: vehicle.year ?? null,
                    plateNumber: vehicle.plateNumber || null,
                    vin: vehicle.vin || null,
                    tireSize: vehicle.tireSize || null,
                    lessorOwner: vehicle.lessorOwner || null,
                    registrationExpires: toISO(vehicle.registrationExpires),
                    inspectionExpires: toISO(vehicle.inspectionExpires),
                    status: vehicle.status,
                    mileage: vehicle.mileage ?? null,
                    driverId: vehicle.driverId ?? null
                } as any;

                await createVehicle({ variables: { input }, context: { suppressGlobalError: true } });

                // Commit staged document changes after create with the new id
                try {
                    await docUploaderRef.current?.commit(id);
                } catch (e) {
                    console.error('Document commit error', e);
                }

                setMessage({ severity: 'success', text: 'Vehicle created successfully!' });
                toast.current?.show({ severity: 'success', summary: 'Created', detail: 'Vehicle created successfully', life: 1500 });
                setTimeout(() => navigate('/fleet/vehicles/list'), 800);
            }
        } catch (err) {
            console.error(isEdit ? 'UpdateVehicle error' : 'CreateVehicle error', err);
            const msg = getGraphQLErrorMessage(err);
            setMessage({ severity: 'error', text: msg });
            toast.current?.show({ severity: 'error', summary: 'Save failed', detail: msg, life: 2500 });

            // Heuristic: focus the field indicated by the server error
            const m = String(msg || '').toLowerCase();
            if (m.includes('unit number')) {
                unitNumberRef.current?.focus?.();
            } else if (m.includes('status')) {
                statusRef.current?.focus?.();
            } else if (m.includes('vin')) {
                vinRef.current?.focus?.();
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid">
            <div className="col-12">
                <Card>
                    <Toast ref={toast} />
                    <div className="flex justify-content-between align-items-center mb-4">
                        <div>
                            <h2 className="m-0">{isEdit ? 'Edit Vehicle' : 'Add New Vehicle'}</h2>
                            <p className="text-500 mt-2 mb-0">{isEdit ? 'Update fleet vehicle information' : 'Create a new fleet vehicle record'}</p>
                        </div>
                        <Button label="Back to Vehicles" icon="pi pi-arrow-left" onClick={handleCancel} className="p-button-outlined" />
                    </div>

                    {message && <Message severity={message.severity} text={message.text} className="mb-4" />}
                    {isEdit && vehicleLoading && (
                        <div className="mb-3">
                            <i className="pi pi-spin pi-spinner mr-2" /> Loading existing vehicle...
                        </div>
                    )}

                    <form onSubmit={handleSubmit} noValidate>
                        <div className="grid">
                            <div className="col-12">
                                <h3 className="mb-3">Vehicle Information</h3>
                            </div>

                            <div className="col-12 md:col-4">
                                <label htmlFor="unitNumber" className="font-bold block mb-2">
                                    Unit Number *
                                </label>
                                <InputText
                                    id="unitNumber"
                                    value={vehicle.unitNumber}
                                    ref={unitNumberRef}
                                    onChange={(e) => {
                                        setVehicle((prev) => ({ ...prev, unitNumber: e.target.value }));
                                        if (validationErrors.unitNumber) {
                                            setValidationErrors((prev) => {
                                                const { unitNumber, ...rest } = prev;
                                                return rest;
                                            });
                                        }
                                    }}
                                    placeholder="e.g., 236"
                                    className={`w-full ${validationErrors.unitNumber ? 'p-invalid' : ''}`}
                                />
                                {validationErrors.unitNumber && <small className="p-error">{validationErrors.unitNumber}</small>}
                            </div>

                            <div className="col-12 md:col-4">
                                <label htmlFor="make" className="font-bold block mb-2">
                                    Make
                                </label>
                                <InputText id="make" value={vehicle.make} onChange={(e) => setVehicle((prev) => ({ ...prev, make: e.target.value }))} placeholder="e.g., Ford" className="w-full" />
                            </div>

                            <div className="col-12 md:col-4">
                                <label htmlFor="model" className="font-bold block mb-2">
                                    Model
                                </label>
                                <InputText id="model" value={vehicle.model} onChange={(e) => setVehicle((prev) => ({ ...prev, model: e.target.value }))} placeholder="e.g., F-150" className="w-full" />
                            </div>

                            <div className="col-12 md:col-4">
                                <label htmlFor="year" className="font-bold block mb-2">
                                    Year
                                </label>
                                <InputNumber
                                    id="year"
                                    value={vehicle.year ?? undefined}
                                    onValueChange={(e) => setVehicle((prev) => ({ ...prev, year: (e.value as number) ?? null }))}
                                    min={1990}
                                    max={new Date().getFullYear() + 1}
                                    className="w-full"
                                    mode="decimal"
                                    minFractionDigits={0}
                                    maxFractionDigits={0}
                                    useGrouping={false}
                                />
                            </div>

                            <div className="col-12 md:col-4">
                                <label htmlFor="plateNumber" className="font-bold block mb-2">
                                    Plate Number
                                </label>
                                <InputText id="plateNumber" value={vehicle.plateNumber} onChange={(e) => setVehicle((prev) => ({ ...prev, plateNumber: e.target.value }))} placeholder="e.g., ABC-1234" className="w-full" />
                            </div>

                            <div className="col-12 md:col-4">
                                <label htmlFor="vin" className="font-bold block mb-2">
                                    VIN *
                                </label>
                                <InputText
                                    id="vin"
                                    value={vehicle.vin}
                                    ref={vinRef}
                                    onChange={(e) => {
                                        setVehicle((prev) => ({ ...prev, vin: normalizeVin(e.target.value) }));
                                        if (validationErrors.vin) {
                                            setValidationErrors((prev) => {
                                                const { vin, ...rest } = prev;
                                                return rest;
                                            });
                                        }
                                    }}
                                    placeholder="17-character VIN"
                                    maxLength={17}
                                    className={`w-full ${validationErrors.vin ? 'p-invalid' : ''}`}
                                />
                                {validationErrors.vin && <small className="p-error">{validationErrors.vin}</small>}
                            </div>

                            <div className="col-12 md:col-4">
                                <label htmlFor="tireSize" className="font-bold block mb-2">
                                    Tire Size
                                </label>
                                <InputText id="tireSize" value={vehicle.tireSize} onChange={(e) => setVehicle((prev) => ({ ...prev, tireSize: e.target.value }))} placeholder="e.g., 275/70R18" className="w-full" />
                            </div>

                            <div className="col-12 md:col-4">
                                <label htmlFor="lessorOwner" className="font-bold block mb-2">
                                    Name of Lessor/Owner
                                </label>
                                <InputText id="lessorOwner" value={vehicle.lessorOwner} onChange={(e) => setVehicle((prev) => ({ ...prev, lessorOwner: e.target.value }))} placeholder="e.g., ABC Leasing Corp" className="w-full" />
                            </div>

                            <div className="col-12 md:col-4">
                                <label htmlFor="registrationExpires" className="font-bold block mb-2">
                                    Registration Expiration
                                </label>
                                <Calendar
                                    id="registrationExpires"
                                    value={vehicle.registrationExpires}
                                    onChange={(e) => setVehicle((prev) => ({ ...prev, registrationExpires: (e.value as Date) ?? null }))}
                                    showIcon
                                    dateFormat="mm/dd/yy"
                                    placeholder="mm/dd/yyyy"
                                    className="w-full"
                                />
                            </div>

                            <div className="col-12 md:col-4">
                                <label htmlFor="inspectionExpires" className="font-bold block mb-2">
                                    Inspection Expiration
                                </label>
                                <Calendar
                                    id="inspectionExpires"
                                    value={vehicle.inspectionExpires}
                                    onChange={(e) => setVehicle((prev) => ({ ...prev, inspectionExpires: (e.value as Date) ?? null }))}
                                    showIcon
                                    dateFormat="mm/dd/yy"
                                    placeholder="mm/dd/yyyy"
                                    className="w-full"
                                />
                            </div>

                            <div className="col-12 md:col-4">
                                <label htmlFor="status" className="font-bold block mb-2">
                                    Status *
                                </label>
                                <Dropdown
                                    id="status"
                                    value={vehicle.status}
                                    ref={statusRef}
                                    options={statusOptions}
                                    optionLabel="label"
                                    optionValue="value"
                                    onChange={(e) => {
                                        setVehicle((prev) => ({ ...prev, status: (e?.value as any)?.value ?? e.value }));
                                        if (validationErrors.status) {
                                            setValidationErrors((prev) => {
                                                const { status, ...rest } = prev;
                                                return rest;
                                            });
                                        }
                                    }}
                                    placeholder="Select Status"
                                    className={`w-full ${validationErrors.status ? 'p-invalid' : ''}`}
                                />
                                {validationErrors.status && <small className="p-error">{validationErrors.status}</small>}
                            </div>

                            <div className="col-12 md:col-4">
                                <label htmlFor="mileage" className="font-bold block mb-2">
                                    Mileage
                                </label>
                                <InputNumber id="mileage" value={vehicle.mileage ?? undefined} onValueChange={(e) => setVehicle((prev) => ({ ...prev, mileage: (e.value as number) ?? null }))} min={0} suffix=" miles" className="w-full" />
                            </div>

                            <div className="col-12 md:col-4">
                                <label htmlFor="driverId" className="font-bold block mb-2">
                                    Driver
                                </label>
                                <Dropdown
                                    id="driverId"
                                    value={vehicle.driverId}
                                    options={driverOptions}
                                    optionLabel="label"
                                    optionValue="value"
                                    onChange={(e) => setVehicle((prev) => ({ ...prev, driverId: e.value }))}
                                    placeholder="Select a driver"
                                    className="w-full"
                                    showClear
                                />
                            </div>

                            {/* Dynamic Documents (assigned types, multiple uploads) */}
                            <div className="col-12">
                                <h3 className="mb-3 mt-4">Vehicle Documents</h3>
                                <DocumentUploader
                                    ref={docUploaderRef}
                                    module="vehicle"
                                    entityId={recordId as string}
                                    onValidityChange={(ok, names) => {
                                        setDocsOk(!!ok);
                                        setMissingDocNames(Array.isArray(names) ? names : []);
                                    }}
                                />
                                {isEdit && !docsOk && (
                                    <div className="mt-2">
                                        <Message severity="warn" text={`Missing mandatory document(s): ${missingDocNames.join(', ')}`} />
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="col-12">
                                <div className="flex justify-content-end gap-3 mt-4">
                                    <Button type="button" label="Cancel" icon="pi pi-times" onClick={handleCancel} className="p-button-outlined" />
                                    <Button
                                        type="submit"
                                        label={isEdit ? 'Save Changes' : 'Create Vehicle'}
                                        icon={isEdit ? 'pi pi-save' : 'pi pi-plus'}
                                        loading={loading}
                                        disabled={loading || (isEdit && vehicleLoading) || (isEdit && !docsOk)}
                                        className="p-button-success"
                                    />
                                </div>
                            </div>
                        </div>
                    </form>
                    {/* Big preview dialog */}
                    <Dialog header={previewTitle} visible={previewOpen} onHide={() => setPreviewOpen(false)} style={{ width: '90vw', maxWidth: '1000px' }} dismissableMask>
                        {previewSrc ? (
                            isImage(previewType) ? (
                                <img src={previewSrc} alt={previewTitle} style={{ maxWidth: '100%', maxHeight: '80vh' }} />
                            ) : (
                                <object data={previewSrc} type={previewType || 'application/octet-stream'} width="100%" height="80vh">
                                    <a href={previewSrc} download={previewTitle}>
                                        Download {previewTitle}
                                    </a>
                                </object>
                            )
                        ) : (
                            <div className="text-600">No preview available.</div>
                        )}
                    </Dialog>

                    {/* Confirm mark remove */}
                    <Dialog header="Confirm removal" visible={confirmRemoveOpen} onHide={() => setConfirmRemoveOpen(false)} style={{ width: '420px' }} modal>
                        <p>Mark "{removeTarget?.fileName}" for removal? It will be deleted when you save.</p>
                        <div className="flex justify-content-end gap-2 mt-3">
                            <Button label="Cancel" text onClick={() => setConfirmRemoveOpen(false)} />
                            <Button label="Mark for Removal" icon="pi pi-trash" severity="danger" onClick={confirmMarkDelete} />
                        </div>
                    </Dialog>
                </Card>
            </div>
        </div>
    );
}
