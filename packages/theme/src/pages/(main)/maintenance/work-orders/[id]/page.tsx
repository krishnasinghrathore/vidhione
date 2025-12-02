import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { WorkOrderDocument } from '../../../../../graphql/workOrders/operations.generated';
import { VehicleDocument } from '../../../../../graphql/vehicles/operations.generated';
import { DriverDocument } from '../../../../../graphql/drivers/operations.generated';

const WorkOrderDetailsPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const { data, loading, error } = useQuery(WorkOrderDocument, {
        variables: { id: id as string },
        skip: !id
    });

    const w = data?.workOrder as any;

    // Fetch related vehicle and driver for friendly display labels
    const { data: vehData } = useQuery(VehicleDocument, {
        variables: { id: w?.vehicleId as string },
        skip: !w?.vehicleId
    });
    const { data: drvData } = useQuery(DriverDocument, {
        variables: { id: w?.assignedTo as string },
        skip: !w?.assignedTo
    });

    const vehicleLabel = useMemo(() => {
        const v = vehData?.vehicle as any;
        if (!v) return w?.vehicleId ?? '—';
        const makeModel = [v.make, v.model].filter(Boolean).join(' ');
        return [v.unitNumber, makeModel].filter(Boolean).join(' - ') || v.id || '—';
    }, [vehData?.vehicle, w?.vehicleId]);

    const assignedToLabel = useMemo(() => {
        const d = drvData?.driver as any;
        if (!d) return w?.assignedTo ?? '—';
        return `${d.fullName}${d.driverCode ? ` (${d.driverCode})` : ''}`;
    }, [drvData?.driver, w?.assignedTo]);
    
    const formatUSD = (val?: any) => {
        const n = Number(val);
        if (Number.isFinite(n)) {
            return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
        }
        const s = (val ?? '').toString().trim();
        return s ? s : '—';
    };
    
    const statusSeverity = (s?: string) => {
        switch ((s ?? '').toLowerCase()) {
            case 'completed':
                return 'success';
            case 'in_progress':
            case 'in progress':
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

    return (
        <div className="grid">
            <div className="col-12">
                <div className="flex align-items-center mb-4">
                    <Button icon="pi pi-arrow-left" className="p-button-text mr-2" onClick={() => navigate(-1)} />
                    <div className="flex align-items-center gap-3">
                        <h4 className="mb-0">Work Order Details</h4>
                        {w?.status && <Tag value={w.status} severity={statusSeverity(w.status)} />}
                    </div>
                    {id && <Button label="Edit Work Order" icon="pi pi-pencil" className="ml-auto" onClick={() => navigate(`/maintenance/work-orders/${id}/edit`)} />}
                </div>

                {loading && (
                    <div className="mb-3">
                        <i className="pi pi-spin pi-spinner mr-2" /> Loading work order...
                    </div>
                )}
                {error && <div className="p-error mb-3">Failed to load work order.</div>}

                {w && (
                    <div className="grid">
                        <div className="col-12 md:col-6">
                            <Card>
                                <div className="flex align-items-center mb-3">
                                    <i className="pi pi-briefcase mr-2" style={{ fontSize: '1.25rem' }} />
                                    <h5 className="m-0">Work Order</h5>
                                </div>
                                <div className="grid">
                                    <div className="col-6">Number</div>
                                    <div className="col-6 text-right">
                                        <strong>{w.number ?? '—'}</strong>
                                    </div>

                                    <div className="col-6">Task Name</div>
                                    <div className="col-6 text-right">
                                        <strong>{w.taskName ?? '—'}</strong>
                                    </div>

                                    <div className="col-6">Priority</div>
                                    <div className="col-6 text-right">
                                        <strong>{w.priority ?? '—'}</strong>
                                    </div>

                                    <div className="col-6">Status</div>
                                    <div className="col-6 text-right">
                                        <Tag value={w.status ?? '—'} severity={statusSeverity(w.status)} />
                                    </div>

                                    <div className="col-6">Assigned To</div>
                                    <div className="col-6 text-right">
                                        <strong>{assignedToLabel}</strong>
                                    </div>
                                </div>
                            </Card>

                            <Card className="mt-3">
                                <div className="flex align-items-center mb-3">
                                    <i className="pi pi-calendar mr-2" style={{ fontSize: '1.25rem' }} />
                                    <h5 className="m-0">Scheduling</h5>
                                </div>
                                <div className="grid">
                                    <div className="col-6">Due Date</div>
                                    <div className="col-6 text-right">
                                        <strong>{w.dueDate ?? '—'}</strong>
                                    </div>

                                    <div className="col-6">Due Meter Reading</div>
                                    <div className="col-6 text-right">
                                        <strong>{w.dueMeterReading ?? '—'}</strong>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        <div className="col-12 md:col-6">
                            <Card>
                                <div className="flex align-items-center mb-3">
                                    <i className="pi pi-truck mr-2" style={{ fontSize: '1.25rem' }} />
                                    <h5 className="m-0">Vehicle</h5>
                                </div>
                                <div className="grid">
                                    <div className="col-6">Vehicle</div>
                                    <div className="col-6 text-right">
                                        <strong>{vehicleLabel}</strong>
                                    </div>
                                </div>
                            </Card>

                            <Card className="mt-3">
                                <div className="flex align-items-center mb-3">
                                    <i className="pi pi-dollar mr-2" style={{ fontSize: '1.25rem' }} />
                                    <h5 className="m-0">Estimates</h5>
                                </div>
                                <div className="grid">
                                    <div className="col-6">Est. Labor Hours</div>
                                    <div className="col-6 text-right">
                                        <strong>{w.estLaborHours ?? '—'}</strong>
                                    </div>
    
                                    <div className="col-6">Est. Cost ($)</div>
                                    <div className="col-6 text-right">
                                        <strong>{formatUSD(w.estCost)}</strong>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        <div className="col-12">
                            <div className="grid">
                                <div className="col-12 md:col-6">
                                    <Card className="mt-3">
                                        <div className="flex align-items-center mb-3">
                                            <i className="pi pi-align-left mr-2" style={{ fontSize: '1.25rem' }} />
                                            <h5 className="m-0">Description</h5>
                                        </div>
                                        <p className="m-0">{w.description ?? '—'}</p>
                                    </Card>
                                </div>
                                <div className="col-12 md:col-6">
                                    <Card className="mt-3">
                                        <div className="flex align-items-center mb-3">
                                            <i className="pi pi-comment mr-2" style={{ fontSize: '1.25rem' }} />
                                            <h5 className="m-0">Notes</h5>
                                        </div>
                                        <p className="m-0">{w.notes ?? '—'}</p>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WorkOrderDetailsPage;
