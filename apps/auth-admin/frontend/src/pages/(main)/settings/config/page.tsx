import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card } from 'primereact/card';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { useSystemConfig } from '../../../../lib/systemConfig';
import MaintenanceCompletionTypesPage from '../maintenance-completion-types/page';
import WorkOrderPrioritiesPage from '../work-order-priorities/page';
import WorkOrderStatusesPage from '../work-order-statuses/page';

export default function SystemConfigPage() {
    const toast = useRef<Toast>(null);
    const { minDriverAge, maxUploadSizeMB, loading, error, updateMinDriverAge, updateMaxUploadSizeMB, refetch } = useSystemConfig();

    const [age, setAge] = useState<number | null>(null);
    const [maxMB, setMaxMB] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);
    const [dirty, setDirty] = useState(false);

    // Role gate
    const isAdminOrSuper = useMemo(() => {
        try {
            const envRole = String((import.meta as any).env?.VITE_USER_ROLE || '').toLowerCase();
            const envFlag = String((import.meta as any).env?.VITE_ADMIN_MODE || '').toLowerCase();
            const localRole = String((typeof window !== 'undefined' ? localStorage.getItem('userRole') : '') || '').toLowerCase();
            const role = envRole || localRole;
            if (role === 'superadmin' || role === 'admin') return true;
            return envFlag === 'true' || envFlag === '1';
        } catch {
            return false;
        }
    }, []);

    // Popups
    const [mctVisible, setMctVisible] = useState(false);
    const [priorityVisible, setPriorityVisible] = useState(false);
    const [statusVisible, setStatusVisible] = useState(false);




    useEffect(() => {
        if (!loading && (age === null || !dirty)) {
            setAge(minDriverAge);
        }
        if (!loading && (maxMB === null || !dirty)) {
            setMaxMB(maxUploadSizeMB);
        }
    }, [loading, minDriverAge, maxUploadSizeMB, dirty, age, maxMB]);

    const canSave = useMemo(() => {
        if (saving) return false;
        const ageValid = age != null && Number.isFinite(age) && age > 0;
        const maxValid = maxMB != null && Number.isFinite(maxMB) && maxMB > 0;
        const changedAge = ageValid && age !== minDriverAge;
        const changedMax = maxValid && maxMB !== maxUploadSizeMB;
        return dirty && (changedAge || changedMax);
    }, [saving, age, maxMB, dirty, minDriverAge, maxUploadSizeMB]);

    const handleChange = (val?: number | null) => {
        setAge(val ?? null);
        setDirty(true);
    };

    const handleChangeMax = (val?: number | null) => {
        setMaxMB(val ?? null);
        setDirty(true);
    };

    const handleReset = () => {
        setAge(minDriverAge);
        setMaxMB(maxUploadSizeMB);
        setDirty(false);
    };

    const handleSave = async () => {
        if (!canSave) return;
        try {
            setSaving(true);
            const tasks: Promise<any>[] = [];
            if (age != null && Number.isFinite(age) && age > 0 && age !== minDriverAge) {
                tasks.push(updateMinDriverAge(Math.max(0, Math.floor(age))));
            }
            if (maxMB != null && Number.isFinite(maxMB) && maxMB > 0 && maxMB !== maxUploadSizeMB) {
                tasks.push(updateMaxUploadSizeMB(Math.max(1, Math.floor(maxMB))));
            }
            if (tasks.length === 0) return;
            await Promise.all(tasks);
            setDirty(false);
            toast.current?.show({ severity: 'success', summary: 'Saved', detail: 'System configuration updated.', life: 1500 });
            await refetch();
        } catch (e: any) {
            toast.current?.show({ severity: 'error', summary: 'Save failed', detail: String(e?.message || e) });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="grid">
            <div className="col-12">
                <Card>
                    <Toast ref={toast} />
                    <div className="flex justify-content-between align-items-center mb-3">
                        <h2 className="m-0">System Configuration</h2>
                    </div>

                    {error && <Message severity="error" text={`Failed to load system config: ${error}`} className="mb-3" />}

                    {/* Minimum Driver Age */}
                    <div className="grid">
                        <div className="col-12 md:col-6">
                            <label htmlFor="minDriverAge" className="font-bold block mb-2">
                                Minimum Driver Age (years)
                            </label>
                            <div className="flex align-items-center gap-2">
                                <InputNumber
                                    id="minDriverAge"
                                    value={age ?? undefined}
                                    onValueChange={(e) => handleChange(e.value as number | null)}
                                    min={1}
                                    max={120}
                                    showButtons
                                    buttonLayout="horizontal"
                                    decrementButtonClassName="p-button-outlined"
                                    incrementButtonClassName="p-button-outlined"
                                    incrementButtonIcon="pi pi-plus"
                                    decrementButtonIcon="pi pi-minus"
                                    placeholder="Enter minimum age"
                                    inputClassName="w-5rem"
                                    inputStyle={{ textAlign: 'center' }}
                                    disabled={loading || saving}
                                />
                                <span className="text-600">(Current: {loading ? 'Loading…' : minDriverAge} years)</span>
                            </div>
                            <small className="block mt-2 text-600">This value is used to validate Driver Date of Birth across the application.</small>
                        </div>

                        <div className="col-12 md:col-6">
                            <label htmlFor="maxUploadSizeMB" className="font-bold block mb-2">
                                Maximum File Upload Size (MB)
                            </label>
                            <div className="flex align-items-center gap-2">
                                <InputNumber
                                    id="maxUploadSizeMB"
                                    value={maxMB ?? undefined}
                                    onValueChange={(e) => handleChangeMax(e.value as number | null)}
                                    min={1}
                                    max={1024}
                                    showButtons
                                    buttonLayout="horizontal"
                                    decrementButtonClassName="p-button-outlined"
                                    incrementButtonClassName="p-button-outlined"
                                    incrementButtonIcon="pi pi-plus"
                                    decrementButtonIcon="pi pi-minus"
                                    placeholder="Enter max size in MB"
                                    inputClassName="w-6rem"
                                    inputStyle={{ textAlign: 'center' }}
                                    disabled={loading || saving}
                                />
                                <span className="text-600">(Current: {loading ? 'Loading…' : maxUploadSizeMB} MB)</span>
                            </div>
                            <small className="block mt-2 text-600">Applies to document uploader validation and info messages.</small>
                        </div>

                        <div className="col-12 mt-4">
                            <div className="flex gap-2">
                                <Button label="Save" icon="pi pi-save" onClick={handleSave} disabled={!canSave} loading={saving} className="p-button-success" />
                                <Button label="Reset" icon="pi pi-refresh" onClick={handleReset} disabled={saving || loading} className="p-button-outlined" />
                            </div>
                        </div>

                        {isAdminOrSuper && (
                            <div className="col-12 mt-5">
                                <h3 className="mt-0 mb-2">Maintenance Dictionaries</h3>
                                <div className="flex gap-2 flex-wrap">
                                    <Button label="Maintenance Completion Types" icon="pi pi-cog" onClick={() => setMctVisible(true)} />
                                    <Button label="Work Order Priorities" icon="pi pi-sort-amount-up" onClick={() => setPriorityVisible(true)} />
                                    <Button label="Work Order Statuses" icon="pi pi-tags" onClick={() => setStatusVisible(true)} />
                                </div>
                            </div>
                        )}


                    </div>
                </Card>
            </div>

            {/* Popup: Maintenance Completion Types */}
            <Dialog
                visible={mctVisible}
                header="Maintenance Completion Types"
                modal
                style={{ width: 'min(1200px, 95vw)' }}
                onHide={() => setMctVisible(false)}
                maximizable
                contentClassName="pt-0"
            >
                <MaintenanceCompletionTypesPage inDialog />
            </Dialog>

            {/* Popup: Work Order Priorities */}
            <Dialog
                visible={priorityVisible}
                header="Work Order Priorities"
                modal
                style={{ width: 'min(1200px, 95vw)' }}
                onHide={() => setPriorityVisible(false)}
                maximizable
                contentClassName="pt-0"
            >
                <WorkOrderPrioritiesPage inDialog />
            </Dialog>

            {/* Popup: Work Order Statuses */}
            <Dialog
                visible={statusVisible}
                header="Work Order Statuses"
                modal
                style={{ width: 'min(1200px, 95vw)' }}
                onHide={() => setStatusVisible(false)}
                maximizable
                contentClassName="pt-0"
            >
                <WorkOrderStatusesPage inDialog />
            </Dialog>

        </div>
    );
}
