'use client';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Checkbox } from 'primereact/checkbox';
import { MultiSelect } from 'primereact/multiselect';
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

function UserCreate() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;

    const [user, setUser] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phoneNumber: '',
        isActive: true,
        companyId: '',
        roleIds: [] as string[]
    });

    const [companies, setCompanies] = useState<Company[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
    const [selectedRoles, setSelectedRoles] = useState<Role[]>([]);

    // Mock data for companies and roles
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

        // Mock user data if editing
        if (isEdit) {
            setUser({
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                password: '',
                phoneNumber: '+1-555-0123',
                isActive: true,
                companyId: '1',
                roleIds: ['1', '2']
            });
            setSelectedCompany(mockCompanies[0]);
            setSelectedRoles([mockRoles[0], mockRoles[1]]);
        }
    }, [isEdit]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Mock save operation
            console.log('Saving user:', user);
            navigate('/users/list');
        } catch (error) {
            console.error('Error saving user:', error);
        }
    };

    const handleRoleChange = (e: Role[]) => {
        setSelectedRoles(e);
        setUser({ ...user, roleIds: e.map((role) => role.id) });
    };

    return (
        <div className="card">
            <div className="flex justify-content-between align-items-center mb-4">
                <span className="text-900 text-xl font-bold">{isEdit ? 'Edit User' : 'Create User'}</span>
                <Button label="Back to List" icon="pi pi-arrow-left" className="p-button-secondary" onClick={() => navigate('/users/list')} />
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid">
                    <div className="col-12 lg:col-2">
                        <div className="text-900 font-medium text-xl mb-3">User Details</div>
                        <p className="m-0 p-0 text-600 line-height-3 mr-3">{isEdit ? 'Update user information and permissions.' : 'Create a new user account with appropriate permissions.'}</p>
                    </div>
                    <div className="col-12 lg:col-10">
                        <div className="grid formgrid p-fluid">
                            <div className="field mb-4 col-12 md:col-6">
                                <label htmlFor="firstName" className="font-medium text-900">
                                    First Name *
                                </label>
                                <InputText id="firstName" type="text" value={user.firstName} onChange={(e) => setUser({ ...user, firstName: e.target.value })} required />
                            </div>
                            <div className="field mb-4 col-12 md:col-6">
                                <label htmlFor="lastName" className="font-medium text-900">
                                    Last Name *
                                </label>
                                <InputText id="lastName" type="text" value={user.lastName} onChange={(e) => setUser({ ...user, lastName: e.target.value })} required />
                            </div>
                            <div className="field mb-4 col-12 md:col-6">
                                <label htmlFor="email" className="font-medium text-900">
                                    Email *
                                </label>
                                <InputText id="email" type="email" value={user.email} onChange={(e) => setUser({ ...user, email: e.target.value })} required />
                            </div>
                            <div className="field mb-4 col-12 md:col-6">
                                <label htmlFor="phoneNumber" className="font-medium text-900">
                                    Phone Number
                                </label>
                                <InputText id="phoneNumber" type="tel" value={user.phoneNumber} onChange={(e) => setUser({ ...user, phoneNumber: e.target.value })} />
                            </div>
                            {!isEdit && (
                                <div className="field mb-4 col-12 md:col-6">
                                    <label htmlFor="password" className="font-medium text-900">
                                        Password *
                                    </label>
                                    <Password id="password" value={user.password} onChange={(e) => setUser({ ...user, password: e.target.value })} required toggleMask />
                                </div>
                            )}
                            <div className="field mb-4 col-12 md:col-6">
                                <label htmlFor="company" className="font-medium text-900">
                                    Company
                                </label>
                                <Dropdown
                                    id="company"
                                    options={companies}
                                    value={selectedCompany}
                                    onChange={(e) => {
                                        setSelectedCompany(e.value);
                                        setUser({ ...user, companyId: e.value?.id || '' });
                                    }}
                                    optionLabel="name"
                                    placeholder="Select a Company"
                                    showClear
                                />
                            </div>
                            <div className="field mb-4 col-12">
                                <label htmlFor="roles" className="font-medium text-900">
                                    Roles
                                </label>
                                <MultiSelect id="roles" options={roles} value={selectedRoles} onChange={(e) => handleRoleChange(e.value)} optionLabel="name" placeholder="Select Roles" display="chip" />
                            </div>
                            <div className="field mb-4 col-12">
                                <div className="flex align-items-center">
                                    <Checkbox id="isActive" checked={user.isActive} onChange={(e) => setUser({ ...user, isActive: e.checked || false })} />
                                    <label htmlFor="isActive" className="ml-2 font-medium text-900">
                                        Active User
                                    </label>
                                </div>
                            </div>
                            <div className="col-12">
                                <div className="flex gap-2">
                                    <Button type="submit" label={isEdit ? 'Update User' : 'Create User'} className="w-auto" />
                                    <Button type="button" label="Cancel" className="p-button-secondary w-auto" onClick={() => navigate('/users/list')} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default UserCreate;
