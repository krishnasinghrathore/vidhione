import React, { useState } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { useNavigate } from 'react-router-dom';
import { Dialog } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { RadioButton } from 'primereact/radiobutton';
import { Checkbox } from 'primereact/checkbox';

export default function MaintenanceSchedule() {
    const navigate = useNavigate();
    const [createScheduleDialog, setCreateScheduleDialog] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');

    const [schedules] = useState([
        {
            id: 1,
            name: 'Oil Change Schedule',
            description: 'Regular oil changes every 3 months or 3,000 miles',
            type: 'Time-based',
            interval: '3 months',
            status: 'Active',
            vehicleCount: 8,
            nextDue: '2024-04-15',
            lastUpdated: '2024-01-15'
        },
        {
            id: 2,
            name: 'Brake Inspection',
            description: 'Brake system inspection every 6 months',
            type: 'Time-based',
            interval: '6 months',
            status: 'Active',
            vehicleCount: 10,
            nextDue: '2024-07-15',
            lastUpdated: '2024-01-15'
        },
        {
            id: 3,
            name: 'Tire Rotation',
            description: 'Tire rotation every 5,000 miles',
            type: 'Meter-based',
            interval: '5,000 miles',
            status: 'Active',
            vehicleCount: 6,
            nextDue: '2024-03-20',
            lastUpdated: '2024-01-10'
        }
    ]);

    const [vehicles] = useState([
        { id: 1, unitNumber: '01', make: 'Ford', model: 'F-350', year: 1997 },
        { id: 2, unitNumber: '02', make: 'Ford', model: 'E-150', year: 2000 },
        { id: 3, unitNumber: '234', make: 'Mack', model: 'Pinnacle', year: 2000 },
        { id: 4, unitNumber: '235', make: 'Mack', model: 'Vision', year: 2005 },
        { id: 5, unitNumber: '236', make: 'Mack', model: 'Vision', year: 2005 },
        { id: 6, unitNumber: '237', make: 'Mack', model: 'Vision', year: 2004 },
        { id: 7, unitNumber: '238', make: 'Mack', model: 'Pinnacle', year: 2010 },
        { id: 8, unitNumber: '239', make: 'Mack', model: 'Pinnacle', year: 2010 },
        { id: 9, unitNumber: '240', make: 'Mack', model: 'Pinnacle', year: 2010 }
    ]);

    const [newSchedule, setNewSchedule] = useState({
        name: '',
        description: '',
        startDate: new Date(),
        recurrenceType: 'time',
        intervalValue: 3,
        intervalUnit: 'months',
        isActive: true,
        selectedVehicles: [] as number[]
    });

    const intervalUnitOptions = [
        { label: 'Days', value: 'days' },
        { label: 'Weeks', value: 'weeks' },
        { label: 'Months', value: 'months' },
        { label: 'Years', value: 'years' }
    ];

    const statusBodyTemplate = (rowData: any) => {
        const getStatusColor = (status: string) => {
            switch (status) {
                case 'Active':
                    return 'success';
                case 'Inactive':
                    return 'danger';
                case 'Pending':
                    return 'warning';
                default:
                    return 'info';
            }
        };

        return <Tag value={rowData.status} severity={getStatusColor(rowData.status)} />;
    };

    const actionBodyTemplate = (rowData: any) => (
        <div className="flex gap-2">
            <Button
                icon="pi pi-eye"
                size="small"
                text
                tooltip="View Details"
            />
            <Button
                icon="pi pi-pencil"
                size="small"
                text
                tooltip="Edit"
            />
            <Button
                icon="pi pi-trash"
                size="small"
                text
                severity="danger"
                tooltip="Delete"
            />
        </div>
    );

    const handleCreateSchedule = () => {
        if (newSchedule.name && newSchedule.description) {
            // Handle schedule creation logic here
            console.log('Creating schedule:', newSchedule);
            setCreateScheduleDialog(false);
            // Reset form
            setNewSchedule({
                name: '',
                description: '',
                startDate: new Date(),
                recurrenceType: 'time',
                intervalValue: 3,
                intervalUnit: 'months',
                isActive: true,
                selectedVehicles: []
            });
        }
    };

    const handleVehicleSelection = (vehicleId: number, checked: boolean) => {
        if (checked) {
            setNewSchedule(prev => ({
                ...prev,
                selectedVehicles: [...prev.selectedVehicles, vehicleId]
            }));
        } else {
            setNewSchedule(prev => ({
                ...prev,
                selectedVehicles: prev.selectedVehicles.filter(id => id !== vehicleId)
            }));
        }
    };

    return (
        <div className="grid">
            <div className="col-12">
                <Card>
                    <div className="flex justify-content-between align-items-center mb-4">
                        <div>
                            <h2 className="m-0">Maintenance Schedules</h2>
                            <p className="text-500 mt-2 mb-0">Create and manage recurring maintenance schedules</p>
                        </div>
                        <Button
                            label="+ Create Schedule"
                            icon="pi pi-plus"
                            onClick={() => setCreateScheduleDialog(true)}
                            className="p-button-primary"
                        />
                    </div>

                    <div className="mb-3">
                        <span className="p-input-icon-left w-full">
                            <i className="pi pi-search" />
                            <InputText
                                value={globalFilter}
                                onChange={(e) => setGlobalFilter(e.target.value)}
                                placeholder="Search schedules by name or description..."
                                className="w-full"
                            />
                        </span>
                    </div>

                    {schedules.length === 0 ? (
                        <div className="text-center py-6">
                            <i className="pi pi-calendar-plus text-6xl text-400 mb-4"></i>
                            <h3 className="text-900 mb-2">No maintenance schedules yet</h3>
                            <p className="text-500 mb-4">Create your first maintenance schedule to automate recurring maintenance tasks</p>
                            <Button
                                label="+ Create Schedule"
                                icon="pi pi-plus"
                                onClick={() => setCreateScheduleDialog(true)}
                                className="p-button-primary"
                            />
                        </div>
                    ) : (
                        <DataTable
                            value={schedules}
                            paginator
                            rows={10}
                            rowsPerPageOptions={[5, 10, 25]}
                            globalFilter={globalFilter}
                            emptyMessage="No maintenance schedules found."
                            className="p-datatable-sm"
                        >
                            <Column field="name" header="Schedule Name" sortable />
                            <Column field="description" header="Description" sortable />
                            <Column field="type" header="Type" sortable />
                            <Column field="interval" header="Interval" sortable />
                            <Column field="status" header="Status" body={statusBodyTemplate} sortable />
                            <Column field="vehicleCount" header="Vehicles" sortable />
                            <Column field="nextDue" header="Next Due" sortable />
                            <Column field="lastUpdated" header="Last Updated" sortable />
                            <Column header="Actions" body={actionBodyTemplate} style={{ width: '150px' }} />
                        </DataTable>
                    )}
                </Card>
            </div>

            {/* Create Schedule Dialog */}
            <Dialog
                visible={createScheduleDialog}
                header="Create Maintenance Schedule"
                modal
                className="p-fluid"
                style={{ width: '80vw' }}
                onHide={() => setCreateScheduleDialog(false)}
                footer={
                    <div>
                        <Button label="Cancel" icon="pi pi-times" onClick={() => setCreateScheduleDialog(false)} className="p-button-text" />
                        <Button label="Create Schedule" icon="pi pi-check" onClick={handleCreateSchedule} autoFocus />
                    </div>
                }
            >
                <div className="grid">
                    {/* Basic Information */}
                    <div className="col-12">
                        <h3 className="mb-3">Basic Information</h3>
                    </div>

                    <div className="col-12">
                        <label htmlFor="name" className="font-bold">Task Name *</label>
                        <InputText
                            id="name"
                            value={newSchedule.name}
                            onChange={(e) => setNewSchedule(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g., Oil Change, Brake Inspection"
                            className="w-full"
                        />
                    </div>

                    <div className="col-12">
                        <label htmlFor="description" className="font-bold">Task Description</label>
                        <InputTextarea
                            id="description"
                            value={newSchedule.description}
                            onChange={(e) => setNewSchedule(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Detailed description of the maintenance task..."
                            rows={3}
                            className="w-full"
                        />
                    </div>

                    <div className="col-12">
                        <label htmlFor="startDate" className="font-bold">Start Date *</label>
                        <Calendar
                            id="startDate"
                            value={newSchedule.startDate}
                            onChange={(e) => setNewSchedule(prev => ({ ...prev, startDate: e.value as Date }))}
                            showIcon
                            dateFormat="mm/dd/yy"
                            className="w-full"
                        />
                    </div>

                    {/* Recurrence Settings */}
                    <div className="col-12">
                        <h3 className="mb-3">Recurrence Settings</h3>
                    </div>

                    <div className="col-12">
                        <label className="font-bold block mb-2">Recurrence Type *</label>
                        <div className="flex gap-4">
                            <div className="flex align-items-center">
                                <RadioButton
                                    inputId="time-based"
                                    name="recurrenceType"
                                    value="time"
                                    onChange={(e) => setNewSchedule(prev => ({ ...prev, recurrenceType: e.value }))}
                                    checked={newSchedule.recurrenceType === 'time'}
                                />
                                <label htmlFor="time-based" className="ml-2 flex align-items-center">
                                    <i className="pi pi-clock text-blue-500 mr-2"></i>
                                    <span>Time-based</span>
                                    <small className="block text-500">Schedule based on time intervals (days, weeks, months, years)</small>
                                </label>
                            </div>
                            <div className="flex align-items-center">
                                <RadioButton
                                    inputId="meter-based"
                                    name="recurrenceType"
                                    value="meter"
                                    onChange={(e) => setNewSchedule(prev => ({ ...prev, recurrenceType: e.value }))}
                                    checked={newSchedule.recurrenceType === 'meter'}
                                />
                                <label htmlFor="meter-based" className="ml-2 flex align-items-center">
                                    <i className="pi pi-cog text-green-500 mr-2"></i>
                                    <span>Meter-based</span>
                                    <small className="block text-500">Schedule based on mileage/odometer readings</small>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="col-6">
                        <label htmlFor="intervalValue" className="font-bold">Interval Value *</label>
                        <InputNumber
                            id="intervalValue"
                            value={newSchedule.intervalValue}
                            onValueChange={(e) => setNewSchedule(prev => ({ ...prev, intervalValue: e.value || 1 }))}
                            min={1}
                            className="w-full"
                        />
                    </div>

                    <div className="col-6">
                        <label htmlFor="intervalUnit" className="font-bold">Interval Unit *</label>
                        <Dropdown
                            id="intervalUnit"
                            value={newSchedule.intervalUnit}
                            options={intervalUnitOptions}
                            onChange={(e) => setNewSchedule(prev => ({ ...prev, intervalUnit: e.value }))}
                            placeholder="Select Unit"
                            className="w-full"
                        />
                    </div>

                    <div className="col-12">
                        <div className="flex align-items-center">
                            <Checkbox
                                inputId="isActive"
                                checked={newSchedule.isActive}
                                onChange={(e) => setNewSchedule(prev => ({ ...prev, isActive: e.checked }))}
                            />
                            <label htmlFor="isActive" className="ml-2">Schedule is active</label>
                        </div>
                    </div>

                    {/* Vehicle Assignment */}
                    <div className="col-12">
                        <h3 className="mb-3">Vehicle Assignment (Optional)</h3>
                        <p className="text-500 mb-3">Select which vehicles should follow this maintenance schedule:</p>

                        <div className="grid">
                            {vehicles.map((vehicle) => (
                                <div key={vehicle.id} className="col-12 md:col-6 lg:col-4">
                                    <div className="flex align-items-center p-3 border-1 border-round surface-border">
                                        <Checkbox
                                            inputId={`vehicle-${vehicle.id}`}
                                            checked={newSchedule.selectedVehicles.includes(vehicle.id)}
                                            onChange={(e) => handleVehicleSelection(vehicle.id, e.checked)}
                                        />
                                        <label htmlFor={`vehicle-${vehicle.id}`} className="ml-2">
                                            <div className="font-bold">{vehicle.unitNumber}</div>
                                            <div className="text-sm text-500">{vehicle.make} {vehicle.model} {vehicle.year}</div>
                                        </label>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
