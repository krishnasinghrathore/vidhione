import React, { useState } from 'react';
import { Card } from 'primereact/card';
import { Chart } from 'primereact/chart';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { ProgressBar } from 'primereact/progressbar';
import { Dropdown } from 'primereact/dropdown';

export default function FleetAnalytics() {
    const [timeRange, setTimeRange] = useState('30days');
    const [selectedMetric, setSelectedMetric] = useState('costs');

    const timeRangeOptions = [
        { label: 'Last 7 Days', value: '7days' },
        { label: 'Last 30 Days', value: '30days' },
        { label: 'Last 3 Months', value: '3months' },
        { label: 'Last 6 Months', value: '6months' },
        { label: 'Last Year', value: '1year' }
    ];

    const metricOptions = [
        { label: 'Maintenance Costs', value: 'costs' },
        { label: 'Fuel Consumption', value: 'fuel' },
        { label: 'Vehicle Utilization', value: 'utilization' },
        { label: 'Downtime Analysis', value: 'downtime' }
    ];

    const [costChartData] = useState({
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
            {
                label: 'Maintenance Costs',
                data: [12000, 15000, 18000, 14000, 22000, 19000, 25000, 21000, 18000, 16000, 20000, 23000],
                borderColor: '#3B82F6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true
            },
            {
                label: 'Fuel Costs',
                data: [25000, 28000, 32000, 30000, 35000, 38000, 42000, 40000, 35000, 32000, 38000, 41000],
                borderColor: '#10B981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4,
                fill: true
            }
        ]
    });

    const [utilizationChartData] = useState({
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
            {
                label: 'Vehicle Utilization %',
                data: [85, 92, 78, 95, 88, 45, 30],
                borderColor: '#F59E0B',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                tension: 0.4,
                fill: true
            }
        ]
    });

    const [fleetPerformance] = useState([
        {
            vehicle: 'Truck-001',
            make: 'Ford',
            model: 'F-150',
            utilization: 92,
            avgCost: 1850,
            downtime: 2.5,
            efficiency: 88
        },
        {
            vehicle: 'Truck-002',
            make: 'Chevrolet',
            model: 'Silverado',
            utilization: 87,
            avgCost: 2100,
            downtime: 3.2,
            efficiency: 82
        },
        {
            vehicle: 'Van-001',
            make: 'Mercedes',
            model: 'Sprinter',
            utilization: 95,
            avgCost: 1650,
            downtime: 1.8,
            efficiency: 94
        },
        {
            vehicle: 'Truck-003',
            make: 'Ford',
            model: 'F-350',
            utilization: 78,
            avgCost: 2400,
            downtime: 4.1,
            efficiency: 75
        }
    ]);

    const [maintenanceTrends] = useState([
        { month: 'January', preventive: 15, corrective: 8, total: 23 },
        { month: 'February', preventive: 18, corrective: 6, total: 24 },
        { month: 'March', preventive: 20, corrective: 10, total: 30 },
        { month: 'April', preventive: 16, corrective: 7, total: 23 },
        { month: 'May', preventive: 22, corrective: 9, total: 31 },
        { month: 'June', preventive: 19, corrective: 8, total: 27 }
    ]);

    const chartOptions = {
        maintainAspectRatio: false,
        aspectRatio: 0.8,
        plugins: {
            legend: {
                labels: {
                    color: '#374151',
                    usePointStyle: true
                }
            }
        },
        scales: {
            x: {
                ticks: { color: '#6B7280' },
                grid: { color: '#E5E7EB' }
            },
            y: {
                ticks: { color: '#6B7280' },
                grid: { color: '#E5E7EB' }
            }
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
                <ProgressBar
                    value={rowData.utilization}
                    className="w-8rem mr-2"
                    showValue={false}
                />
                <span className={`font-bold text-${getSeverity(rowData.utilization)}`}>
                    {rowData.utilization}%
                </span>
            </div>
        );
    };

    const efficiencyBodyTemplate = (rowData: any) => {
        const getSeverity = (value: number) => {
            if (value >= 90) return 'success';
            if (value >= 80) return 'warning';
            return 'danger';
        };

        return <Tag value={`${rowData.efficiency}%`} severity={getSeverity(rowData.efficiency)} />;
    };

    const actionBodyTemplate = () => (
        <div className="flex gap-2">
            <Button icon="pi pi-chart-line" size="small" text tooltip="View Details" />
            <Button icon="pi pi-pencil" size="small" text tooltip="Edit" />
        </div>
    );

    return (
        <div className="grid">
            <div className="col-12">
                <Card>
                    <div className="flex justify-content-between align-items-center mb-4">
                        <div>
                            <h2 className="m-0">Fleet Analytics Dashboard</h2>
                            <p className="text-500 mt-2 mb-0">Comprehensive fleet performance insights and trends</p>
                        </div>
                        <div className="flex gap-3">
                            <Dropdown
                                value={timeRange}
                                options={timeRangeOptions}
                                onChange={(e) => setTimeRange(e.value)}
                                placeholder="Select Time Range"
                                className="w-10rem"
                            />
                            <Dropdown
                                value={selectedMetric}
                                options={metricOptions}
                                onChange={(e) => setSelectedMetric(e.value)}
                                placeholder="Select Metric"
                                className="w-12rem"
                            />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Key Metrics Cards */}
            <div className="col-12 md:col-6 lg:col-3">
                <Card className="mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Total Fleet Cost</span>
                            <div className="text-900 font-medium text-xl">$284,500</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-blue-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-dollar text-blue-500 text-xl" />
                        </div>
                    </div>
                    <span className="text-green-500 font-medium">+12% vs last period</span>
                </Card>
            </div>

            <div className="col-12 md:col-6 lg:col-3">
                <Card className="mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Avg Vehicle Utilization</span>
                            <div className="text-900 font-medium text-xl">88%</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-green-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-chart-line text-green-500 text-xl" />
                        </div>
                    </div>
                    <span className="text-green-500 font-medium">+5% vs last period</span>
                </Card>
            </div>

            <div className="col-12 md:col-6 lg:col-3">
                <Card className="mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Avg Downtime</span>
                            <div className="text-900 font-medium text-xl">2.9 days</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-orange-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-clock text-orange-500 text-xl" />
                        </div>
                    </div>
                    <span className="text-red-500 font-medium">+0.3 days vs last period</span>
                </Card>
            </div>

            <div className="col-12 md:col-6 lg:col-3">
                <Card className="mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Fleet Efficiency</span>
                            <div className="text-900 font-medium text-xl">84.8%</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-purple-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-star text-purple-500 text-xl" />
                        </div>
                    </div>
                    <span className="text-green-500 font-medium">+2.1% vs last period</span>
                </Card>
            </div>

            {/* Charts */}
            <div className="col-12 lg:col-8">
                <Card className="mb-0">
                    <h5>Cost Trends & Analysis</h5>
                    <Chart type="line" data={costChartData} options={chartOptions} height="300px" />
                </Card>
            </div>

            <div className="col-12 lg:col-4">
                <Card className="mb-0">
                    <h5>Weekly Utilization</h5>
                    <Chart type="line" data={utilizationChartData} options={chartOptions} height="300px" />
                </Card>
            </div>

            {/* Fleet Performance Table */}
            <div className="col-12">
                <Card className="mb-0">
                    <h5>Fleet Performance Overview</h5>
                    <DataTable
                        value={fleetPerformance}
                        paginator
                        rows={5}
                        rowsPerPageOptions={[5, 10, 25]}
                        emptyMessage="No fleet performance data available."
                        className="p-datatable-sm"
                    >
                        <Column field="vehicle" header="Vehicle" sortable />
                        <Column field="make" header="Make" sortable />
                        <Column field="model" header="Model" sortable />
                        <Column field="utilization" header="Utilization" body={utilizationBodyTemplate} sortable />
                        <Column field="avgCost" header="Avg Cost" body={(rowData) => `$${rowData.avgCost}`} sortable />
                        <Column field="downtime" header="Downtime (days)" sortable />
                        <Column field="efficiency" header="Efficiency" body={efficiencyBodyTemplate} sortable />
                        <Column header="Actions" body={actionBodyTemplate} style={{ width: '100px' }} />
                    </DataTable>
                </Card>
            </div>

            {/* Maintenance Trends */}
            <div className="col-12">
                <Card className="mb-0">
                    <h5>Maintenance Trends</h5>
                    <DataTable
                        value={maintenanceTrends}
                        paginator
                        rows={6}
                        rowsPerPageOptions={[6, 12]}
                        emptyMessage="No maintenance trend data available."
                        className="p-datatable-sm"
                    >
                        <Column field="month" header="Month" sortable />
                        <Column field="preventive" header="Preventive" sortable />
                        <Column field="corrective" header="Corrective" sortable />
                        <Column field="total" header="Total" sortable />
                        <Column
                            header="Preventive %"
                            body={(rowData) => `${Math.round((rowData.preventive / rowData.total) * 100)}%`}
                            sortable
                        />
                    </DataTable>
                </Card>
            </div>
        </div>
    );
}
