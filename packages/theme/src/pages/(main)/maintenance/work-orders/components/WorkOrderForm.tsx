import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Message } from 'primereact/message';
import { Toast } from 'primereact/toast';
import { useMutation, useQuery } from '@apollo/client/react';
import { useNavigate, useParams } from 'react-router-dom';
import { CreateWorkOrderDocument, UpdateWorkOrderDocument, WorkOrderDocument } from '../../../../../graphql/workOrders/operations.generated';
import { VehiclesDocument } from '../../../../../graphql/vehicles/operations.generated';
import { DriversDocument } from '../../../../../graphql/drivers/operations.generated';
import { WorkOrderCreateSchema, WorkOrderUpdateSchema } from '../../../../../validation/workorder';
import { zodErrorToRecord } from '../../../../../validation/utils';
import { getGraphQLErrorMessage } from '../../../../../lib/errors';
import { gql } from '@apollo/client';

const WORK_ORDER_PRIORITIES = gql`
  query WorkOrderPriorities {
    workOrderPriorities {
      id
      name
      isDefault
      active
    }
  }
`;

const WORK_ORDER_STATUSES = gql`
  query WorkOrderStatuses {
    workOrderStatuses {
      id
      name
      isDefault
      active
    }
  }
`;

type WorkOrderFormProps = {
    id?: string;
};

type WorkOrderVM = {
    id: string;
    number: string;
    vehicleId: string;
    taskName: string;
    description: string;
    priority: string;
    dueDate: Date | null;
    dueMeterReading: string;
    estLaborHours: number | null;
    estCost: number | null;
    status: string;
    assignedTo: string;
    notes: string;
};

