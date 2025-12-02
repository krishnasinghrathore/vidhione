import type { AppMenuItem } from '@vidhione/theme/types/layout';

export const menuModel: AppMenuItem[] = [
  {
    label: 'Dashboard',
    icon: 'pi pi-home',
    to: '/',
  },
  {
    label: 'Accounts',
    icon: 'pi pi-briefcase',
    items: [
      { label: 'Ledger', icon: 'pi pi-book', to: '/accounts/ledger' },
      { label: 'Day Book', icon: 'pi pi-calendar', to: '/accounts/day-book' },
      {
        label: 'Voucher Entry',
        icon: 'pi pi-file-edit',
        items: [
          { label: 'Payment', icon: 'pi pi-arrow-right', to: '/accounts/vouchers/payment' },
          { label: 'Receipt', icon: 'pi pi-arrow-left', to: '/accounts/vouchers/receipt' },
          { label: 'Contra', icon: 'pi pi-sync', to: '/accounts/vouchers/contra' },
          { label: 'Journal', icon: 'pi pi-pen-to-square', to: '/accounts/vouchers/journal' },
        ],
      },
      {
        label: 'Trial Balance',
        icon: 'pi pi-list',
        items: [{ label: 'Summarized', icon: 'pi pi-align-left', to: '/accounts/trial-balance/summarized' }],
      },
      {
        label: 'Balance Sheet',
        icon: 'pi pi-chart-line',
        items: [{ label: 'Summarized', icon: 'pi pi-chart-bar', to: '/accounts/balance-sheet/summarized' }],
      },
      { label: 'Profit & Loss', icon: 'pi pi-chart-pie', to: '/accounts/profit-loss' },
    ],
  },
  {
    label: 'GST',
    icon: 'pi pi-percentage',
    items: [
      { label: 'GSTR-1', icon: 'pi pi-table', to: '/gst/gstr-1' },
      { label: 'GSTR-3B', icon: 'pi pi-chart-bar', to: '/gst/gstr-3b' },
      { label: 'E-Invoice', icon: 'pi pi-send', to: '/gst/e-invoice' },
      { label: 'E-Way Bill', icon: 'pi pi-truck', to: '/gst/e-way-bill' },
      {
        label: 'HSN Summary',
        icon: 'pi pi-tags',
        items: [{ label: 'Sale', icon: 'pi pi-arrow-right-arrow-left', to: '/gst/hsn-summary/sale' }],
      },
    ],
  },
  {
    label: 'Reports',
    icon: 'pi pi-chart-bar',
    items: [
      { label: 'Realized P&L', icon: 'pi pi-chart-line', to: '/accounts/reports/realized-pnl' },
      { label: 'Unrealized P&L', icon: 'pi pi-chart-area', to: '/accounts/reports/unrealized-pnl' },
    ],
    visible: false, // enable when feature pages are ready
  },
];

export default menuModel;
