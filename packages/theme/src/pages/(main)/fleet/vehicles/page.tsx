import React, { useState } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { ProgressBar } from 'primereact/progressbar';
import { useNavigate } from 'react-router-dom';
import { Chart } from 'primereact/chart';

export default function VehicleOverview() {
    const navigate = useNavigate();
    const [globalFilter, setGlobalFilter] = useState('');

    const [vehicles] = useState([
        {
            id: 1,
            unitNumber: '01',
            make: 'Ford',
            model: 'F-350',
            year: 1997,
            vin: '1FTEW1EG0VFA12345',
            plateNumber: 'ABC-1234',
            status: 'Operational',
            inspectionStatus: 'Valid',
            inspectionExpiration: '2024-12-31',
            lastService: '2024-01-15',
            nextService: '2024-04-15',
            mileage: 125000,
            utilization: 85
        },
        {
            id: 2,
            unitNumber: '02',
            make: 'Ford',
            model: 'E-150',
            year: 2000,
            vin: '1FTRE14W5YHA67890',
            plateNumber: 'XYZ-5678',
            status: 'Maintenance',
            inspectionStatus: 'Valid',
            inspectionExpiration: '2024-11-30',
            lastService: '2024-01-10',
            nextService: '2024-03-10',
            mileage: 98000,
            utilization: 72
        },
        {
            id: 3,
            unitNumber: '234',
            make: 'Mack',
            model: 'Pinnacle',
            year: 2000,
            vin: '1M2K189C4WM123456',
            plateNumber: 'MACK-001',
            status: 'Operational',
            inspectionStatus: 'Valid',
            inspectionExpiration: '2025-01-15',
            lastService: '2024-01-20',
            nextService: '2024-04-20',
            mileage: 450000,
            utilization: 95
        },
        {
            id: 4,
            unitNumber: '235',
            make: 'Mack',
            model: 'Vision',
            year: 2005,
            vin: '1M2K189C4WM789012',
            plateNumber: 'MACK-002',
            status: 'Operational',
            inspectionStatus: 'Valid',
            inspectionExpiration: '2024-10-31',
            lastService: '2024-01-18',
            nextService: '2024-04-18',
            mileage: 380000,
            utilization: 88
        },
        {
            id: 5,
            unitNumber: '236',
            make: 'Mack',
            model: 'Vision',
            year: 2005,
            vin: '1M2K189C4WM345678',
            plateNumber: 'MACK-003',
            status: 'Operational',
            inspectionStatus: 'Valid',
            inspectionExpiration: '2025-02-28',
            lastService: '2024-01-25',
            nextService: '2024-04-25',
            mileage: 320000,
            utilization: 92
        }
    ]);

    const [fleetStats] = useState({
        totalVehicles: 10,
        operational: 8,
        maintenance: 1,
        outOfService: 1,
        avgAge: 15.2,
        avgMileage: 285000
    });

    const [utilizationChartData] = useState({
        labels: ['0-25%', '26-50%', '51-75%', '76-100%'],
        datasets: [
            {
                data: [1, 2, 3, 4],
                backgroundColor: ['#EF4444', '#F59E0B', '#3B82F6', '#10B981'],
                borderWidth: 0
            }
        ]
    });

    const chartOptions = {
        maintainAspectRatio: false,
        aspectRatio: 1,
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    usePointStyle: true,
                    padding: 20
                }
            }
        }
    };

    const statusBodyTemplate = (rowData: any) => {
        const getStatusColor = (status: string) => {
            switch (status) {
                case 'Operational':
                    return 'success';
                case 'Maintenance':
                    return 'warning';
                case 'Out of Service':
                    return 'danger';
                default:
                    return 'info';
            }
        };

        return <Tag value={rowData.status} severity={getStatusColor(rowData.status)} />;
    };

    const inspectionBodyTemplate = (rowData: any) => {
        const isExpiringSoon = new Date(rowData.inspectionExpiration) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        const isExpired = new Date(rowData.inspectionExpiration) < new Date();

        if (isExpired) {
            return <Tag value="Expired" severity="danger" />;
        } else if (isExpiringSoon) {
            return <Tag value="Expiring Soon" severity="warning" />;
        } else {
            return <Tag value="Valid" severity="success" />;
        }
    };

    const utilizationBodyTemplate = (rowData: any) => {
        const getSeverity = (value: number) => {
            if (value >= 90) return 'success';
            if (value >= 75) return 'warning';
            return 'danger';
        };

        return (
            <div className="flex align-items-center">
                <ProgressBar value={rowData.utilization} className="w-6rem mr-2" showValue={false} />
                <span className={`font-bold text-${getSeverity(rowData.utilization)}`}>{rowData.utilization}%</span>
            </div>
        );
    };

    const actionBodyTemplate = (rowData: any) => (
        <div className="flex gap-2">
            <Button icon="pi pi-eye" size="small" text tooltip="View Details" onClick={() => navigate(`/fleet/vehicles/${rowData.id}`)} />
            <Button icon="pi pi-pencil" size="small" text tooltip="Edit" onClick={() => navigate(`/fleet/vehicles/${rowData.id}/edit`)} />
            <Button icon="pi pi-wrench" size="small" text tooltip="Maintenance" onClick={() => navigate(`/maintenance/work-orders/add?vehicle=${rowData.id}`)} />
        </div>
    );

    return (
        <div className="grid">
            <div className="col-12">
                <Card>
                    <div className="flex justify-content-between align-items-center mb-4">
                        <div>
                            <h2 className="m-0">Vehicle Management</h2>
                            <p className="text-500 mt-2 mb-0">Manage your fleet vehicles and maintenance schedules</p>
                        </div>
                        <div className="flex align-items-center gap-3">
                            <span className="text-500 font-medium">{fleetStats.totalVehicles} Vehicles</span>
                            <Button label="+ Add Vehicle" icon="pi pi-plus" onClick={() => navigate('/fleet/vehicles/add')} className="p-button-primary" />
                        </div>
                    </div>

                    <div className="mb-3">
                        <span className="p-input-icon-left w-full">
                            <i className="pi pi-search" />
                            <InputText value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Search vehicles by unit number, make, model, or VIN..." className="w-full" />
                        </span>
                    </div>
                </Card>
            </div>

            {/* Fleet Statistics Cards */}
            <div className="col-12 md:col-6 lg:col-3">
                <Card className="mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Operational</span>
                            <div className="text-900 font-medium text-xl">{fleetStats.operational}</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-green-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-check-circle text-green-500 text-xl" />
                        </div>
                    </div>
                    <span className="text-green-500 font-medium">Ready for service</span>
                </Card>
            </div>

            <div className="col-12 md:col-6 lg:col-3">
                <Card className="mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">In Maintenance</span>
                            <div className="text-900 font-medium text-xl">{fleetStats.maintenance}</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-orange-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-wrench text-orange-500 text-xl" />
                        </div>
                    </div>
                    <span className="text-orange-500 font-medium">Under repair</span>
                </Card>
            </div>

            <div className="col-12 md:col-6 lg:col-3">
                <Card className="mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Out of Service</span>
                            <div className="text-900 font-medium text-xl">{fleetStats.outOfService}</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-red-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-times-circle text-red-500 text-xl" />
                        </div>
                    </div>
                    <span className="text-red-500 font-medium">Requires attention</span>
                </Card>
            </div>

            <div className="col-12 md:col-6 lg:col-3">
                <Card className="mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Avg Age</span>
                            <div className="text-900 font-medium text-xl">{fleetStats.avgAge} years</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-blue-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-calendar text-blue-500 text-xl" />
                        </div>
                    </div>
                    <span className="text-blue-500 font-medium">Fleet age</span>
                </Card>
            </div>

            {/* Utilization Chart */}
            <div className="col-12 lg:col-4">
                <Card className="mb-0">
                    <h5>Vehicle Utilization Distribution</h5>
                    <Chart type="doughnut" data={utilizationChartData} options={chartOptions} height="250px" />
                </Card>
            </div>

            {/* Vehicles Table */}
            <div className="col-12 lg:col-8">
                <Card className="mb-0">
                    <h5>Fleet Vehicles</h5>
                    <DataTable value={vehicles} paginator rows={5} rowsPerPageOptions={[5, 10, 25]} globalFilter={globalFilter} emptyMessage="No vehicles found." className="p-datatable-sm">
                        <Column field="unitNumber" header="Unit #" sortable style={{ width: '80px' }} />
                        <Column field="make" header="Vehicle" body={(rowData) => `${rowData.make} ${rowData.model} (${rowData.year})`} sortable />
                        <Column field="vin" header="VIN" sortable style={{ width: '120px' }} />
                        <Column field="inspectionStatus" header="Inspection" body={inspectionBodyTemplate} sortable style={{ width: '120px' }} />
                        <Column field="utilization" header="Utilization" body={utilizationBodyTemplate} sortable style={{ width: '120px' }} />
                        <Column header="Actions" body={actionBodyTemplate} style={{ width: '120px' }} />
                    </DataTable>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="col-12">
                <Card className="mb-0">
                    <h5>Quick Actions</h5>
                    <div className="flex gap-3 flex-wrap">
                        <Button label="Create Work Order" icon="pi pi-wrench" onClick={() => navigate('/maintenance/work-orders/create')} className="p-button-outlined" />
                        <Button label="Schedule Maintenance" icon="pi pi-calendar" onClick={() => navigate('/maintenance/schedule')} className="p-button-outlined" />
                        <Button label="View Reports" icon="pi pi-chart-bar" onClick={() => navigate('/reports/fleet')} className="p-button-outlined" />
                        <Button label="Export Fleet Data" icon="pi pi-download" className="p-button-outlined" />
                    </div>
                </Card>
            </div>
        </div>
    );
}
