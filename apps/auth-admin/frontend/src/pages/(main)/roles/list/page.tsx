'use client';
import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Card } from 'primereact/card';
import { useNavigate } from 'react-router-dom';

interface Role {
    id: string;
    name: string;
    isActive: boolean;
    userCount: number;
    permissions: string[];
}

const RoleManagement = () => {
    const navigate = useNavigate();
    const [roles, setRoles] = useState<Role[]>([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [loading, setLoading] = useState(true);

    // Mock data for now
    useEffect(() => {
        const mockRoles: Role[] = [
            {
                id: '1',
                name: 'Admin',
                isActive: true,
                userCount: 5,
                permissions: ['read', 'write', 'delete', 'manage_users']
            },
            {
                id: '2',
                name: 'User',
                isActive: true,
                userCount: 25,
                permissions: ['read', 'write']
            }
        ];

        setTimeout(() => {
            setRoles(mockRoles);
            setLoading(false);
        }, 1000);
    }, []);

    const statusBodyTemplate = (rowData: Role) => {
        return <span className={`badge ${rowData.isActive ? 'badge-success' : 'badge-secondary'}`}>{rowData.isActive ? 'Active' : 'Inactive'}</span>;
    };

    const permissionsBodyTemplate = (rowData: Role) => {
        return rowData.permissions.join(', ') || 'N/A';
    };

    const header = (
        <div className="flex justify-content-between align-items-center">
            <h3>Role Management</h3>
            <div className="flex gap-2">
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText type="search" onInput={(e: React.FormEvent<HTMLInputElement>) => setGlobalFilter((e.target as HTMLInputElement).value)} placeholder="Search roles..." />
                </span>
                <Button label="New Role" icon="pi pi-plus" onClick={() => navigate('/roles/create')} />
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="flex justify-content-center align-items-center h-screen">
                <div className="text-center">
                    <i className="pi pi-spin pi-spinner text-4xl text-primary mb-3"></i>
                    <p>Loading roles...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4">
            <Card>
                <DataTable value={roles} paginator rows={10} rowsPerPageOptions={[5, 10, 25, 50]} globalFilter={globalFilter} header={header} emptyMessage="No roles found." dataKey="id" responsiveLayout="scroll">
                    <Column field="name" header="Name" sortable />
                    <Column field="userCount" header="Users" sortable />
                    <Column field="permissions" header="Permissions" body={permissionsBodyTemplate} sortable />
                    <Column field="isActive" header="Status" body={statusBodyTemplate} sortable />
                </DataTable>
            </Card>
        </div>
    );
};

export default RoleManagement;
