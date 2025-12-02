import type { AppMenuItem } from '@vidhione/theme/types/layout';

export const menuModel: AppMenuItem[] = [
  { label: 'Wealth Home', icon: 'pi pi-home', to: '/wealth' },
  { label: 'Holdings', icon: 'pi pi-chart-line', to: '/wealth' },
  { label: 'Transactions', icon: 'pi pi-list', to: '/wealth/transactions' },
  { label: 'Realized P&L', icon: 'pi pi-percentage', to: '/wealth/realized' },
  { label: 'Imports', icon: 'pi pi-upload', to: '/wealth/imports' },
  {
    label: 'Manage',
    icon: 'pi pi-cog',
    items: [
      { label: 'Accounts', icon: 'pi pi-id-card', to: '/wealth/admin/accounts' },
      { label: 'Securities', icon: 'pi pi-briefcase', to: '/wealth/admin/securities' },
      { label: 'Prices', icon: 'pi pi-dollar', to: '/wealth/admin/prices' },
      { label: 'Corporate Actions', icon: 'pi pi-sitemap', to: '/wealth/admin/corporate-actions' },
      { label: 'Manual Transactions', icon: 'pi pi-pencil', to: '/wealth/admin/transactions' }
    ]
  }
];

export default menuModel;
