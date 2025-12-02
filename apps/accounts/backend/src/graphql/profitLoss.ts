// Profit & Loss query scaffold for Encore/GraphQL.
import { db } from '../db/client';
import { selectAccProfitLossCr, selectAccProfitLossDr } from '../db/schemas';

export type ProfitLossParams = {
  toDate?: string;
  companyId?: string;
  yearId?: string;
  limit?: number;
  offset?: number;
};

export type ProfitLossRow = {
  ledgerGroup: string;
  ledger: string;
  amount: string;
  side: 'Cr' | 'Dr';
  toDate?: string;
  companyId?: string;
  companyFiscalYearId?: string;
};

export async function fetchProfitLoss(_params: ProfitLossParams): Promise<ProfitLossRow[]> {
  const limit = _params.limit ?? 100;
  const offset = _params.offset ?? 0;

  let crQuery = db.select().from(selectAccProfitLossCr);
  let drQuery = db.select().from(selectAccProfitLossDr);

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
    amount: r.debitAmount !== null && r.debitAmount !== undefined ? String(r.debitAmount) : '0',
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
