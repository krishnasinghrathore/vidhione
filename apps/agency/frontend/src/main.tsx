import React from 'react';
import type { AppMenuItem } from '@vidhione/theme/types/layout';
import { menuModel } from './menu';

// Prefer page-per-route files (mirrors Accounts)
// Dashboard
import AgencyDashboardPage from './pages/agency/dashboard/page';

// Masters
import { MastersItemMasterPage } from './pages';
import { MastersLedgerMasterPage, MastersCityMasterPage, MastersStateMasterPage, MastersCompanyDetailsBasicPage, MastersCompanyDetailsBankPage, MastersHSNCodeMasterPage, MastersItemTypeMasterPage, MastersTransportMasterPage, MastersUserMasterPage } from './pages';

// Reports
import { ReportsSaleBookPage } from './pages';
import { ReportsPurchaseBookPage, ReportsStockPositionPage, ReportsDeliveryProcessBookPage, ReportsPartyRatesBookPage, ReportsClosingStockBookPage, ReportsPartyWiseItemSaleDetailPage, ReportsSaleBookWithSummaryPage, ReportsPurchaseReturnBookPage } from './pages';

// Transactions
import { TransactionsSalesInvoicePage, TransactionsPurchaseInvoicePage, TransactionsDeliveryProcessPage, TransactionsEstimatePage, TransactionsBillCollectionPage, TransactionsPartyLoyaltyProgramPage, TransactionsChequeBookIssuePage, TransactionsChequeInwardPage, TransactionsMoneyReceiptCashPage, TransactionsMoneyReceiptBankPage, TransactionsRetailerFootPathPage } from './pages';

// Additional + Tools
import { AdditionalFeaturesAddressBookPage, AdditionalFeaturesSendMailPage } from './pages';
import { ToolsOptionsPage, ToolsReportSettingPage } from './pages';

// Inject Agency-specific routes into the shared theme router
declare global {
 interface Window {
   __EXTRA_CHILD_ROUTES__?: any[];
   __APP_MENU_MODEL__?: AppMenuItem[];
 }
}

window.__EXTRA_CHILD_ROUTES__ = [
  {
    path: 'agency',
    children: [
      { path: 'dashboard', element: <AgencyDashboardPage /> },
      {
        path: 'masters',
        children: [
          { path: 'item-master', element: <MastersItemMasterPage /> },
          { path: 'ledger-master', element: <MastersLedgerMasterPage /> },
          { path: 'city-master', element: <MastersCityMasterPage /> },
          { path: 'state-master', element: <MastersStateMasterPage /> },
          { path: 'company-details-basic', element: <MastersCompanyDetailsBasicPage /> },
          { path: 'company-details-bank', element: <MastersCompanyDetailsBankPage /> },
          { path: 'hsn-code-master', element: <MastersHSNCodeMasterPage /> },
          { path: 'item-type-master', element: <MastersItemTypeMasterPage /> },
          { path: 'transport-master', element: <MastersTransportMasterPage /> },
          { path: 'user-master', element: <MastersUserMasterPage /> }
        ]
      },
      {
        path: 'reports',
        children: [
          { path: 'sale-book', element: <ReportsSaleBookPage /> },
          { path: 'purchase-book', element: <ReportsPurchaseBookPage /> },
          { path: 'stock-position', element: <ReportsStockPositionPage /> }
        ]
      },
      {
        path: 'transactions',
        children: [
          { path: 'sales-invoice', element: <TransactionsSalesInvoicePage /> },
          { path: 'purchase-invoice', element: <TransactionsPurchaseInvoicePage /> }
        ]
      },
      {
        path: 'additional',
        children: [
          { path: 'address-book', element: <AdditionalFeaturesAddressBookPage /> },
          { path: 'send-mail', element: <AdditionalFeaturesSendMailPage /> }
        ]
      },
      {
        path: 'tools',
        children: [
          { path: 'options', element: <ToolsOptionsPage /> },
          { path: 'report-setting', element: <ToolsReportSettingPage /> }
        ]
      }
    ]
  }
];

// Delegate to shared InterLogIQ-style theme app (router will merge injected routes)
// Ensure injection happens BEFORE the theme boots by using a dynamic import
(async () => {
  window.__APP_MENU_MODEL__ = menuModel;
  await import('@vidhione/theme/main');
})();
