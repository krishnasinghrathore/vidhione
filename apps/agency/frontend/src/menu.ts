import type { AppMenuItem } from '@vidhione/theme/types/layout';

export const menuModel: AppMenuItem[] = [
  {
    label: 'Dashboard',
    icon: 'pi pi-home',
    to: '/agency/dashboard',
  },
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
      { label: 'User Master', icon: 'pi pi-user', to: '/agency/masters/user-master' },
    ],
  },
  {
    label: 'Reports',
    icon: 'pi pi-chart-bar',
    items: [
      { label: 'Sale Book', icon: 'pi pi-table', to: '/agency/reports/sale-book' },
      { label: 'Purchase Book', icon: 'pi pi-shopping-bag', to: '/agency/reports/purchase-book' },
      { label: 'Stock Position', icon: 'pi pi-chart-line', to: '/agency/reports/stock-position' },
    ],
  },
  {
    label: 'Transactions',
    icon: 'pi pi-file-edit',
    items: [
      { label: 'Sales Invoice', icon: 'pi pi-arrow-right', to: '/agency/transactions/sales-invoice' },
      { label: 'Purchase Invoice', icon: 'pi pi-arrow-left', to: '/agency/transactions/purchase-invoice' },
    ],
  },
  {
    label: 'Additional Features',
    icon: 'pi pi-plus-circle',
    items: [
      { label: 'Address Book', icon: 'pi pi-address-book', to: '/agency/additional/address-book' },
      { label: 'Send Mail', icon: 'pi pi-send', to: '/agency/additional/send-mail' },
    ],
  },
  {
    label: 'Tools',
    icon: 'pi pi-cog',
    items: [
      { label: 'Options', icon: 'pi pi-sliders-h', to: '/agency/tools/options' },
      { label: 'Report Setting', icon: 'pi pi-list', to: '/agency/tools/report-setting' },
    ],
  },
];

export default menuModel;
