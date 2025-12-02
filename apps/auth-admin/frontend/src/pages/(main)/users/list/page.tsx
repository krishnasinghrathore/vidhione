'use client';
import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Card } from 'primereact/card';
import { useNavigate } from 'react-router-dom';

interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
    roles: string[];
    company: string;
}

const UserManagement = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [loading, setLoading] = useState(true);

    // Mock data for now
    useEffect(() => {
        const mockUsers: User[] = [
            {
                id: '1',
                email: 'john.doe@example.com',
                firstName: 'John',
                lastName: 'Doe',
                isActive: true,
                roles: ['Admin', 'User'],
                company: 'Tech Corp'
            },
            {
                id: '2',
                email: 'jane.smith@example.com',
                firstName: 'Jane',
                lastName: 'Smith',
                isActive: false,
                roles: ['User'],
                company: 'Design Inc'
            }
        ];

        setTimeout(() => {
            setUsers(mockUsers);
            setLoading(false);
        }, 1000);
    }, []);

    const statusBodyTemplate = (rowData: User) => {
        return <span className={`badge ${rowData.isActive ? 'badge-success' : 'badge-secondary'}`}>{rowData.isActive ? 'Active' : 'Inactive'}</span>;
    };

    const nameBodyTemplate = (rowData: User) => {
        return `${rowData.firstName} ${rowData.lastName}`;
    };

    const rolesBodyTemplate = (rowData: User) => {
        return rowData.roles.join(', ') || 'N/A';
    };

    const header = (
        <div className="flex justify-content-between align-items-center">
            <h3>User Management</h3>
            <div className="flex gap-2">
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText type="search" onInput={(e: React.FormEvent<HTMLInputElement>) => setGlobalFilter((e.target as HTMLInputElement).value)} placeholder="Search users..." />
                </span>
                <Button label="New User" icon="pi pi-plus" onClick={() => navigate('/users/create')} />
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="flex justify-content-center align-items-center h-screen">
                <div className="text-center">
                    <i className="pi pi-spin pi-spinner text-4xl text-primary mb-3"></i>
                    <p>Loading users...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4">
            <Card>
                <DataTable value={users} paginator rows={10} rowsPerPageOptions={[5, 10, 25, 50]} globalFilter={globalFilter} header={header} emptyMessage="No users found." dataKey="id" responsiveLayout="scroll">
                    <Column field="firstName" header="Name" body={nameBodyTemplate} sortable />
                    <Column field="email" header="Email" sortable />
                    <Column field="roles" header="Roles" body={rolesBodyTemplate} sortable />
                    <Column field="company" header="Company" sortable />
                    <Column field="isActive" header="Status" body={statusBodyTemplate} sortable />
                    <Column
                        header="Actions"
                        body={(rowData: User) => (
                            <div className="flex gap-2">
                                <Button icon="pi pi-pencil" className="p-button-rounded p-button-success p-button-text" onClick={() => navigate(`/users/${rowData.id}`)} />
                                <Button
                                    icon="pi pi-trash"
                                    className="p-button-rounded p-button-danger p-button-text"
                                    onClick={() => {
                                        // Handle delete
                                        console.log('Delete user:', rowData.id);
                                    }}
                                />
                            </div>
                        )}
                        style={{ minWidth: '8rem' }}
                    />
                </DataTable>
            </Card>
        </div>
    );
};

export default UserManagement;
