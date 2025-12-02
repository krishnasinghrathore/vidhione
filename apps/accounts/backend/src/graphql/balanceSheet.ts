// Balance Sheet query scaffold for Encore/GraphQL.
import { db } from '../db/client';
import { selectAccBalanceSheetCr, selectAccBalanceSheetDr } from '../db/schemas';

export type BalanceSheetParams = {
  toDate?: string;
  companyId?: string;
  yearId?: string;
  limit?: number;
  offset?: number;
};

export type BalanceSheetRow = {
  ledgerGroup: string;
  ledger: string;
  amount: string;
  side: 'Cr' | 'Dr';
  toDate?: string;
  companyId?: string;
  companyFiscalYearId?: string;
};

export async function fetchBalanceSheet(_params: BalanceSheetParams): Promise<BalanceSheetRow[]> {
  const limit = _params.limit ?? 100;
  const offset = _params.offset ?? 0;

  let crQuery = db.select().from(selectAccBalanceSheetCr);
  let drQuery = db.select().from(selectAccBalanceSheetDr);

  if (_params.companyId) {
    crQuery = crQuery.where((f) => f.companyId.eq(_params.companyId));
    drQuery = drQuery.where((f) => f.companyId.eq(_params.companyId));
  }
  if (_params.yearId) {
    crQuery = crQuery.where((f) => f.companyFiscalYearId.eq(_params.yearId));
    drQuery = drQuery.where((f) => f.companyFiscalYearId.eq(_params.yearId));
  }
  // TODO: toDate/year filters once rules are defined.

  const crRows = await crQuery.limit(limit).offset(offset);
  const drRows = await drQuery.limit(limit).offset(offset);

  const mappedCr = crRows.map((r) => ({
    ledgerGroup: r.ledgerGroup ?? '',
    ledger: r.ledger ?? '',
    amount: r.creditAmount !== null && r.creditAmount !== undefined ? String(r.creditAmount) : '0',
    side: 'Cr' as const,
    toDate: r.toDate ?? undefined,
    companyId: r.companyId !== null && r.companyId !== undefined ? String(r.companyId) : undefined,
    companyFiscalYearId: r.companyFiscalYearId !== null && r.companyFiscalYearId !== undefined ? String(r.companyFiscalYearId) : undefined
  }));

  const mappedDr = drRows.map((r) => ({
    ledgerGroup: r.ledgerGroup ?? '',
    ledger: r.ledger ?? '',
    amount: r.debitAmount !== null && r.debitAmount !== undefined ? String(r.debitAmount) : '0',
    side: 'Dr' as const,
    toDate: r.toDate ?? undefined,
    companyId: r.companyId !== null && r.companyId !== undefined ? String(r.companyId) : undefined,
    companyFiscalYearId: r.companyFiscalYearId !== null && r.companyFiscalYearId !== undefined ? String(r.companyFiscalYearId) : undefined
  }));

  return [...mappedCr, ...mappedDr];
}
