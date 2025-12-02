'use client';
import React from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { useNavigate } from 'react-router-dom';

export default function FleetDashboard() {
    const APP_NAME = (import.meta as any).env?.VITE_APP_NAME || 'VidhiOne';
    const navigate = useNavigate();

    // Summary cards (static demo values to match provided design)
    const assetCards = [
        { title: 'Total Assets', total: 100, inService: 98, outOfService: 2 },
        { title: 'Total Vehicles', total: 99, inService: 98, outOfService: 1 },
        { title: 'Total Trailer/Chassis', total: 1, inService: 0, outOfService: 1 },
        { title: 'Total Other', total: 0, inService: 0, outOfService: 0 }
    ];

    // Upcoming work orders (sample)
    const upcomingWorkOrders = [
        {
            id: 1,
            title: 'Test Work Order',
            subtitle: 'Vehicle 01 • 8/21/2025',
            status: 'Scheduled'
        }
    ];

    // Recent maintenance (sample feed)
    const recentMaintenance = [
        {
            id: 1,
            vehicle: 'Vehicle 236',
            description: 'Installed 2 new rods on rear ends, used old bolts and nuts, Installed new level valve for air bags on rear end (Mack)',
            date: '9/6/2025'
        },
        {
            id: 2,
            vehicle: 'Vehicle 236',
            description: '2 new rods on rear ends used old bolts and nuts, New level valve for air bags on rear end (MACK)',
            date: '9/6/2025'
        },
        {
            id: 3,
            vehicle: 'Vehicle 241',
            description: 'New AC compressor (crack), 2 New Fan Belts +7 more',
            date: '7/23/2025'
        }
    ];

    return (
        <div className="grid">
            {/* Header */}
            <div className="col-12">
                <div className="card">
                    <h5>Overview Dashboard</h5>
                    <p>Welcome to {APP_NAME}</p>
                </div>
            </div>

            {/* Summary Cards */}
            {assetCards.map((card, idx) => (
                <div className="col-12 md:col-6 lg:col-3" key={idx}>
                    <Card className="mb-0">
                        <div className="text-900 font-semibold mb-2">
                            {card.title}: {card.total}
                        </div>
                        <div className="text-green-600 font-medium mb-1">In Service: {card.inService}</div>
                        <div className="text-red-600 font-medium">Out-of-Service: {card.outOfService}</div>
                    </Card>
                </div>
            ))}

            {/* Upcoming Work Orders */}
            <div className="col-12 lg:col-6">
                <Card className="mb-0">
                    <div className="flex justify-content-between align-items-center mb-3">
                        <h5 className="m-0">Upcoming Work Orders</h5>
                        <Button label="View All" icon="pi pi-arrow-right" iconPos="right" text onClick={() => navigate('/maintenance/work-orders/list')} />
                    </div>

                    {upcomingWorkOrders.length === 0 ? (
                        <div className="text-600">No upcoming work orders.</div>
                    ) : (
                        <div className="flex flex-column gap-3">
                            {upcomingWorkOrders.map((wo) => (
                                <div key={wo.id} className="flex align-items-center justify-content-between p-3 border-1 surface-border border-round">
                                    <div className="flex align-items-center">
                                        <i className="pi pi-calendar text-primary text-lg mr-3"></i>
                                        <div>
                                            <div className="font-medium text-900">{wo.title}</div>
                                            <div className="text-600 text-sm">{wo.subtitle}</div>
                                        </div>
                                    </div>
                                    <Tag value={wo.status} severity="info" />
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>

            {/* Recent Maintenance */}
            <div className="col-12 lg:col-6">
                <Card className="mb-0">
                    <div className="flex justify-content-between align-items-center mb-3">
                        <h5 className="m-0">Recent Maintenance</h5>
                        <Button label="View All" icon="pi pi-arrow-right" iconPos="right" text onClick={() => navigate('/maintenance/work-orders/list')} />
                    </div>

                    <div style={{ maxHeight: '280px', overflow: 'auto' }}>
                        {recentMaintenance.map((item) => (
                            <div key={item.id} className="p-3 border-1 surface-border border-round mb-2">
                                <div className="flex align-items-center mb-2">
                                    <i className="pi pi-check-circle text-green-600 mr-2"></i>
                                    <span className="font-medium text-900">{item.vehicle}</span>
                                </div>
                                <div className="text-700 text-sm mb-2">{item.description}</div>
                                <div className="text-500 text-xs">{item.date}</div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
}
