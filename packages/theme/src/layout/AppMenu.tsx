import AppSubMenu from './AppSubMenu';
import type { AppMenuItem } from '@/types/layout';

declare global {
    interface Window {
        __APP_MENU_MODEL__?: AppMenuItem[];
    }
}

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

/* App-scoped feature flags to selectively expose menus in individual apps.
   Accounts frontend will set these via .env */
const appName = String((import.meta as any).env?.VITE_APP_NAME || '');
const enableAccounts =
    (() => {
        try {
            const flag = String((import.meta as any).env?.VITE_ENABLE_ACCOUNTS || '').toLowerCase();
            if (flag === '1' || flag === 'true') return true;
            return /accounts/i.test(appName);
        } catch {
            return false;
        }
    })();

const enableGST =
    (() => {
        try {
            const flag = String((import.meta as any).env?.VITE_ENABLE_GST || '').toLowerCase();
            if (flag === '1' || flag === 'true') return true;
            return /accounts/i.test(appName);
        } catch {
            return false;
        }
    })();

/* Agency module visibility:
   - Enabled automatically when VITE_APP_NAME contains "Agency"
   - Or when VITE_ENABLE_AGENCY=true|1
*/
const enableAgency =
    (() => {
        try {
            const flag = String((import.meta as any).env?.VITE_ENABLE_AGENCY || '').toLowerCase();
            if (flag === '1' || flag === 'true') return true;
            return /agency/i.test(appName);
        } catch {
            return false;
        }
    })();

