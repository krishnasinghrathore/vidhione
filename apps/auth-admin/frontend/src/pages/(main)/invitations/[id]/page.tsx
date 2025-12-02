'use client';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

interface Company {
    id: string;
    name: string;
}

interface Role {
    id: string;
    name: string;
}

function InvitationForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;

    const [invitation, setInvitation] = useState({
        email: '',
        companyId: '',
        roleId: '',
        expiresAt: null as Date | null
    });

    const [companies, setCompanies] = useState<Company[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);

    // Mock data
    useEffect(() => {
        const mockCompanies: Company[] = [
            { id: '1', name: 'Tech Corp' },
            { id: '2', name: 'Design Inc' },
            { id: '3', name: 'Marketing LLC' }
        ];

        const mockRoles: Role[] = [
            { id: '1', name: 'Admin' },
            { id: '2', name: 'User' },
            { id: '3', name: 'Manager' }
        ];

        setCompanies(mockCompanies);
        setRoles(mockRoles);

        // Mock invitation data if editing
        if (isEdit) {
            setInvitation({
                email: 'newuser@example.com',
                companyId: '1',
                roleId: '2',
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
            });
            setSelectedCompany(mockCompanies[0]);
            setSelectedRole(mockRoles[1]);
        }
    }, [isEdit]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Mock save operation
            console.log('Saving invitation:', invitation);
            navigate('/invitations/list');
        } catch (error) {
            console.error('Error saving invitation:', error);
        }
    };

    return (
        <div className="card">
            <div className="flex justify-content-between align-items-center mb-4">
                <span className="text-900 text-xl font-bold">{isEdit ? 'Edit Invitation' : 'Create Invitation'}</span>
                <Button label="Back to List" icon="pi pi-arrow-left" className="p-button-secondary" onClick={() => navigate('/invitations/list')} />
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid">
                    <div className="col-12 lg:col-2">
                        <div className="text-900 font-medium text-xl mb-3">Invitation Details</div>
                        <p className="m-0 p-0 text-600 line-height-3 mr-3">{isEdit ? 'Update invitation details.' : 'Send an invitation to join the company.'}</p>
                    </div>
                    <div className="col-12 lg:col-10">
                        <div className="grid formgrid p-fluid">
                            <div className="field mb-4 col-12 md:col-6">
                                <label htmlFor="email" className="font-medium text-900">
                                    Email Address *
                                </label>
                                <InputText id="email" type="email" value={invitation.email} onChange={(e) => setInvitation({ ...invitation, email: e.target.value })} required />
                            </div>
                            <div className="field mb-4 col-12 md:col-6">
                                <label htmlFor="company" className="font-medium text-900">
                                    Company *
                                </label>
                                <Dropdown
                                    id="company"
                                    options={companies}
                                    value={selectedCompany}
                                    onChange={(e) => {
                                        setSelectedCompany(e.value);
                                        setInvitation({ ...invitation, companyId: e.value?.id || '' });
                                    }}
                                    optionLabel="name"
                                    placeholder="Select Company"
                                    showClear
                                />
                            </div>
                            <div className="field mb-4 col-12 md:col-6">
                                <label htmlFor="role" className="font-medium text-900">
                                    Role *
                                </label>
                                <Dropdown
                                    id="role"
                                    options={roles}
                                    value={selectedRole}
                                    onChange={(e) => {
                                        setSelectedRole(e.value);
                                        setInvitation({ ...invitation, roleId: e.value?.id || '' });
                                    }}
                                    optionLabel="name"
                                    placeholder="Select Role"
                                    showClear
                                />
                            </div>
                            <div className="field mb-4 col-12 md:col-6">
                                <label htmlFor="expiresAt" className="font-medium text-900">
                                    Expiration Date *
                                </label>
                                <Calendar id="expiresAt" value={invitation.expiresAt} onChange={(e) => setInvitation({ ...invitation, expiresAt: e.value as Date })} showIcon dateFormat="yy-mm-dd" minDate={new Date()} required />
                            </div>
                            <div className="col-12">
                                <div className="flex gap-2">
                                    <Button type="submit" label={isEdit ? 'Update Invitation' : 'Send Invitation'} className="w-auto" />
                                    <Button type="button" label="Cancel" className="p-button-secondary w-auto" onClick={() => navigate('/invitations/list')} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default InvitationForm;
