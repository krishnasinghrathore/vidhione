import AppSubMenu from './AppSubMenu';
import type { AppMenuItem } from '@/types/layout';

// Admin detection (align with DocumentUploader)
const isAdmin = (() => {
    try {
        const envRole = String((import.meta as any).env?.VITE_USER_ROLE || '').toLowerCase();
        const envFlag = String((import.meta as any).env?.VITE_ADMIN_MODE || '').toLowerCase();
        if (envRole === 'admin' || envFlag === 'true' || envFlag === '1') return true;
        const v = (typeof window !== 'undefined' ? localStorage.getItem('userRole') : '') || '';
        return v.toLowerCase() === 'admin';
    } catch {
        return false;
    }
})();

// Super Admin detection and combined flag
const isSuperAdmin = (() => {
    try {
        const envRole = String((import.meta as any).env?.VITE_USER_ROLE || '').toLowerCase();
        const v = (typeof window !== 'undefined' ? localStorage.getItem('userRole') : '') || '';
        return envRole === 'superadmin' || v.toLowerCase() === 'superadmin';
    } catch {
        return false;
    }
})();

const isAdminOrSuper = isAdmin || isSuperAdmin;

export const model: AppMenuItem[] = [
    {
        label: 'Dashboard',
        icon: 'pi pi-home',
        to: '/dashboard'
    },
    {
        label: 'Users',
        icon: 'pi pi-users',
        to: '/users/list'
    },
    {
        label: 'Companies',
        icon: 'pi pi-building',
        to: '/companies/list'
    },
    {
        label: 'Roles',
        icon: 'pi pi-shield',
        to: '/roles/list'
    },
    {
        label: 'Invitations',
        icon: 'pi pi-send',
        to: '/invitations/list'
    },
    {
        label: 'Settings',
        icon: 'pi pi-cog',
        visible: isAdminOrSuper,
        items: [
            {
                label: 'System Configuration',
                icon: 'pi pi-fw pi-sliders-h',
                to: '/settings/config'
            },
            {
                label: 'Document Types',
                icon: 'pi pi-fw pi-file',
                to: '/settings/document-types'
            },
            {
                label: 'Notifications',
                icon: 'pi pi-fw pi-bell',
                to: '/settings/notifications'
            }
        ]
    }
];
const AppMenu = () => {
    return <AppSubMenu model={model} />;
};

export default AppMenu;