export const defaultMenuModel: AppMenuItem[] = [
    {
        label: 'Fleet Overview',
        icon: 'pi pi-home',
        to: '/'
    },
    {
        label: 'Maintenance Records',
        icon: 'pi pi-wrench',
        to: '/maintenance/records'
    },
    {
        label: 'Work Orders',
        icon: 'pi pi-file-edit',
        to: '/maintenance/work-orders/list'
    },
    {
        label: 'Vehicles',
        icon: 'pi pi-car',
        to: '/fleet/vehicles/list'
    },
    {
        label: 'Drivers',
        icon: 'pi pi-users',
        to: '/fleet/drivers/list'
    },

    // Agency module
    {
        label: 'Agency',
        icon: 'pi pi-briefcase',
        visible: enableAgency,
        items: [
            { label: 'Dashboard', icon: 'pi pi-home', to: '/agency/dashboard' },
            {
                label: 'Masters',
                icon: 'pi pi-database',
                items: [
                    { label: 'Item Master', icon: 'pi pi-box', to: '/agency/masters/item-master' },
                    { label: 'Ledger Master', icon: 'pi pi-book', to: '/agency/masters/ledger-master' },
                    { label: 'City Master', icon: 'pi pi-map-marker', to: '/agency/masters/city-master' },
                    { label: 'State Master', icon: 'pi pi-map', to: '/agency/masters/state-master' },
                    { label: 'Company Details (Basic)', icon: 'pi pi-building', to: '/agency/masters/company-details-basic' },
                    { label: 'Company Details (Bank)', icon: 'pi pi-credit-card', to: '/agency/masters/company-details-bank' },
                    { label: 'HSN Code Master', icon: 'pi pi-hashtag', to: '/agency/masters/hsn-code-master' },
                    { label: 'Item Type Master', icon: 'pi pi-tag', to: '/agency/masters/item-type-master' },
                    { label: 'Transport Master', icon: 'pi pi-truck', to: '/agency/masters/transport-master' },
                    { label: 'User Master', icon: 'pi pi-user', to: '/agency/masters/user-master' }
                ]
            },
            {
                label: 'Reports',
                icon: 'pi pi-chart-bar',
                items: [
                    { label: 'Sale Book', icon: 'pi pi-table', to: '/agency/reports/sale-book' },
                    { label: 'Purchase Book', icon: 'pi pi-shopping-bag', to: '/agency/reports/purchase-book' },
                    { label: 'Stock Position', icon: 'pi pi-chart-line', to: '/agency/reports/stock-position' }
                ]
            },
            {
                label: 'Transactions',
                icon: 'pi pi-file-edit',
                items: [
                    { label: 'Sales Invoice', icon: 'pi pi-arrow-right', to: '/agency/transactions/sales-invoice' },
                    { label: 'Purchase Invoice', icon: 'pi pi-arrow-left', to: '/agency/transactions/purchase-invoice' }
                ]
            },
            {
                label: 'Additional Features',
                icon: 'pi pi-plus-circle',
                items: [
                    { label: 'Address Book', icon: 'pi pi-address-book', to: '/agency/additional/address-book' },
                    { label: 'Send Mail', icon: 'pi pi-send', to: '/agency/additional/send-mail' }
                ]
            },
            {
                label: 'Tools',
                icon: 'pi pi-cog',
                items: [
                    { label: 'Options', icon: 'pi pi-sliders-h', to: '/agency/tools/options' },
                    { label: 'Report Setting', icon: 'pi pi-list', to: '/agency/tools/report-setting' }
                ]
            }
        ]
    },

    // Accounts module
    {
        label: 'Accounts',
        icon: 'pi pi-briefcase',
        visible: enableAccounts,
        items: [
            { label: 'Ledger', icon: 'pi pi-book', to: '/accounts/ledger' },
            { label: 'Day Book', icon: 'pi pi-calendar', to: '/accounts/day-book' },
            {
                label: 'Voucher Entry',
                icon: 'pi pi-file-edit',
                items: [
                    { label: 'Payment', icon: 'pi pi-arrow-right', to: '/accounts/vouchers/payment' }
                    // Additional vouchers can be enabled later: Receipt, Contra, Journal, etc.
                ]
            },
            {
                label: 'Trial Balance (Summarized)',
                icon: 'pi pi-list',
                to: '/accounts/trial-balance/summarized'
            },
            {
                label: 'Balance Sheet (Summarized)',
                icon: 'pi pi-chart-line',
                to: '/accounts/balance-sheet/summarized'
            }
        ]
    },

    // GST module
    {
        label: 'GST',
        icon: 'pi pi-percentage',
        visible: enableGST,
        items: [
            { label: 'GSTR-1', icon: 'pi pi-table', to: '/gst/gstr-1' },
            { label: 'GSTR-3B', icon: 'pi pi-chart-bar', to: '/gst/gstr-3b' },
            { label: 'E-Invoice', icon: 'pi pi-send', to: '/gst/e-invoice' },
            { label: 'E-Way Bill', icon: 'pi pi-truck', to: '/gst/e-way-bill' },
            { label: 'HSN Summary (Sale)', icon: 'pi pi-tags', to: '/gst/hsn-summary/sale' }
        ]
    },

    {
        label: 'Documents',
        icon: 'pi pi-box',
        visible: isAdmin,
        items: [
            {
                label: 'Archived Documents',
                icon: 'pi pi-history',
                to: '/documents/archived'
            }
        ]
    },
    {
        label: 'Reports',
        icon: 'pi pi-chart-bar',
        items: [
            {
                label: 'Fleet Reports',
                icon: 'pi pi-fw pi-chart-line',
                to: '/reports/fleet'
            },
            {
                label: 'Maintenance Reports',
                icon: 'pi pi-fw pi-chart-pie',
                to: '/reports/maintenance'
            },
            {
                label: 'Cost Reports',
                icon: 'pi pi-fw pi-chart-bar',
                to: '/reports/costs'
            },
            {
                label: 'Performance Reports',
                icon: 'pi pi-fw pi-chart-area',
                to: '/reports/performance'
            }
        ]
    },
    {
        label: 'Settings',
        icon: 'pi pi-cog',
        visible: isAdminOrSuper,
        items: [
            {
                label: 'User Management',
                icon: 'pi pi-fw pi-users',
                to: '/settings/users'
            },
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

const readInjectedMenu = (): AppMenuItem[] | undefined => {
    try {
        const globalMenu = (globalThis as any)?.__APP_MENU_MODEL__;
        if (Array.isArray(globalMenu)) {
            return globalMenu as AppMenuItem[];
        }
    } catch {
        // ignore
    }

    if (typeof window !== 'undefined' && Array.isArray(window.__APP_MENU_MODEL__)) {
        return window.__APP_MENU_MODEL__;
    }

    return undefined;
};

export const getMenuModel = (override?: AppMenuItem[]): AppMenuItem[] => {
    if (override && override.length > 0) {
        return override;
    }

    const injected = readInjectedMenu();
    if (injected && injected.length > 0) {
        return injected;
    }

    return defaultMenuModel;
};

export type AppMenuProps = {
    model?: AppMenuItem[];
};

const AppMenu = ({ model }: AppMenuProps) => {
    const resolvedModel = getMenuModel(model);
    return <AppSubMenu model={resolvedModel} />;
};

export default AppMenu;
