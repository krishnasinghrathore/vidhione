'use client';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Checkbox } from 'primereact/checkbox';
import { MultiSelect } from 'primereact/multiselect';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

interface Permission {
    id: string;
    name: string;
    description: string;
    resource: string;
    action: string;
}

function RoleForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;

    const [role, setRole] = useState({
        name: '',
        description: '',
        isActive: true,
        permissionIds: [] as string[]
    });

    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>([]);

    // Mock data for permissions
    useEffect(() => {
        const mockPermissions: Permission[] = [
            { id: '1', name: 'Read Users', description: 'Can view user information', resource: 'users', action: 'read' },
            { id: '2', name: 'Create Users', description: 'Can create new users', resource: 'users', action: 'create' },
            { id: '3', name: 'Update Users', description: 'Can update user information', resource: 'users', action: 'update' },
            { id: '4', name: 'Delete Users', description: 'Can delete users', resource: 'users', action: 'delete' },
            { id: '5', name: 'Read Companies', description: 'Can view company information', resource: 'companies', action: 'read' },
            { id: '6', name: 'Create Companies', description: 'Can create new companies', resource: 'companies', action: 'create' },
            { id: '7', name: 'Update Companies', description: 'Can update company information', resource: 'companies', action: 'update' },
            { id: '8', name: 'Delete Companies', description: 'Can delete companies', resource: 'companies', action: 'delete' },
            { id: '9', name: 'Read Roles', description: 'Can view role information', resource: 'roles', action: 'read' },
            { id: '10', name: 'Manage Roles', description: 'Can create and update roles', resource: 'roles', action: 'manage' }
        ];

        setPermissions(mockPermissions);

        // Mock role data if editing
        if (isEdit) {
            setRole({
                name: 'Admin',
                description: 'Administrator role with full access',
                isActive: true,
                permissionIds: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']
            });
            setSelectedPermissions(mockPermissions);
        }
    }, [isEdit]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Mock save operation
            console.log('Saving role:', role);
            navigate('/roles/list');
        } catch (error) {
            console.error('Error saving role:', error);
        }
    };

    const handlePermissionChange = (e: Permission[]) => {
        setSelectedPermissions(e);
        setRole({ ...role, permissionIds: e.map((permission) => permission.id) });
    };

    const permissionTemplate = (option: Permission) => {
        return (
            <div className="flex flex-column">
                <span className="font-medium">{option.name}</span>
                <span className="text-sm text-600">{option.description}</span>
            </div>
        );
    };

    return (
        <div className="card">
            <div className="flex justify-content-between align-items-center mb-4">
                <span className="text-900 text-xl font-bold">{isEdit ? 'Edit Role' : 'Create Role'}</span>
                <Button label="Back to List" icon="pi pi-arrow-left" className="p-button-secondary" onClick={() => navigate('/roles/list')} />
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid">
                    <div className="col-12 lg:col-2">
                        <div className="text-900 font-medium text-xl mb-3">Role Details</div>
                        <p className="m-0 p-0 text-600 line-height-3 mr-3">{isEdit ? 'Update role information and permissions.' : 'Create a new role with specific permissions.'}</p>
                    </div>
                    <div className="col-12 lg:col-10">
                        <div className="grid formgrid p-fluid">
                            <div className="field mb-4 col-12 md:col-6">
                                <label htmlFor="name" className="font-medium text-900">
                                    Role Name *
                                </label>
                                <InputText id="name" type="text" value={role.name} onChange={(e) => setRole({ ...role, name: e.target.value })} required />
                            </div>
                            <div className="field mb-4 col-12 md:col-6">
                                <label htmlFor="description" className="font-medium text-900">
                                    Description
                                </label>
                                <InputText id="description" type="text" value={role.description} onChange={(e) => setRole({ ...role, description: e.target.value })} />
                            </div>
                            <div className="field mb-4 col-12">
                                <label htmlFor="permissions" className="font-medium text-900">
                                    Permissions *
                                </label>
                                <MultiSelect
                                    id="permissions"
                                    options={permissions}
                                    value={selectedPermissions}
                                    onChange={(e) => handlePermissionChange(e.value)}
                                    optionLabel="name"
                                    itemTemplate={permissionTemplate}
                                    placeholder="Select Permissions"
                                    display="chip"
                                    showClear
                                />
                            </div>
                            <div className="field mb-4 col-12">
                                <div className="flex align-items-center">
                                    <Checkbox id="isActive" checked={role.isActive} onChange={(e) => setRole({ ...role, isActive: e.checked || false })} />
                                    <label htmlFor="isActive" className="ml-2 font-medium text-900">
                                        Active Role
                                    </label>
                                </div>
                            </div>
                            <div className="col-12">
                                <div className="flex gap-2">
                                    <Button type="submit" label={isEdit ? 'Update Role' : 'Create Role'} className="w-auto" />
                                    <Button type="button" label="Cancel" className="p-button-secondary w-auto" onClick={() => navigate('/roles/list')} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default RoleForm;
