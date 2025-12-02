import React, { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import type { AppMenuItem } from '@vidhione/theme/types/layout';
import menuModel from './menu';

const HoldingsPage = lazy(() => import('./pages/holdings/page'));
const TransactionsPage = lazy(() => import('./pages/transactions/page'));
const RealizedPage = lazy(() => import('./pages/realized/page'));
const ImportPage = lazy(() => import('./pages/imports/page'));
const AccountsAdminPage = lazy(() => import('./pages/admin/accounts/page'));
const SecuritiesAdminPage = lazy(() => import('./pages/admin/securities/page'));
const PricesAdminPage = lazy(() => import('./pages/admin/prices/page'));
const CorporateActionsAdminPage = lazy(() => import('./pages/admin/corporate-actions/page'));
const TransactionsAdminPage = lazy(() => import('./pages/admin/transactions/page'));

declare global {
  interface Window {
    __EXTRA_CHILD_ROUTES__?: RouteObject[];
    __APP_MENU_MODEL__?: AppMenuItem[];
  }
}

window.__EXTRA_CHILD_ROUTES__ = [
  {
    path: 'wealth',
    children: [
      { index: true, element: <HoldingsPage /> },
      { path: 'transactions', element: <TransactionsPage /> },
      { path: 'realized', element: <RealizedPage /> },
      { path: 'imports', element: <ImportPage /> },
      { path: 'admin/accounts', element: <AccountsAdminPage /> },
      { path: 'admin/securities', element: <SecuritiesAdminPage /> },
      { path: 'admin/prices', element: <PricesAdminPage /> },
      { path: 'admin/corporate-actions', element: <CorporateActionsAdminPage /> },
      { path: 'admin/transactions', element: <TransactionsAdminPage /> }
    ]
  }
];

(async () => {
  window.__APP_MENU_MODEL__ = menuModel;
  await import('@vidhione/theme/main');
})();
