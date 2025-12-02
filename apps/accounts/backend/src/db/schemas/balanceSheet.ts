import { pgView, text, numeric } from 'drizzle-orm/pg-core';

// Mirrors legacy Select_Acc_BalanceSheet_Cr/Dr output rows
export const selectAccBalanceSheetCr = pgView('select_acc_balancesheet_cr', {
  ledgerGroup: text('ledgergroup'),
  ledger: text('ledger'),
  creditAmount: numeric('creditamount'),
  toDate: text('todate'),
  companyId: numeric('company_id'),
  companyFiscalYearId: numeric('company_fiscal_year_id')
}, { schema: 'accounts' });

export const selectAccBalanceSheetDr = pgView('select_acc_balancesheet_dr', {
  ledgerGroup: text('ledgergroup'),
  ledger: text('ledger'),
  debitAmount: numeric('debitamount'),
  toDate: text('todate'),
  companyId: numeric('company_id'),
  companyFiscalYearId: numeric('company_fiscal_year_id')
}, { schema: 'accounts' });
