/**
* Host bootstrap for apps/accounts:
* 1) Define Accounts & GST routes locally
* 2) Inject into window.__EXTRA_CHILD_ROUTES__ so the shared theme can merge them
* 3) Dynamically import the shared theme AFTER injection
*/
import React, { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import type { AppMenuItem } from '@vidhione/theme/types/layout';
import { menuModel } from './menu';

// Accounts pages (InterLogIQ-style: kebab-case folders with page.tsx leaves)
const AccountsLedger = lazy(() => import('./pages/accounts/ledger/page'));
const AccountsDayBook = lazy(() => import('./pages/accounts/day-book/page'));
const AccountsVoucherPayment = lazy(() => import('./pages/accounts/vouchers/payment/page'));
const AccountsVoucherReceipt = lazy(() => import('./pages/accounts/vouchers/receipt/page'));
const AccountsVoucherContra = lazy(() => import('./pages/accounts/vouchers/contra/page'));
const AccountsVoucherJournal = lazy(() => import('./pages/accounts/vouchers/journal/page'));
const AccountsTrialBalanceSummarized = lazy(() => import('./pages/accounts/trial-balance/summarized/page'));
const AccountsBalanceSheetSummarized = lazy(() => import('./pages/accounts/balance-sheet/summarized/page'));
const AccountsProfitLoss = lazy(() => import('./pages/accounts/profit-loss/page'));

// GST pages (InterLogIQ-style)
const GSTGstr1 = lazy(() => import('./pages/gst/gstr-1/page'));
const GSTGstr3b = lazy(() => import('./pages/gst/gstr-3b/page'));
const GSTEInvoice = lazy(() => import('./pages/gst/e-invoice/page'));
const GSTEWayBill = lazy(() => import('./pages/gst/e-way-bill/page'));
const GSTHsnSummarySale = lazy(() => import('./pages/gst/hsn-summary/sale/page'));

declare global {
 interface Window {
   __EXTRA_CHILD_ROUTES__?: RouteObject[];
   __APP_MENU_MODEL__?: AppMenuItem[];
 }
}

(async () => {
 // Inject per-app navigation + child routes under root layout for this host app
 window.__APP_MENU_MODEL__ = menuModel;
 window.__EXTRA_CHILD_ROUTES__ = [
   {
     path: 'accounts',
     children: [
       { path: 'ledger', element: <AccountsLedger /> },
       { path: 'day-book', element: <AccountsDayBook /> },
       {
         path: 'vouchers',
         children: [
           { path: 'payment', element: <AccountsVoucherPayment /> },
           { path: 'receipt', element: <AccountsVoucherReceipt /> },
           { path: 'contra', element: <AccountsVoucherContra /> },
           { path: 'journal', element: <AccountsVoucherJournal /> }
         ]
       },
       {
         path: 'trial-balance',
         children: [{ path: 'summarized', element: <AccountsTrialBalanceSummarized /> }]
       },
       {
         path: 'balance-sheet',
         children: [{ path: 'summarized', element: <AccountsBalanceSheetSummarized /> }]
       },
       {
         path: 'profit-loss',
         element: <AccountsProfitLoss />
       }
     ]
   },
   {
     path: 'gst',
     children: [
       { path: 'gstr-1', element: <GSTGstr1 /> },
       { path: 'gstr-3b', element: <GSTGstr3b /> },
       { path: 'e-invoice', element: <GSTEInvoice /> },
       { path: 'e-way-bill', element: <GSTEWayBill /> },
       {
         path: 'hsn-summary',
         children: [{ path: 'sale', element: <GSTHsnSummarySale /> }]
       }
     ]
   }
 ];

 // Dynamically load shared theme after route injection
 await import('@vidhione/theme/main');
})();
