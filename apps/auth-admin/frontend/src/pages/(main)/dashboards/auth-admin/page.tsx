'use client';
import React from 'react';
import { Card } from 'primereact/card';
import { Chart } from 'primereact/chart';
import { ProgressBar } from 'primereact/progressbar';
import { Badge } from 'primereact/badge';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';

const AuthAdminDashboard = () => {
    const navigate = useNavigate();

    // Mock data for now - replace with GraphQL when backend is ready
    const stats = {
        totalUsers: 1250,
        activeUsers: 1180,
        totalCompanies: 45,
        activeCompanies: 42,
        totalRoles: 8,
        recentLogins: 89,
        failedLoginAttempts: 12
    };

    // Chart data for user growth
    const userGrowthData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                label: 'New Users',
                data: [12, 19, 15, 25, 22, 30],
                borderColor: '#42A5F5',
                backgroundColor: 'rgba(66, 165, 245, 0.2)',
                tension: 0.4
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const
            },
            title: {
                display: true,
                text: 'User Growth Trend'
            }
        }
    };

    return (
        <div className="p-4">
            <div className="flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="text-3xl font-bold m-0">Auth Admin Dashboard</h1>
                    <p className="text-gray-600 mt-2">Manage users, companies, and authentication</p>
                </div>
                <div className="flex gap-2">
                    <Button label="Create User" icon="pi pi-plus" className="p-button-primary" onClick={() => navigate('/users/list')} />
                    <Button label="Create Company" icon="pi pi-building" className="p-button-secondary" onClick={() => navigate('/companies/list')} />
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid mb-4">
                <div className="col-12 md:col-3">
                    <Card className="shadow-2">
                        <div className="flex justify-content-between align-items-center">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Total Users</p>
                                <h3 className="m-0 text-primary">{stats.totalUsers}</h3>
                            </div>
                            <div className="bg-blue-100 p-3 border-round">
                                <i className="pi pi-users text-2xl text-blue-600"></i>
                            </div>
                        </div>
                        <div className="mt-3">
                            <ProgressBar value={(stats.activeUsers / stats.totalUsers) * 100 || 0} showValue={false} className="h-1rem" />
                            <p className="text-xs text-gray-500 mt-2">{stats.activeUsers} active users</p>
                        </div>
                    </Card>
                </div>

                <div className="col-12 md:col-3">
                    <Card className="shadow-2">
                        <div className="flex justify-content-between align-items-center">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Total Companies</p>
                                <h3 className="m-0 text-green-600">{stats.totalCompanies}</h3>
                            </div>
                            <div className="bg-green-100 p-3 border-round">
                                <i className="pi pi-building text-2xl text-green-600"></i>
                            </div>
                        </div>
                        <div className="mt-3">
                            <ProgressBar value={(stats.activeCompanies / stats.totalCompanies) * 100 || 0} showValue={false} className="h-1rem" />
                            <p className="text-xs text-gray-500 mt-2">{stats.activeCompanies} active companies</p>
                        </div>
                    </Card>
                </div>

                <div className="col-12 md:col-3">
                    <Card className="shadow-2">
                        <div className="flex justify-content-between align-items-center">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Recent Logins</p>
                                <h3 className="m-0 text-orange-600">{stats.recentLogins}</h3>
                            </div>
                            <div className="bg-orange-100 p-3 border-round">
                                <i className="pi pi-sign-in text-2xl text-orange-600"></i>
                            </div>
                        </div>
                        <div className="mt-3">
                            <p className="text-xs text-gray-500">Last 24 hours</p>
                        </div>
                    </Card>
                </div>

                <div className="col-12 md:col-3">
                    <Card className="shadow-2">
                        <div className="flex justify-content-between align-items-center">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Failed Attempts</p>
                                <h3 className="m-0 text-red-600">{stats.failedLoginAttempts}</h3>
                            </div>
                            <div className="bg-red-100 p-3 border-round">
                                <i className="pi pi-exclamation-triangle text-2xl text-red-600"></i>
                            </div>
                        </div>
                        <div className="mt-3">
                            <p className="text-xs text-gray-500">Last 24 hours</p>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Charts and Recent Activity */}
            <div className="grid">
                <div className="col-12 md:col-8">
                    <Card className="shadow-2" title="User Growth Trend">
                        <Chart type="line" data={userGrowthData} options={chartOptions} />
                    </Card>
                </div>

                <div className="col-12 md:col-4">
                    <Card className="shadow-2" title="Quick Actions">
                        <div className="flex flex-column gap-3">
                            <Button label="Invite User" icon="pi pi-send" className="p-button-outlined" onClick={() => navigate('/invitations/list')} />
                            <Button label="Manage Roles" icon="pi pi-shield" className="p-button-outlined" onClick={() => navigate('/roles/list')} />
                            <Button
                                label="View Audit Logs"
                                icon="pi pi-history"
                                className="p-button-outlined"
                                onClick={() => {
                                    /* Navigate to audit logs */
                                }}
                            />
                            <Button
                                label="System Settings"
                                icon="pi pi-cog"
                                className="p-button-outlined"
                                onClick={() => {
                                    /* Navigate to settings */
                                }}
                            />
                        </div>
                    </Card>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="grid mt-4">
                <div className="col-12">
                    <Card className="shadow-2" title="Recent Activity">
                        <div className="overflow-auto" style={{ maxHeight: '300px' }}>
                            <div className="flex flex-column gap-3">
                                {/* Mock recent activities - replace with real data */}
                                <div className="flex align-items-center gap-3 p-3 border-1 border-round surface-border">
                                    <Badge value="U" severity="info" className="w-2rem h-2rem" />
                                    <div className="flex-1">
                                        <p className="m-0 font-medium">New user registered</p>
                                        <p className="m-0 text-sm text-gray-600">john.doe@example.com joined ACME Corp</p>
                                    </div>
                                    <span className="text-sm text-gray-500">2 min ago</span>
                                </div>

                                <div className="flex align-items-center gap-3 p-3 border-1 border-round surface-border">
                                    <Badge value="C" severity="success" className="w-2rem h-2rem" />
                                    <div className="flex-1">
                                        <p className="m-0 font-medium">Company created</p>
                                        <p className="m-0 text-sm text-gray-600">Tech Solutions Inc. was registered</p>
                                    </div>
                                    <span className="text-sm text-gray-500">15 min ago</span>
                                </div>

                                <div className="flex align-items-center gap-3 p-3 border-1 border-round surface-border">
                                    <Badge value="L" severity="warning" className="w-2rem h-2rem" />
                                    <div className="flex-1">
                                        <p className="m-0 font-medium">Failed login attempt</p>
                                        <p className="m-0 text-sm text-gray-600">Multiple failed attempts from IP 192.168.1.1</p>
                                    </div>
                                    <span className="text-sm text-gray-500">1 hour ago</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AuthAdminDashboard;
