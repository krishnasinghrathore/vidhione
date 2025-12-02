import React from 'react';
export { default as LedgerPage } from './LedgerPage';
export { default as DayBookPage } from './DayBookPage';

export function PaymentVoucherPage() {
  return (
    <div className="grid">
      <div className="col-12">
        <h2>Accounts • Voucher Entry — Payment</h2>
        <p>Scaffold page. Payment voucher form and ledger allocations will be implemented per screenshots.</p>
      </div>
    </div>
  );
}

export function TrialBalanceSummarizedPage() {
  return (
    <div className="grid">
      <div className="col-12">
        <h2>Accounts • Trial Balance (Summarized)</h2>
        <p>Scaffold page. Will include grouped totals, drill-down links, and export.</p>
      </div>
    </div>
  );
}

export function BalanceSheetSummarizedPage() {
  return (
    <div className="grid">
      <div className="col-12">
        <h2>Accounts • Balance Sheet (Summarized)</h2>
        <p>Scaffold page. Will include assets/liabilities sections with expand/collapse and export.</p>
      </div>
    </div>
  );
}