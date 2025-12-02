import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Message } from 'primereact/message';
import { DriverDocument } from '../../../../../graphql/drivers/operations.generated';
import { getGraphQLErrorMessage } from '../../../../../lib/errors';

function normalizeStatusLabel(s?: string | null): string {
    if (!s) return 'Active';
    const v = String(s).trim().toLowerCase();
    if (v === 'inactive') return 'Inactive';
    if (v === 'on_leave') return 'On Leave';
    return 'Active';
}
function statusSeverity(s?: string | null): 'success' | 'info' | 'warning' | 'danger' {
    const v = String(s || '')
        .trim()
        .toLowerCase();
    if (v === 'inactive') return 'info';
    if (v === 'on_leave') return 'warning';
    return 'success';
}
function safeDate(d?: string | null): string {
    if (!d) return '—';
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? '—' : dt.toLocaleDateString();
}
function phonePretty(p?: string | null): string {
    return p || '—';
}

export default function DriverDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const { data, loading, error } = useQuery(DriverDocument, {
        variables: { id: id as string },
        skip: !id
    });

    if (loading) {
        return (
            <div className="flex justify-content-center align-items-center" style={{ height: '400px' }}>
                <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i>
            </div>
        );
    }

    if (error) {
        return (
            <div className="grid">
                <div className="col-12">
                    <Card>
                        <Message severity="error" text={getGraphQLErrorMessage(error)} className="mb-3" />
                        <div className="text-center">
                            <Button label="Back to Drivers" icon="pi pi-arrow-left" onClick={() => navigate('/fleet/drivers/list')} />
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    const driver = data?.driver;
    if (!driver) {
        return (
            <div className="grid">
                <div className="col-12">
                    <Card>
                        <div className="text-center">
                            <h3>Driver Not Found</h3>
                            <p>The requested driver could not be found.</p>
                            <Button label="Back to Drivers" icon="pi pi-arrow-left" onClick={() => navigate('/fleet/drivers/list')} />
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="grid">
            <div className="col-12">
                <Card>
                    <div className="flex justify-content-between align-items-center mb-4">
                        <div>
                            <h2 className="m-0">Driver Details - {driver.fullName}</h2>
                            <p className="text-500 mt-1 mb-0">Driver ID: {driver.id}</p>
                        </div>
                        <div className="flex gap-2">
                            <Button label="Edit Driver" icon="pi pi-pencil" className="p-button-outlined" onClick={() => navigate(`/fleet/drivers/${driver.id}/edit`)} />
                            <Button label="Back to Drivers" icon="pi pi-arrow-left" onClick={() => navigate('/fleet/drivers/list')} className="p-button-outlined" />
                        </div>
                    </div>

                    <div className="grid">
                        <div className="col-12 md:col-6">
                            <Card className="h-full">
                                <h4 className="mt-0">Personal Information</h4>
                                <div className="grid">
                                    <div className="col-6">
                                        <strong>Full Name:</strong>
                                    </div>
                                    <div className="col-6">{driver.fullName}</div>

                                    <div className="col-6">
                                        <strong>Date of Birth:</strong>
                                    </div>
                                    <div className="col-6">{safeDate(driver.dateOfBirth)}</div>

                                    <div className="col-6">
                                        <strong>Phone:</strong>
                                    </div>
                                    <div className="col-6">{phonePretty(driver.phone)}</div>

                                    <div className="col-6">
                                        <strong>Email:</strong>
                                    </div>
                                    <div className="col-6">{driver.email || '—'}</div>

                                    <div className="col-6">
                                        <strong>Address:</strong>
                                    </div>
                                    <div className="col-6">{driver.address || '—'}</div>

                                    <div className="col-6">
                                        <strong>Status:</strong>
                                    </div>
                                    <div className="col-6">
                                        <Tag value={normalizeStatusLabel(driver.status)} severity={statusSeverity(driver.status)} />
                                    </div>
                                </div>
                            </Card>
                        </div>

                        <div className="col-12 md:col-6">
                            <Card className="h-full">
                                <h4 className="mt-0">Employment Information</h4>
                                <div className="grid">
                                    <div className="col-6">
                                        <strong>Hire Date:</strong>
                                    </div>
                                    <div className="col-6">{safeDate(driver.hireDate)}</div>

                                    <div className="col-6">
                                        <strong>Notes:</strong>
                                    </div>
                                    <div className="col-6">{driver.notes || '—'}</div>
                                </div>
                            </Card>
                        </div>

                        <div className="col-12 md:col-6">
                            <Card>
                                <h4 className="mt-0">Driver's License</h4>
                                <div className="grid">
                                    <div className="col-6">
                                        <strong>License Number:</strong>
                                    </div>
                                    <div className="col-6">{driver.licenseNumber || '—'}</div>

                                    <div className="col-6">
                                        <strong>State:</strong>
                                    </div>
                                    <div className="col-6">{driver.licenseState || '—'}</div>

                                    <div className="col-6">
                                        <strong>Expires:</strong>
                                    </div>
                                    <div className="col-6">{safeDate(driver.licenseExpires)}</div>

                                    <div className="col-6">
                                        <strong>SSN (Last 4):</strong>
                                    </div>
                                    <div className="col-6">{driver.ssnLast4 ? `***-**-${driver.ssnLast4}` : '—'}</div>
                                </div>
                            </Card>
                        </div>

                        <div className="col-12 md:col-6">
                            <Card>
                                <h4 className="mt-0">CDL & TWIC</h4>
                                <div className="grid">
                                    <div className="col-6">
                                        <strong>CDL Class:</strong>
                                    </div>
                                    <div className="col-6">{driver.cdlClass || '—'}</div>

                                    <div className="col-6">
                                        <strong>Medical Card Expires:</strong>
                                    </div>
                                    <div className="col-6">{safeDate(driver.medicalCardExpires)}</div>

                                    <div className="col-6">
                                        <strong>TWIC Card #:</strong>
                                    </div>
                                    <div className="col-6">{driver.twicCardNumber || '—'}</div>

                                    <div className="col-6">
                                        <strong>TWIC Expires:</strong>
                                    </div>
                                    <div className="col-6">{safeDate(driver.twicCardExpires)}</div>
                                </div>
                            </Card>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
