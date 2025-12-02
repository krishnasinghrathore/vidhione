'use client';
import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Card } from 'primereact/card';
import { useNavigate } from 'react-router-dom';

interface Invitation {
    id: string;
    email: string;
    company: string;
    role: string;
    isUsed: boolean;
    expiresAt: string;
    createdAt: string;
}

const UserInvitations = () => {
    const navigate = useNavigate();
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [loading, setLoading] = useState(true);

    // Mock data for now
    useEffect(() => {
        const mockInvitations: Invitation[] = [
            {
                id: '1',
                email: 'newuser@example.com',
                company: 'Tech Corp',
                role: 'User',
                isUsed: false,
                expiresAt: '2025-10-19',
                createdAt: '2025-09-19'
            },
            {
                id: '2',
                email: 'admin@example.com',
                company: 'Design Inc',
                role: 'Admin',
                isUsed: true,
                expiresAt: '2025-09-25',
                createdAt: '2025-09-15'
            }
        ];

        setTimeout(() => {
            setInvitations(mockInvitations);
            setLoading(false);
        }, 1000);
    }, []);

    const statusBodyTemplate = (rowData: Invitation) => {
        return <span className={`badge ${rowData.isUsed ? 'badge-success' : 'badge-warning'}`}>{rowData.isUsed ? 'Used' : 'Pending'}</span>;
    };

    const header = (
        <div className="flex justify-content-between align-items-center">
            <h3>User Invitations</h3>
            <div className="flex gap-2">
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText type="search" onInput={(e: React.FormEvent<HTMLInputElement>) => setGlobalFilter((e.target as HTMLInputElement).value)} placeholder="Search invitations..." />
                </span>
                <Button label="New Invitation" icon="pi pi-plus" onClick={() => navigate('/invitations/create')} />
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="flex justify-content-center align-items-center h-screen">
                <div className="text-center">
                    <i className="pi pi-spin pi-spinner text-4xl text-primary mb-3"></i>
                    <p>Loading invitations...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4">
            <Card>
                <DataTable value={invitations} paginator rows={10} rowsPerPageOptions={[5, 10, 25, 50]} globalFilter={globalFilter} header={header} emptyMessage="No invitations found." dataKey="id" responsiveLayout="scroll">
                    <Column field="email" header="Email" sortable />
                    <Column field="company" header="Company" sortable />
                    <Column field="role" header="Role" sortable />
                    <Column field="expiresAt" header="Expires" sortable />
                    <Column field="createdAt" header="Created" sortable />
                    <Column field="isUsed" header="Status" body={statusBodyTemplate} sortable />
                </DataTable>
            </Card>
        </div>
    );
};

export default UserInvitations;
