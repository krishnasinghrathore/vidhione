import { pgView, text, numeric } from 'drizzle-orm/pg-core';

// Mirrors legacy Select_Acc_TrialBalance output
export const selectAccTrialBalance = pgView('select_acc_trialbalance', {
  ledgerGroup: text('ledgergroup'),
  ledger: text('ledger'),
  openingBalance: numeric('openingbalance'),
  debitAmount: numeric('debitamount'),
  creditAmount: numeric('creditamount'),
  toDate: text('todate'),
  companyId: numeric('company_id'),
  companyFiscalYearId: numeric('company_fiscal_year_id')
}, { schema: 'accounts' });

export const selectAccLedgerCurrentBalance = pgView('select_acc_ledgcurrentbal', {
  ledgerGroup: text('ledgergroup'),
  ledger: text('ledger'),
  amount: numeric('amount'),
  drCr: numeric('drcr')
}, { schema: 'accounts' });
