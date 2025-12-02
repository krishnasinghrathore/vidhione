import React from 'react';

import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { TabView, TabPanel } from 'primereact/tabview';
import { Tag } from 'primereact/tag';
import { Timeline } from 'primereact/timeline';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import { VehicleDocument } from '../../../../../graphql/vehicles/operations.generated';

const VehicleDetailsPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const { data, loading, error } = useQuery(VehicleDocument, {
        variables: { id: id as string },
        skip: !id
    });
    const v: any = data?.vehicle;

    const statusSeverity = (s?: string) => {
        switch ((s ?? '').toLowerCase()) {
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

    const makeModel = (() => {
        const year = v?.year ? `${v.year} ` : '';
        const mk = v?.make ? v.make : '';
        const md = v?.model ? ` ${v.model}` : '';
        const mm = `${year}${mk}${md}`.trim();
        return mm || '—';
    })();

    const customizedContent = (item: any) => {
        return (
            <Card title={item.status} subTitle={item.date}>
                <p>{item.notes}</p>
            </Card>
        );
    };

    const customizedMarker = (item: any) => {
        return (
            <span className="flex w-2rem h-2rem align-items-center justify-content-center text-white border-circle z-1 shadow-1" style={{ backgroundColor: item.color }}>
                <i className={item.icon}></i>
            </span>
        );
    };

    const maintenanceHistory = [
        { status: 'Manual Entry', date: '8/13/2025', icon: 'pi pi-cog', color: '#607D8B', notes: 'Services: Oil Change, Left Wheel Replacement\nCost: $150.00\nMeter Reading: 110000\nNotes: Test notes' },
        { status: 'Manual Entry', date: '8/13/2025', icon: 'pi pi-cog', color: '#607D8B', notes: 'Services: Annual Break Inspection\nMeter Reading: 120000\nNotes: No defaults' },
        { status: 'Manual Entry', date: '8/13/2025', icon: 'pi pi-cog', color: '#607D8B', notes: 'Services: Weekly Inspection' },
        {
            status: 'Work Order',
            date: '8/13/2025',
            icon: 'pi pi-shopping-cart',
            color: '#673AB7',
            notes: 'Annual Break Inspection\nOutside Shop\nServices: Annual Break Inspection\nCompleted by: James Stracuzi\nParts Used:\nMeter Reading: 120000\nNotes: No defaults'
        }
    ];

    return (
        <div>
            <div className="flex align-items-center mb-4">
                <Button icon="pi pi-arrow-left" className="p-button-text mr-2" onClick={() => navigate(-1)} />
                <div className="flex align-items-center gap-2">
                    <h4 className="mb-0">Vehicle {v?.unitNumber ?? id ?? ''}</h4>
                    {v?.status && <Tag value={v.status} severity={statusSeverity(v.status)} />}
                </div>
                <Button label="Edit Vehicle" icon="pi pi-pencil" className="ml-auto" onClick={() => id && navigate(`/fleet/vehicles/${id}/edit`)} />
            </div>

            {loading && (
                <div className="mb-3">
                    <i className="pi pi-spin pi-spinner mr-2" /> Loading vehicle...
                </div>
            )}
            {error && <div className="p-error mb-3">Failed to load vehicle.</div>}

            <div className="grid">
                <div className="col-12 md:col-6">
                    <div className="card">
                        <div className="flex align-items-center mb-4">
                            <i className="pi pi-truck mr-2" style={{ fontSize: '1.5rem' }}></i>
                            <h5 className="mb-0 mt-0">Vehicle Information</h5>
                        </div>
                        <div className="grid">
                            <div className="col-6">Unit Number</div>
                            <div className="col-6 text-right">
                                <strong>{v?.unitNumber ?? '—'}</strong>
                            </div>
                            <div className="col-6">Make & Model</div>
                            <div className="col-6 text-right">
                                <strong>{makeModel}</strong>
                            </div>
                            <div className="col-6">VIN</div>
                            <div className="col-6 text-right">
                                <strong>{v?.vin ?? '—'}</strong>
                            </div>
                            <div className="col-6">License Plate</div>
                            <div className="col-6 text-right">
                                <strong>{v?.plateNumber ?? '—'}</strong>
                            </div>
                            <div className="col-6">Tire Size</div>
                            <div className="col-6 text-right">
                                <strong>{v?.tireSize ?? '—'}</strong>
                            </div>
                            <div className="col-6">Owner/Lessor</div>
                            <div className="col-6 text-right">
                                <strong>{v?.lessorOwner ?? '—'}</strong>
                            </div>
                        </div>
                    </div>
                    <div className="card">
                        <div className="flex align-items-center mb-4">
                            <i className="pi pi-check mr-2" style={{ fontSize: '1.5rem' }}></i>
                            <h5 className="mb-0 mt-0">Registration & Inspection</h5>
                        </div>
                        <div className="grid">
                            <div className="col-8">
                                <div>Registration</div>
                                <div className="text-color-secondary">Expires: {v?.registrationExpires ?? 'Not set'}</div>
                            </div>
                            <div className="col-4 text-right">
                                <Tag value={v?.registrationExpires ? 'Set' : 'Not set'} severity={v?.registrationExpires ? 'success' : 'warning'}></Tag>
                            </div>
                        </div>
                        <hr />
                        <div className="grid">
                            <div className="col-8">
                                <div>Inspection</div>
                                <div className="text-color-secondary">Expires: {v?.inspectionExpires ?? 'Not set'}</div>
                            </div>
                            <div className="col-4 text-right">
                                <Tag value={v?.inspectionExpires ? 'Set' : 'Not set'} severity={v?.inspectionExpires ? 'success' : 'warning'}></Tag>
                            </div>
                        </div>
                    </div>
                    <div className="card">
                        <div className="flex align-items-center mb-4">
                            <i className="pi pi-shield mr-2" style={{ fontSize: '1.5rem' }}></i>
                            <h5 className="mb-0 mt-0">Compliance Status</h5>
                        </div>
                        <div className="grid text-center">
                            <div className="col-6">
                                <div className="card bg-green-100">
                                    <i className="pi pi-check-circle text-green-600" style={{ fontSize: '2rem' }}></i>
                                    <div className="mt-2">Registration</div>
                                    <div className="text-color-secondary">{v?.registrationExpires ?? 'Not set'}</div>
                                </div>
                            </div>
                            <div className="col-6">
                                <div className="card bg-green-100">
                                    <i className="pi pi-check-circle text-green-600" style={{ fontSize: '2rem' }}></i>
                                    <div className="mt-2">Inspection</div>
                                    <div className="text-color-secondary">{v?.inspectionExpires ?? 'Not set'}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="card">
                        <div className="flex align-items-center mb-4">
                            <i className="pi pi-chart-bar mr-2" style={{ fontSize: '1.5rem' }}></i>
                            <h5 className="mb-0 mt-0">Maintenance Summary</h5>
                        </div>
                        <div className="grid text-center">
                            <div className="col-6">
                                <div className="card bg-blue-100">
                                    <div className="text-3xl font-bold text-blue-600">{v?.lastServiceDate ? 1 : 0}</div>
                                    <div className="mt-2">Manual Records</div>
                                </div>
                            </div>
                            <div className="col-6">
                                <div className="card bg-green-100">
                                    <div className="text-3xl font-bold text-green-600">{v?.nextServiceDate ? 1 : 0}</div>
                                    <div className="mt-2">Upcoming Service</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-12 md:col-6">
                    <div className="card">
                        <TabView>
                            <TabPanel
                                header={
                                    <span>
                                        <i className="pi pi-wrench mr-2"></i>Maintenance History
                                    </span>
                                }
                            >
                                <h5>Complete Maintenance History</h5>
                                <p>All maintenance records for this vehicle (demo)</p>
                                <Timeline value={maintenanceHistory} align="left" className="customized-timeline" marker={customizedMarker} content={customizedContent} />
                            </TabPanel>
                            <TabPanel
                                header={
                                    <span>
                                        <i className="pi pi-list mr-2"></i>Work Orders
                                    </span>
                                }
                            ></TabPanel>
                        </TabView>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VehicleDetailsPage;
