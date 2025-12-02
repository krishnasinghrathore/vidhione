import { pgView, text, numeric, integer, smallint } from 'drizzle-orm/pg-core';

// Mirrors legacy Select_Acc_Ledger output (dataset_Accounts.Designer.cs)
export const selectAccLedger = pgView('select_acc_ledger', {
  id: numeric('id'),
  voucherDate: text('voucherdate'),
  voucherDateCast: text('voucherdate_cast'),
  voucherNo: text('voucherno'),
  voucherType: text('vouchertype'),
  ledger: text('ledger'),
  voucherDate1: text('voucherdate1'),
  ledgerId: numeric('ledgerid'),
  ledgerGroup: text('ledgergroup'),
  ledgerGroupId: numeric('ledgergroupid'),
  agLedger: text('agledger'),
  narration: text('narration'),
  drAmt: numeric('dramt'),
  crAmt: numeric('cramt'),
  balance: numeric('balance'),
  drCr: text('drcr'),
  fVoucherTypeMaster: numeric('f_vouchertypemaster'),
  isOpening: smallint('isopening'),
  agLedgerDetail: text('agledgerdetail'),
  companyId: numeric('company_id')
}, { schema: 'accounts' });

// TODO: create corresponding PostgreSQL view that matches column names/types above.
