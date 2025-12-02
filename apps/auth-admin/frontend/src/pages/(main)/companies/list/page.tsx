'use client';
import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Card } from 'primereact/card';
import { useNavigate } from 'react-router-dom';

interface Company {
    id: string;
    name: string;
    email: string;
    phone: string;
    isActive: boolean;
    businessNature: string;
}

const CompanyManagement = () => {
    const navigate = useNavigate();
    const [companies, setCompanies] = useState<Company[]>([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [loading, setLoading] = useState(true);

    // Mock data for now
    useEffect(() => {
        const mockCompanies: Company[] = [
            {
                id: '1',
                name: 'Tech Corp',
                email: 'contact@techcorp.com',
                phone: '+1-555-0123',
                isActive: true,
                businessNature: 'Technology'
            },
            {
                id: '2',
                name: 'Design Inc',
                email: 'info@designinc.com',
                phone: '+1-555-0456',
                isActive: true,
                businessNature: 'Design'
            }
        ];

        setTimeout(() => {
            setCompanies(mockCompanies);
            setLoading(false);
        }, 1000);
    }, []);

    const statusBodyTemplate = (rowData: Company) => {
        return <span className={`badge ${rowData.isActive ? 'badge-success' : 'badge-secondary'}`}>{rowData.isActive ? 'Active' : 'Inactive'}</span>;
    };

    const header = (
        <div className="flex justify-content-between align-items-center">
            <h3>Company Management</h3>
            <div className="flex gap-2">
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText type="search" onInput={(e: React.FormEvent<HTMLInputElement>) => setGlobalFilter((e.target as HTMLInputElement).value)} placeholder="Search companies..." />
                </span>
                <Button label="New Company" icon="pi pi-plus" onClick={() => navigate('/companies/create')} />
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="flex justify-content-center align-items-center h-screen">
                <div className="text-center">
                    <i className="pi pi-spin pi-spinner text-4xl text-primary mb-3"></i>
                    <p>Loading companies...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4">
            <Card>
                <DataTable value={companies} paginator rows={10} rowsPerPageOptions={[5, 10, 25, 50]} globalFilter={globalFilter} header={header} emptyMessage="No companies found." dataKey="id" responsiveLayout="scroll">
                    <Column field="name" header="Name" sortable />
                    <Column field="email" header="Email" sortable />
                    <Column field="phone" header="Phone" sortable />
                    <Column field="businessNature" header="Business Nature" sortable />
                    <Column field="isActive" header="Status" body={statusBodyTemplate} sortable />
                </DataTable>
            </Card>
        </div>
    );
};

export default CompanyManagement;