export default function WorkOrderForm(props: WorkOrderFormProps) {
    const navigate = useNavigate();
    const routeParams = useParams();
    const recordId = (props.id ?? (routeParams.id as string | undefined)) || undefined;
    const isEdit = !!recordId;
    const toast = useRef<Toast>(null);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ severity: 'success' | 'error' | 'info' | 'warn'; text: string } | null>(null);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    // Focus helpers (align behavior with other forms)
    const focusElementById = (id: string) => {
        try {
            const el = document.getElementById(id) as HTMLElement | null;
            if (el) {
                // Try direct focus
                (el as any)?.focus?.();
                // If wrapper (e.g., PrimeReact), focus the inner input
                const input = el.querySelector('input') as HTMLInputElement | null;
                input?.focus?.();
                // Ensure field is visible
                (input || el)?.scrollIntoView?.({ block: 'center', behavior: 'smooth' });
            }
        } catch {}
    };

    const focusFirstInvalid = (rec: Record<string, string>) => {
        // Priority order for focusing first invalid field
        const order = ['vehicleId', 'taskName', 'dueDateIso', 'estLaborHours', 'estCost', 'priority', 'status', 'number'];
        for (const key of order) {
            if (rec[key]) {
                switch (key) {
                    case 'vehicleId':
                        focusElementById('vehicleId');
                        return;
                    case 'taskName':
                        focusElementById('taskName');
                        return;
                    case 'dueDateIso':
                        focusElementById('dueDate');
                        return;
                    case 'estLaborHours':
                        focusElementById('estLaborHours');
                        return;
                    case 'estCost':
                        focusElementById('estCost');
                        return;
                    case 'priority':
                        focusElementById('priority');
                        return;
                    case 'status':
                        focusElementById('status');
                        return;
                    case 'number':
                        focusElementById('number');
                        return;
                }
            }
        }
    };

    // Fallback: parse number from the actual input element even if state hasn't been committed yet.
    // Works for PrimeReact InputNumber where id is set on the inner input element.
    const parseNumericFromInput = (elementId: string): number | null => {
        try {
            const el = document.getElementById(elementId);
            let raw = '';
            if (el && (el as HTMLInputElement).value !== undefined) {
                // The ID is on the input itself
                raw = (el as HTMLInputElement).value ?? '';
            } else {
                // The ID is on a wrapper; try to find the input inside
                const input = el?.querySelector('input') as HTMLInputElement | null;
                raw = input?.value ?? '';
            }
            const n = Number(String(raw).replace(/[^0-9.-]/g, ''));
            return Number.isFinite(n) ? n : null;
        } catch {
            return null;
        }
    };

    const [createWorkOrder] = useMutation(CreateWorkOrderDocument);
    const [updateWorkOrder] = useMutation(UpdateWorkOrderDocument);

    // Fetch WorkOrder for edit
    const { data: woData, loading: woLoading } = useQuery(WorkOrderDocument, {
        variables: { id: recordId as string },
        skip: !isEdit || !recordId
    });

    // Fetch some vehicles for dropdown
    const { data: vehData } = useQuery(VehiclesDocument, {
        variables: { limit: 100, offset: 0 }
    });

    // Fetch drivers for Assigned To dropdown (fast load, offsets similar to Vehicles/Drivers lists)
    const { data: driversData } = useQuery(DriversDocument, {
        variables: { limit: 500, offset: 0 }
    });

    // DB-driven lookups for priority & status
    const { data: prioritiesData } = useQuery<{ workOrderPriorities: { id: string; name: string; isDefault: boolean; active: boolean }[] }>(
        WORK_ORDER_PRIORITIES
    );
    const { data: statusesData } = useQuery<{ workOrderStatuses: { id: string; name: string; isDefault: boolean; active: boolean }[] }>(
        WORK_ORDER_STATUSES
    );

    const vehicleOptions = useMemo(
        () =>
            (vehData?.vehicles ?? []).map((v: any) => ({
                label: `${v.unitNumber}${v.make ? ' - ' + v.make : ''}${v.model ? ' ' + v.model : ''}`,
                value: v.id
            })),
        [vehData?.vehicles]
    );

    const driverOptions = useMemo(
        () =>
            (driversData?.drivers ?? []).map((d: any) => ({
                label: `${d.fullName}${d.driverCode ? ' (' + d.driverCode + ')' : ''}`,
                value: d.id
            })),
        [driversData?.drivers]
    );

    const [prefilled, setPrefilled] = useState(false);

    const [wo, setWo] = useState<WorkOrderVM>({
        id: '',
        number: '',
        vehicleId: '',
        taskName: '',
        description: '',
        priority: '',
        dueDate: null,
        dueMeterReading: '',
        estLaborHours: null,
        estCost: null,
        status: '',
        assignedTo: '',
        notes: ''
    });

    useEffect(() => {
        if (!isEdit || !woData?.workOrder || prefilled) return;
        const w = woData.workOrder as any;
        setWo((prev) => ({
            ...prev,
            id: w.id,
            number: w.number ?? '',
            vehicleId: w.vehicleId ?? '',
            taskName: w.taskName ?? '',
            description: w.description ?? '',
            priority: w.priority ?? '',
            dueDate: w.dueDate ? new Date(w.dueDate) : null,
            dueMeterReading: w.dueMeterReading ?? '',
            estLaborHours: w.estLaborHours != null ? Number(w.estLaborHours) : null,
            estCost: w.estCost != null ? Number(w.estCost) : null,
            status: w.status ?? '',
            assignedTo: w.assignedTo ?? '',
            notes: w.notes ?? ''
        }));
        setPrefilled(true);
    }, [isEdit, recordId, woData?.workOrder, prefilled]);



    const priorityOptions = useMemo(
        () => (prioritiesData?.workOrderPriorities ?? []).map((p: any) => ({ label: p.name, value: p.name })),
        [prioritiesData?.workOrderPriorities]
    );

    const statusOptions = useMemo(
        () => (statusesData?.workOrderStatuses ?? []).map((s: any) => ({ label: s.name, value: s.name })),
        [statusesData?.workOrderStatuses]
    );

    const toISO = (d: Date | null) => (d ? new Date(d).toISOString() : null);

    // Auto-select defaults when creating a new WO (based on master tables' isDefault)
    useEffect(() => {
        if (!isEdit && !wo.priority) {
            const def = (prioritiesData?.workOrderPriorities ?? []).find((p: any) => p.isDefault);
            if (def?.name) setWo((prev) => ({ ...prev, priority: def.name }));
        }
    }, [isEdit, wo.priority, prioritiesData?.workOrderPriorities]);

    useEffect(() => {
        if (!isEdit && !wo.status) {
            const def = (statusesData?.workOrderStatuses ?? []).find((s: any) => s.isDefault);
            if (def?.name) setWo((prev) => ({ ...prev, status: def.name }));
        }
    }, [isEdit, wo.status, statusesData?.workOrderStatuses]);

    // Avoid timezone shift by sending a plain local date string (YYYY-MM-DD)
    const toLocalDateYYYYMMDD = (d: Date | null) => {
        if (!d) return null;
        const yy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yy}-${mm}-${dd}`;
    };



    const handleCancel = () => {
        navigate('/maintenance/work-orders/list');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
    
        // Zod validation (aligns with Drivers/Vehicles)
        try {
            const estLaborVal = typeof wo.estLaborHours === 'number' ? wo.estLaborHours : parseNumericFromInput('estLaborHours');
            const estCostVal = typeof wo.estCost === 'number' ? wo.estCost : parseNumericFromInput('estCost');
            const toValidate = {
                number: (wo.number || '').trim() || undefined,
                vehicleId: (wo.vehicleId || '').trim(),
                taskName: (wo.taskName || '').trim(),
                description: (wo.description || '').trim() || undefined,
                priority: wo.priority,
                dueDateIso: toLocalDateYYYYMMDD(wo.dueDate) || '',
                dueMeterReading: (wo.dueMeterReading || '').trim() || undefined,
                estLaborHours: estLaborVal ?? undefined,
                estCost: estCostVal ?? undefined,
                status: wo.status,
                assignedTo: (wo.assignedTo || '').trim() || undefined
            };
            if (isEdit) {
                WorkOrderUpdateSchema.parse(toValidate);
            } else {
                WorkOrderCreateSchema.parse(toValidate);
            }
            setValidationErrors({});
        } catch (err: any) {
            const rec = zodErrorToRecord(err);
            setValidationErrors(rec);
            // Focus the first invalid control instead of showing a toast
            focusFirstInvalid(rec);
            return;
        }
    
        if (isEdit && woLoading) {
            setMessage({ severity: 'warn', text: 'Loading existing work order. Please wait and try again.' });
            toast.current?.show({ severity: 'warn', summary: 'Please wait', detail: 'Loading existing work order. Try again shortly.', life: 2000 });
            return;
        }
    
        setLoading(true);
        try {
            if (isEdit && recordId) {
                const estLabor = typeof wo.estLaborHours === 'number' ? wo.estLaborHours : parseNumericFromInput('estLaborHours');
                const estCost = typeof wo.estCost === 'number' ? wo.estCost : parseNumericFromInput('estCost');
                const input = {
                    number: wo.number || null,
                    vehicleId: wo.vehicleId || null,
                    taskName: wo.taskName || null,
                    description: wo.description || null,
                    notes: wo.notes || null,
                    priority: wo.priority || null,
                    dueDate: toLocalDateYYYYMMDD(wo.dueDate),
                    dueMeterReading: wo.dueMeterReading || null,
                    estLaborHours: estLabor != null ? Number(estLabor).toFixed(2) : null,
                    estCost: estCost != null ? Number(estCost).toFixed(2) : null,
                    status: wo.status || null,
                    assignedTo: wo.assignedTo || null
                } as any;
    
                await updateWorkOrder({ variables: { id: recordId, input }, context: { suppressGlobalError: true } });
                setMessage({ severity: 'success', text: 'Work order updated successfully!' });
                toast.current?.show({ severity: 'success', summary: 'Saved', detail: 'Work order updated successfully', life: 1500 });
                setTimeout(() => navigate('/maintenance/work-orders/list'), 800);
            } else {
                const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
                const estLabor = typeof wo.estLaborHours === 'number' ? wo.estLaborHours : parseNumericFromInput('estLaborHours');
                const estCost = typeof wo.estCost === 'number' ? wo.estCost : parseNumericFromInput('estCost');
                const input = {
                    id,
                    number: wo.number || null,
                    vehicleId: wo.vehicleId,
                    taskName: wo.taskName,
                    description: wo.description || null,
                    notes: wo.notes || null,
                    priority: wo.priority,
                    dueDate: toLocalDateYYYYMMDD(wo.dueDate),
                    dueMeterReading: wo.dueMeterReading || null,
                    estLaborHours: estLabor != null ? Number(estLabor).toFixed(2) : null,
                    estCost: estCost != null ? Number(estCost).toFixed(2) : null,
                    status: wo.status,
                    assignedTo: wo.assignedTo || null
                } as any;
    
                await createWorkOrder({ variables: { input }, context: { suppressGlobalError: true } });
                setMessage({ severity: 'success', text: 'Work order created successfully!' });
                toast.current?.show({ severity: 'success', summary: 'Created', detail: 'Work order created successfully', life: 1500 });
                setTimeout(() => navigate('/maintenance/work-orders/list'), 800);
            }
        } catch (err: any) {
            console.error(isEdit ? 'UpdateWorkOrder error' : 'CreateWorkOrder error', err);
            const msg = getGraphQLErrorMessage?.(err) || (isEdit ? 'Failed to save work order.' : 'Failed to create work order.');
            setMessage({ severity: 'error', text: msg });
            toast.current?.show({ severity: 'error', summary: 'Save failed', detail: msg, life: 2500 });
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
                            <h2 className="m-0">{isEdit ? 'Edit Work Order' : 'Create Work Order'}</h2>
                            <p className="text-500 mt-2 mb-0">{isEdit ? 'Update work order details' : 'Create a new maintenance work order'}</p>
                        </div>
                        <Button label="Back to Work Orders" icon="pi pi-arrow-left" onClick={handleCancel} className="p-button-outlined" />
                    </div>

                    {message && <Message severity={message.severity} text={message.text} className="mb-4" />}
                    {isEdit && woLoading && (
                        <div className="mb-3">
                            <i className="pi pi-spin pi-spinner mr-2" /> Loading existing work order...
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="grid">
                            <div className="col-12">
                                <h3 className="mb-3">Work Order Info</h3>
                            </div>

                            <div className="col-12 md:col-4">
                                <label htmlFor="number" className="font-bold block mb-2">
                                    Work Order Number (optional)
                                </label>
                                <InputText id="number" value={wo.number} onChange={(e) => setWo((prev) => ({ ...prev, number: e.target.value }))} placeholder="e.g., WO-2025-123" className="w-full" />
                            </div>

                            <div className="col-12 md:col-4">
                                <label htmlFor="vehicleId" className="font-bold block mb-2">
                                    Vehicle *
                                </label>
                                <Dropdown
                                    id="vehicleId"
                                    value={wo.vehicleId}
                                    options={vehicleOptions}
                                    optionLabel="label"
                                    optionValue="value"
                                    onChange={(e) => {
                                        setWo((prev) => ({ ...prev, vehicleId: (e as any)?.value?.value ?? (e as any).value }));
                                        if (validationErrors.vehicleId) {
                                            const { vehicleId, ...rest } = validationErrors;
                                            setValidationErrors(rest);
                                        }
                                    }}
                                    placeholder="Select a vehicle"
                                    className={`w-full ${validationErrors.vehicleId ? 'p-invalid' : ''}`}
                                    filter
                                />
                                {validationErrors.vehicleId && <small className="p-error">{validationErrors.vehicleId}</small>}
                            </div>

                            <div className="col-12 md:col-4">
                                <label htmlFor="taskName" className="font-bold block mb-2">
                                    Task Name *
                                </label>
                                <InputText
                                    id="taskName"
                                    value={wo.taskName}
                                    onChange={(e) => {
                                        setWo((prev) => ({ ...prev, taskName: e.target.value }));
                                        if (validationErrors.taskName) {
                                            const { taskName, ...rest } = validationErrors;
                                            setValidationErrors(rest);
                                        }
                                    }}
                                    placeholder="e.g., Oil Change"
                                    className={`w-full ${validationErrors.taskName ? 'p-invalid' : ''}`}
                                />
                                {validationErrors.taskName && <small className="p-error">{validationErrors.taskName}</small>}
                            </div>

                            <div className="col-12">
                                <label htmlFor="description" className="font-bold block mb-2">
                                    Description
                                </label>
                                <InputTextarea id="description" rows={4} value={wo.description} onChange={(e) => setWo((prev) => ({ ...prev, description: e.target.value }))} placeholder="Describe the work to be performed" className="w-full" />
                            </div>

                            <div className="col-12">
                                <h3 className="mb-3 mt-4">Scheduling & Priority</h3>
                            </div>

                            <div className="col-12 md:col-4">
                                <label htmlFor="priority" className="font-bold block mb-2">
                                    Priority
                                </label>
                                <Dropdown
                                    id="priority"
                                    value={wo.priority}
                                    options={priorityOptions}
                                    optionLabel="label"
                                    optionValue="value"
                                    onChange={(e) => setWo((prev) => ({ ...prev, priority: (e?.value as any)?.value ?? e.value }))}
                                    className="w-full"
                                />
                            </div>

                            <div className="col-12 md:col-4">
                                <label htmlFor="dueDate" className="font-bold block mb-2">
                                    Due Date
                                </label>
                                <Calendar
                                    id="dueDate"
                                    value={wo.dueDate}
                                    onChange={(e) => {
                                        setWo((prev) => ({ ...prev, dueDate: (e.value as Date) ?? null }));
                                        if (validationErrors.dueDateIso) {
                                            const { dueDateIso, ...rest } = validationErrors;
                                            setValidationErrors(rest);
                                        }
                                    }}
                                    showIcon
                                    dateFormat="mm/dd/yy"
                                    placeholder="mm/dd/yyyy"
                                    className={`w-full ${validationErrors.dueDateIso ? 'p-invalid' : ''}`}
                                />
                                {validationErrors.dueDateIso && <small className="p-error">{validationErrors.dueDateIso}</small>}
                            </div>

                            <div className="col-12 md:col-4">
                                <label htmlFor="dueMeterReading" className="font-bold block mb-2">
                                    Due Meter Reading (optional)
                                </label>
                                <InputText id="dueMeterReading" value={wo.dueMeterReading} onChange={(e) => setWo((prev) => ({ ...prev, dueMeterReading: e.target.value }))} placeholder="Miles/KM" className="w-full" />
                            </div>

                            <div className="col-12">
                                <h3 className="mb-3 mt-4">Estimates</h3>
                            </div>

                            <div className="col-12 md:col-4">
                                <label htmlFor="estLaborHours" className="font-bold block mb-2">
                                    Est. Labor Hours
                                </label>
                                <InputNumber
                                    id="estLaborHours"
                                    inputId="estLaborHours"
                                    value={wo.estLaborHours ?? undefined}
                                    onValueChange={(e) => {
                                        setWo((prev) => ({ ...prev, estLaborHours: (e.value as number) ?? null }));
                                        if (validationErrors.estLaborHours) {
                                            const { estLaborHours, ...rest } = validationErrors;
                                            setValidationErrors(rest);
                                        }
                                    }}
                                    min={0}
                                    step={0.5}
                                    suffix=" hours"
                                    className={`w-full ${validationErrors.estLaborHours ? 'p-invalid' : ''}`}
                                />
                                {validationErrors.estLaborHours && <small className="p-error">{validationErrors.estLaborHours}</small>}
                            </div>

                            <div className="col-12 md:col-4">
                                <label htmlFor="estCost" className="font-bold block mb-2">
                                    Est. Cost ($)
                                </label>
                                <InputNumber
                                    id="estCost"
                                    inputId="estCost"
                                    value={wo.estCost ?? undefined}
                                    onValueChange={(e) => {
                                        setWo((prev) => ({ ...prev, estCost: (e.value as number) ?? null }));
                                        if (validationErrors.estCost) {
                                            const { estCost, ...rest } = validationErrors;
                                            setValidationErrors(rest);
                                        }
                                    }}
                                    min={0}
                                    mode="currency"
                                    currency="USD"
                                    locale="en-US"
                                    minFractionDigits={2}
                                    maxFractionDigits={2}
                                    className={`w-full ${validationErrors.estCost ? 'p-invalid' : ''}`}
                                />
                                {validationErrors.estCost && <small className="p-error">{validationErrors.estCost}</small>}
                            </div>

                            <div className="col-12 md:col-4">
                                <label htmlFor="status" className="font-bold block mb-2">
                                    Status
                                </label>
                                <Dropdown
                                    id="status"
                                    value={wo.status}
                                    options={statusOptions}
                                    optionLabel="label"
                                    optionValue="value"
                                    onChange={(e) => setWo((prev) => ({ ...prev, status: (e?.value as any)?.value ?? e.value }))}
                                    className="w-full"
                                />
                            </div>

                            <div className="col-12">
                                <h3 className="mb-3 mt-4">Assignment</h3>
                            </div>

                            <div className="col-12 md:col-4">
                                <label htmlFor="assignedTo" className="font-bold block mb-2">
                                    Assigned To (Driver)
                                </label>
                                <Dropdown
                                    id="assignedTo"
                                    value={wo.assignedTo}
                                    options={driverOptions}
                                    optionLabel="label"
                                    optionValue="value"
                                    onChange={(e) => setWo((prev) => ({ ...prev, assignedTo: (e?.value as any)?.value ?? e.value ?? '' }))}
                                    placeholder="Select a driver (optional)"
                                    className="w-full"
                                    filter
                                    showClear
                                />
                            </div>

                            {/* Notes */}
                            <div className="col-12">
                                <label htmlFor="notes" className="font-bold block mb-2">
                                    Notes
                                </label>
                                <InputTextarea
                                    id="notes"
                                    rows={3}
                                    autoResize
                                    value={wo.notes}
                                    onChange={(e) => setWo((prev) => ({ ...prev, notes: (e.target as HTMLTextAreaElement).value }))}
                                    placeholder="Additional notes, observations, or recommendations..."
                                    className="w-full"
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="col-12">
                                <div className="flex justify-content-end gap-3 mt-4">
                                    <Button type="button" label="Cancel" icon="pi pi-times" onClick={handleCancel} className="p-button-outlined" />
                                    <Button type="submit" label={isEdit ? 'Save Changes' : 'Create Work Order'} icon={isEdit ? 'pi pi-save' : 'pi pi-plus'} loading={loading} disabled={loading || (isEdit && woLoading)} className="p-button-success" />
                                </div>
                            </div>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
}
