import { pgView, text, numeric } from 'drizzle-orm/pg-core';

// Mirrors legacy Select_Acc_ProfitLoss_Cr and Dr output rows
export const selectAccProfitLossCr = pgView('select_acc_profitloss_cr', {
  ledgerGroup: text('ledgergroup'),
  ledger: text('ledger'),
  debitAmount: numeric('debitamount'),
  toDate: text('todate'),
  companyId: numeric('company_id'),
  companyFiscalYearId: numeric('company_fiscal_year_id')
}, { schema: 'accounts' });

export const selectAccProfitLossDr = pgView('select_acc_profitloss_dr', {
  ledgerGroup: text('ledgergroup'),
  ledger: text('ledger'),
  debitAmount: numeric('debitamount'),
  toDate: text('todate'),
  companyId: numeric('company_id'),
  companyFiscalYearId: numeric('company_fiscal_year_id')
}, { schema: 'accounts' });
